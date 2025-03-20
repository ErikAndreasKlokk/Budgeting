import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Readable } from 'node:stream';
import Papa from 'papaparse';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface csvFormat {
    Dato: string,
    'Inn på konto': string,
    'Ut fra konto': string,
    'Til konto': string,
    'Til kontonummer': string,
    'Fra konto': string,
    'Fra kontonummer': string,
    Type: string,
    Tekst: string,
    KID: string,
    Hovedkategori: string,
    Underkategori: string
}

export const load: PageServerLoad = async (event) => {

    if (!event.locals.user) return;

    const accountStatements = await db.select({ 
            dato: table.accountStatements.dato,
            innPaaKonto: table.accountStatements.innPaaKonto,
            utFraKonto: table.accountStatements.utFraKonto,
            type: table.accountStatements.type,
            tekst: table.accountStatements.tekst,
            hovedkategori: table.accountStatements.hovedkategori,
            underkategori: table.accountStatements.underkategori
        }).from(table.accountStatements).where(eq(
            table.accountStatements.userId, event.locals.user.id, 
        ))

    const vippsTransactions = accountStatements.filter((statement) => 
        statement.tekst.includes("Fra:") || 
        statement.tekst.includes("Til:") || 
        statement.tekst.includes("Straksbetaling")
    )

    return { user: event.locals.user, accountStatements: accountStatements, vippsTransactions: vippsTransactions};
};

export const actions: Actions = {
    uploadCsv: async (event) => {
        const formData = await event.request.formData();
        const csv = formData.get('csv');

        if (typeof csv !== "object" || csv === null) {
            return fail(400, { message: 'Not a file'})
        }
        if (!event.locals.user?.id) {
            return fail(401, { message: 'Not logged in'})
        }

        const file = await csv.arrayBuffer();
        const stream = Readable.from(Buffer.from(file));
        const parsedCSV = await parseCSV(stream)

        console.log(parsedCSV)

        try {
            parsedCSV.forEach(async (line) => {
                if (!event.locals.user?.id || !line.Dato || !line.Type || !line.Tekst) return;

                await db.insert(table.accountStatements).values({ 
                    userId: event.locals.user.id, 
                    dato: new Date(line.Dato), 
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
    }
};

const parseCSV = (stream: Readable): Promise<Array<csvFormat>> => {
    return new Promise((resolve) => {
        Papa.parse(stream, { header: true, encoding: "utf-8", delimiter: ";", complete: (results) => {resolve(results.data as Array<csvFormat>)}});
    });
};