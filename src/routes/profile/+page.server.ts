import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Readable } from 'node:stream';
import Papa from 'papaparse';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

interface csvBulderFormat {
    Dato: string,
    'Inn på konto': string | null,
    'Ut fra konto': string | null,
    'Til konto': string | null,
    'Til kontonummer': string | null,
    'Fra konto': string | null,
    'Fra kontonummer': string | null,
    Type: string | null,
    Tekst: string | null,
    KID: string | null,
    Hovedkategori: string | null, 
    Underkategori: string | null
}

interface accountStatementFormat {
    dato: string,
    innPaaKonto: string | null,
    utFraKonto: string | null,
    type: string | null,
    tekst: string | null,
    hovedkategori: string | null,
    underkategori: string | null
}

export const load: PageServerLoad = async (event) => {

    if (!event.locals.user) return;

    const accountStatements = db.select({
            statementId: table.accountStatements.id,
            dato: table.accountStatements.dato,
            innPaaKonto: table.accountStatements.innPaaKonto,
            utFraKonto: table.accountStatements.utFraKonto,
            type: table.accountStatements.type,
            tekst: table.accountStatements.tekst,
            hovedkategori: table.accountStatements.hovedkategori,
            underkategori: table.accountStatements.underkategori
        }).from(table.accountStatements).where(eq(
            table.accountStatements.userId, event.locals.user.id, 
        )).orderBy(table.accountStatements.dato)
        
    let hovedkategorier: string[] = ["No category"]
    let underkategorier: string[] = ["No category"]

    function createStatistics(accountStatements: Array<accountStatementFormat>) {
        let moneyIn = 0
        let moneyOut = 0

        accountStatements.map((statement) => {
            moneyIn += Number(statement.innPaaKonto?.replace(",", "."))
            moneyOut += Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))

            if (statement.hovedkategori) {
                if (!hovedkategorier.includes(statement.hovedkategori)) {
                    hovedkategorier.push(statement.hovedkategori)
                }
            }
            if (statement.underkategori) {
                if (!underkategorier.includes(statement.underkategori)) {
                    underkategorier.push(statement.underkategori)
                }
            }
        }) 

        return { 
            moneyIn: moneyIn, 
            moneyOut: moneyOut, 
            hovedkategorier: hovedkategorier,
            underkategorier: underkategorier
        }
    }

    return { user: event.locals.user, accountStatements: await accountStatements, statistics: createStatistics(await accountStatements)};
};

export const actions: Actions = {
    uploadCsv: async (event) => {
        const formData = await event.request.formData();
        const csv = formData.get('csv');

        if (typeof csv !== "object" || !csv) {
            return fail(400, { csv, missing: true})
        }
        if (!event.locals.user?.id || !event.locals.session) {
            return fail(401, { incorrect: true})
        }

        const file = await csv.arrayBuffer();
        const stream = Readable.from(Buffer.from(file));
        const parsedCSV = await parseCSV(stream)

        try {
            parsedCSV.forEach(async (line) => {
                if (!event.locals.user?.id) return;

                if(!line.Dato) return fail(400, { message: "Atleast one line in the file is missing a date"});
                
                const accountStatement = await db.select({ 
                    dato: table.accountStatements.dato
                }).from(table.accountStatements).where(sql`
                    ${table.accountStatements.userId}             = ${event.locals.user.id}
                    and ${table.accountStatements.dato}           = ${line.Dato} 
                    and ${table.accountStatements.innPaaKonto}    = ${line['Inn på konto']}
                    and ${table.accountStatements.utFraKonto}     = ${line['Ut fra konto']}
                    and ${table.accountStatements.tilKonto}       = ${line['Til konto']}
                    and ${table.accountStatements.tilKontonummer} = ${line['Til kontonummer']}
                    and ${table.accountStatements.fraKonto}       = ${line['Fra konto']}
                    and ${table.accountStatements.fraKontonummer} = ${line['Fra kontonummer']}
                    and ${table.accountStatements.type}           = ${line.Type}
                    and ${table.accountStatements.kid}            = ${line.KID}
                `).limit(1);
                    
                if (accountStatement.length !== 0) return;

                await db.insert(table.accountStatements).values({ 
                    userId: event.locals.user.id, 
                    dato: line.Dato, 
                    innPaaKonto: line['Inn på konto'],
                    utFraKonto: line['Ut fra konto'],
                    tilKonto: line['Til konto'],
                    tilKontonummer: line['Til kontonummer'],
                    fraKonto: line['Fra konto'],
                    fraKontonummer: line['Fra kontonummer'],
                    type: line.Type, 
                    tekst: line.Tekst,
                    kid: line.KID,
                    hovedkategori: line.Hovedkategori,
                    underkategori: line.Underkategori
                })
            })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return fail(500, { message: 'An error has occurred' });
        }
    },
    editStatement: async (event) => {
        const formData = await event.request.formData();
        const formTekst = formData.get("text") as string | null
        let formHovedkategori = formData.get("hovedkategori") as string | null
        let formUnderkategori = formData.get("underkategori") as string | null
        const formId = formData.get("id") as string

        if(!event.locals.user || !event.locals.session) return fail(401, { message: "Unauthorized request" });

        console.log(formData)

        if (formHovedkategori?.includes("No category")) {
            formHovedkategori = null
        }
        if (formUnderkategori?.includes("No category")) {
            formUnderkategori = null
        }


        await db.update(table.accountStatements).set({ 
            tekst: formTekst, 
            hovedkategori: formHovedkategori, 
            underkategori: formUnderkategori
        }).where(sql`
            ${table.accountStatements.userId} = ${event.locals.user.id}
            and ${table.accountStatements.id} = ${Number(formId)} 
        `).limit(1)
    }
} satisfies Actions;

const parseCSV = (stream: Readable): Promise<Array<csvBulderFormat>> => {
    return new Promise((resolve) => {
        Papa.parse(stream, { header: true, encoding: "utf-8", delimiter: ";", complete: (results) => {resolve(results.data as Array<csvBulderFormat>)}});
    });
};