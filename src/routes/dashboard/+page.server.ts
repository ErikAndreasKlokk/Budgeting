import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Readable } from 'node:stream';
import Papa from 'papaparse';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq, sql, asc, and, or, count } from 'drizzle-orm';

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

export interface accountStatementFormat {
    statementId: number,
    dato: string,
    innPaaKonto: string | null,
    utFraKonto: string | null,
    type: string | null,
    tekst: string | null,
    hovedkategori: string | null,
    underkategori: string | null
}

interface categoryDataType {
    hovedkategori: string;
    underkategorier: {
        underkategori: string | null;
        statements: accountStatementFormat[];
        moneyIn: number; moneyOut: number;
    }[];
    statements: accountStatementFormat[];
    moneyIn: number;
    moneyOut: number;
}

const columnMap = {
    dato: table.accountStatements.dato,
    innPaaKonto: table.accountStatements.innPaaKonto,
    utFraKonto: table.accountStatements.utFraKonto,
    tekst: table.accountStatements.tekst,
    hovedkategori: table.accountStatements.hovedkategori,
    underkategori: table.accountStatements.underkategori
} as const;

export type SortKey = keyof typeof columnMap;
type SortDir = 'asc' | 'desc';

export const load: PageServerLoad = async (event) => {

    if (!event.locals.user) return;

    const url = event.url;
    const sortBy = (url.searchParams.get('sortBy') as SortKey) ?? 'dato';
    const sortDir = (url.searchParams.get('sortDir') as SortDir) ?? 'desc';
    const search = url.searchParams.get('search') ?? null;
    const paginationNumber = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 0;
    const perPageNumber = url.searchParams.get('perPage') ? Number(url.searchParams.get('perPage')) : 20;

    const col = columnMap[sortBy]!;
    let sortOrder;

    if (sortBy === 'innPaaKonto' || sortBy === 'utFraKonto') {
        const expr = sql`CAST(${col} AS numeric)`;
        sortOrder = sortDir === 'asc' ? asc(expr) : desc(expr);
    } else {
        sortOrder = sortDir === 'asc' ? asc(col) : desc(col);
    }

    const accountStatements = db.select({
        statementId: table.accountStatements.id,
        dato: table.accountStatements.dato,
        innPaaKonto: table.accountStatements.innPaaKonto,
        utFraKonto: table.accountStatements.utFraKonto,
        type: table.accountStatements.type,
        tekst: table.accountStatements.tekst,
        hovedkategori: table.accountStatements.hovedkategori,
        underkategori: table.accountStatements.underkategori
    })
    .from(table.accountStatements)
    .where(
        search ?
            and(
                eq(table.accountStatements.userId, event.locals.user.id),
                or(
                    sql`LOWER(${table.accountStatements.dato}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.innPaaKonto}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.utFraKonto}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.tekst}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.hovedkategori}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.underkategori}) LIKE LOWER(${`%${search}%`})`
                )
            )
            :
            eq(table.accountStatements.userId, event.locals.user.id)
    )
    .orderBy(sortOrder)
    .limit(perPageNumber)
    .offset(perPageNumber * paginationNumber);

    const accountStatementsCount = db.select({ count: count() })
    .from(table.accountStatements)
    .where(
        search ?
            and(
                eq(table.accountStatements.userId, event.locals.user.id),
                or(
                    sql`LOWER(${table.accountStatements.dato}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.innPaaKonto}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.utFraKonto}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.tekst}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.hovedkategori}) LIKE LOWER(${`%${search}%`})`,
                    sql`LOWER(${table.accountStatements.underkategori}) LIKE LOWER(${`%${search}%`})`
                )
            )
            :
            eq(table.accountStatements.userId, event.locals.user.id)
    )

    const hovedkategorier: string[] = []
    const underkategorier: string[] = []
    let kategoriData: categoryDataType[] = []

    const accountStatementsStatistics = db.select({
        statementId: table.accountStatements.id,
        dato: table.accountStatements.dato,
        innPaaKonto: table.accountStatements.innPaaKonto,
        utFraKonto: table.accountStatements.utFraKonto,
        type: table.accountStatements.type,
        tekst: table.accountStatements.tekst,
        hovedkategori: table.accountStatements.hovedkategori,
        underkategori: table.accountStatements.underkategori
    })
    .from(table.accountStatements)
    .where(eq(table.accountStatements.userId, event.locals.user.id));

    async function createStatistics() {
        let moneyIn = 0;
        let moneyOut = 0;

        (await accountStatementsStatistics).map((statement) => {
            moneyIn += Number(statement.innPaaKonto?.replace(",", "."))
            moneyOut += Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))

            if (statement.hovedkategori) {
                if (!hovedkategorier.includes(statement.hovedkategori)) {
                    hovedkategorier.push(statement.hovedkategori)
                }
                if (kategoriData.some(e => e.hovedkategori === statement.hovedkategori)) {
                    const newKategoriData = kategoriData.map((kategori) => {
                        if (kategori.hovedkategori === statement.hovedkategori) {
                            if (!kategori.underkategorier.some(e => e.underkategori === statement.underkategori)) {
                                kategori.underkategorier.push({
                                    underkategori: statement.underkategori,
                                    statements: [statement],
                                    moneyIn: Number(statement.innPaaKonto?.replace(",", ".")),
                                    moneyOut: Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))
                                })
                            } else {
                                kategori.underkategorier = kategori.underkategorier.map((underkategori) => {
                                    if (underkategori.underkategori === statement.underkategori) {
                                        underkategori.moneyIn += Number(statement.innPaaKonto?.replace(",", "."))
                                        underkategori.moneyOut += Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))
                                        underkategori.statements.push(statement)
                                    }
                                    return underkategori;
                                })
                            }
                            kategori.statements.push(statement)
                            kategori.moneyIn += Number(statement.innPaaKonto?.replace(",", "."))
                            kategori.moneyOut += Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))
                        }
                        return kategori;
                    })
                    kategoriData = newKategoriData;
                } else {
                    kategoriData.push(
                        {
                            hovedkategori: statement.hovedkategori,
                            underkategorier: [
                                {
                                    underkategori: statement.underkategori,
                                    statements: [statement],
                                    moneyIn: Number(statement.innPaaKonto?.replace(",", ".")),
                                    moneyOut: Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))
                                }
                            ],
                            statements: [statement],
                            moneyIn: Number(statement.innPaaKonto?.replace(",", ".")),
                            moneyOut: Number(statement.utFraKonto?.replace(",", ".").replace("-", ""))
                        }
                    );
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
            underkategorier: underkategorier,
            kategoriData: kategoriData
        }
    }

    return {
        user: event.locals.user,
        accountStatements: await accountStatements,
        statistics: await createStatistics(),
        accountStatementsCount: await accountStatementsCount
    };
};

export const actions: Actions = {
    uploadCsv: async (event) => {
        const formData = await event.request.formData();
        const csv = formData.get('csv');

        if (typeof csv !== "object" || !csv) {
            return fail(400, { csv, missing: true })
        }
        if (!event.locals.user?.id || !event.locals.session) {
            return fail(401, { incorrect: true })
        }

        const file = await csv.arrayBuffer();
        const stream = Readable.from(Buffer.from(file));
        const parsedCSV = await parseCSV(stream)

        try {
            parsedCSV.map(async (line) => {
                if (!event.locals.user?.id) return;
                
                if (!line.Dato) return fail(400, { message: "Atleast one line in the file is missing a date" });
                
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

                if (!line.Hovedkategori || line.Hovedkategori.trim() === "") line.Hovedkategori = "No category";
                if (!line.Underkategori || line.Underkategori.trim() === "") line.Underkategori = "No category";
                
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
        const formHovedkategori = formData.get("hovedkategori") as string | null
        const formUnderkategori = formData.get("underkategori") as string | null
        const formId = formData.get("id") as string
        const formIdJson = JSON.parse(formId) as Array<accountStatementFormat>

        if (!event.locals.user || !event.locals.session) return fail(401, { message: "Unauthorized request" });

        if (typeof formIdJson === "object") {
            formIdJson.map(async (statement) => {
                await db.update(table.accountStatements).set({
                    tekst: formTekst ? formTekst : statement.tekst,
                    hovedkategori: formHovedkategori ? formHovedkategori : statement.hovedkategori,
                    underkategori: formUnderkategori ? formUnderkategori : statement.underkategori
                }).where(sql`
                    ${table.accountStatements.userId} = ${event.locals.user?.id}
                    and ${table.accountStatements.id} = ${Number(statement.statementId)} 
                `).limit(1)
            })
            return { formTekst: formTekst, formHovedkategori: formHovedkategori, formUnderkategori: formUnderkategori, formId: JSON.stringify(formIdJson) }
        } else {
            await db.update(table.accountStatements).set({
                tekst: formTekst,
                hovedkategori: formHovedkategori,
                underkategori: formUnderkategori
            }).where(sql`
                ${table.accountStatements.userId} = ${event.locals.user.id}
                and ${table.accountStatements.id} = ${Number(formIdJson)} 
            `).limit(1)

            return { formTekst: formTekst, formHovedkategori: formHovedkategori, formUnderkategori: formUnderkategori, formId: formId }
        }
    }
} satisfies Actions;

const parseCSV = (stream: Readable): Promise<Array<csvBulderFormat>> => {
    return new Promise((resolve) => {
        Papa.parse(stream, { header: true, encoding: "utf-8", delimiter: ";", complete: (results) => { resolve(results.data as Array<csvBulderFormat>) } });
    });
};