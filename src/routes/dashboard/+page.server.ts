import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Readable } from 'node:stream';
import Papa from 'papaparse';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq, sql, asc, and, or, count, lte, gte } from 'drizzle-orm';

interface csvBulderFormat {
    Dato: string,
    'Beløp': string | null,
    'Originalt Beløp': string | null,
    'Original Valuta': string | null,
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

interface csvDnbFormat {
    Dato: string,
    Forklaring: string | null,
    Rentedato: string | null,
    'Ut fra konto': string | null,
    'Inn på konto': string | null
}

export interface accountStatementFormat {
    statementId: number,
    dato: Date,
    belop: number | null,
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
    belop: table.accountStatements.belop,
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
    const tableDateRangeFrom = url.searchParams.get('tableDateRangeFrom') ? new Date(url.searchParams.get('tableDateRangeFrom')!) : null
    const tableDateRangeTo = url.searchParams.get('tableDateRangeTo') ? new Date(url.searchParams.get('tableDateRangeTo')!) : null

    // Get the most recent date with data to use as default
    const latestDateResult = await db.select({
        latestDate: sql<Date>`MAX(${table.accountStatements.dato})`
    })
    .from(table.accountStatements)
    .where(eq(table.accountStatements.userId, event.locals.user.id));

    const latestDate = latestDateResult[0]?.latestDate ? new Date(latestDateResult[0].latestDate) : new Date();
    const defaultFromDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1); // First day of the month with latest data
    const defaultToDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0); // Last day of the month with latest data

    const cardsDateRangeFrom = url.searchParams.get('cardsDateRangeFrom') ? new Date(url.searchParams.get('cardsDateRangeFrom')!) : defaultFromDate
    const cardsDateRangeTo = url.searchParams.get('cardsDateRangeTo') ? new Date(url.searchParams.get('cardsDateRangeTo')!) : defaultToDate

    // Calculate previous period for month-over-month comparison
    const periodDuration = cardsDateRangeTo.getTime() - cardsDateRangeFrom.getTime();
    const previousPeriodTo = new Date(cardsDateRangeFrom.getTime() - 1); // Day before current period starts
    const previousPeriodFrom = new Date(previousPeriodTo.getTime() - periodDuration);

    const col = columnMap[sortBy]!;
    let sortOrder;

    if (sortBy === 'belop') {
        // Use COALESCE to put NULL values last for both ASC and DESC
        const expr = sortDir === 'desc'
            ? sql`COALESCE(${col}, -999999999999)`  // Small value so NULLs sort last in DESC
            : sql`COALESCE(${col}, 999999999999)`;   // Large value so NULLs sort last in ASC
        sortOrder = sortDir === 'asc' ? asc(expr) : desc(expr);
    } else {
        sortOrder = sortDir === 'asc' ? asc(col) : desc(col);
    }

    const accountStatements = db.select({
        statementId: table.accountStatements.id,
        dato: table.accountStatements.dato,
        belop: table.accountStatements.belop,
        type: table.accountStatements.type,
        tekst: table.accountStatements.tekst,
        hovedkategori: table.accountStatements.hovedkategori,
        underkategori: table.accountStatements.underkategori
    })
    .from(table.accountStatements)
    .where(
        and(
            eq(table.accountStatements.userId, event.locals.user.id),

            search ? or(
                        sql`LOWER(CAST(${table.accountStatements.dato} AS TEXT)) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(CAST(${table.accountStatements.belop} AS TEXT)) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(${table.accountStatements.tekst}) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(${table.accountStatements.hovedkategori}) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(${table.accountStatements.underkategori}) LIKE LOWER(${`%${search}%`})`
                    )
            : eq(table.accountStatements.userId, event.locals.user.id),

            tableDateRangeTo && tableDateRangeFrom ?
            lte(table.accountStatements.dato, tableDateRangeTo)
            : eq(table.accountStatements.userId, event.locals.user.id),

            tableDateRangeTo && tableDateRangeFrom ?
            gte(table.accountStatements.dato, tableDateRangeFrom)
            : eq(table.accountStatements.userId, event.locals.user.id),

        )
    )
    .orderBy(sortOrder)
    .limit(perPageNumber)
    .offset(perPageNumber * paginationNumber);

    const accountStatementsCount = db.select({ count: count() })
    .from(table.accountStatements)
    .where(
         and(
            eq(table.accountStatements.userId, event.locals.user.id),

            search ? or(
                        sql`LOWER(CAST(${table.accountStatements.dato} AS TEXT)) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(CAST(${table.accountStatements.belop} AS TEXT)) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(${table.accountStatements.tekst}) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(${table.accountStatements.hovedkategori}) LIKE LOWER(${`%${search}%`})`,
                        sql`LOWER(${table.accountStatements.underkategori}) LIKE LOWER(${`%${search}%`})`
                    )
            : eq(table.accountStatements.userId, event.locals.user.id),

            tableDateRangeTo && tableDateRangeFrom ?
            lte(table.accountStatements.dato, tableDateRangeTo)
            : eq(table.accountStatements.userId, event.locals.user.id),

            tableDateRangeTo && tableDateRangeFrom ?
            gte(table.accountStatements.dato, tableDateRangeFrom)
            : eq(table.accountStatements.userId, event.locals.user.id),

        )
    )

    const hovedkategorier: string[] = []
    const underkategorier: string[] = []
    let kategoriData: categoryDataType[] = []

    const accountStatementsStatistics = db.select({
        statementId: table.accountStatements.id,
        dato: table.accountStatements.dato,
        belop: table.accountStatements.belop,
        type: table.accountStatements.type,
        tekst: table.accountStatements.tekst,
        hovedkategori: table.accountStatements.hovedkategori,
        underkategori: table.accountStatements.underkategori
    })
    .from(table.accountStatements)
    .where(
        and(
            eq(table.accountStatements.userId, event.locals.user.id),

            cardsDateRangeTo && cardsDateRangeFrom ?
            lte(table.accountStatements.dato, cardsDateRangeTo)
            : eq(table.accountStatements.userId, event.locals.user.id),

            cardsDateRangeTo && cardsDateRangeFrom ?
            gte(table.accountStatements.dato, cardsDateRangeFrom)
            : eq(table.accountStatements.userId, event.locals.user.id),
        )
    );

    // Query for previous period statistics (for month-over-month comparison)
    const previousPeriodStatistics = db.select({
        belop: table.accountStatements.belop,
    })
    .from(table.accountStatements)
    .where(
        and(
            eq(table.accountStatements.userId, event.locals.user.id),
            lte(table.accountStatements.dato, previousPeriodTo),
            gte(table.accountStatements.dato, previousPeriodFrom),
        )
    );

    async function createStatistics() {
        let moneyIn = 0;
        let moneyOut = 0;
        let previousMoneyIn = 0;
        let previousMoneyOut = 0;

        // Calculate previous period totals
        (await previousPeriodStatistics).forEach((statement) => {
            const amount = statement.belop ?? 0;
            if (amount > 0) {
                previousMoneyIn += amount;
            } else {
                previousMoneyOut += Math.abs(amount);
            }
        });

        (await accountStatementsStatistics).map((statement) => {
            const amount = statement.belop ?? 0;
            if (amount > 0) {
                moneyIn += amount;
            } else {
                moneyOut += Math.abs(amount);
            }

            if (statement.hovedkategori) {
                if (!hovedkategorier.includes(statement.hovedkategori)) {
                    hovedkategorier.push(statement.hovedkategori)
                }
                
                // Calculate moneyIn/moneyOut from belop
                const calcMoneyIn = amount > 0 ? amount : 0;
                const calcMoneyOut = amount < 0 ? Math.abs(amount) : 0;
                
                if (kategoriData.some(e => e.hovedkategori === statement.hovedkategori)) {
                    const newKategoriData = kategoriData.map((kategori) => {
                        if (kategori.hovedkategori === statement.hovedkategori) {
                            if (!kategori.underkategorier.some(e => e.underkategori === statement.underkategori)) {
                                kategori.underkategorier.push({
                                    underkategori: statement.underkategori,
                                    statements: [statement],
                                    moneyIn: calcMoneyIn,
                                    moneyOut: calcMoneyOut
                                })
                            } else {
                                kategori.underkategorier = kategori.underkategorier.map((underkategori) => {
                                    if (underkategori.underkategori === statement.underkategori) {
                                        underkategori.moneyIn += calcMoneyIn
                                        underkategori.moneyOut += calcMoneyOut
                                        underkategori.statements.push(statement)
                                    }
                                    return underkategori;
                                })
                            }
                            kategori.statements.push(statement)
                            kategori.moneyIn += calcMoneyIn
                            kategori.moneyOut += calcMoneyOut
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
                                    moneyIn: calcMoneyIn,
                                    moneyOut: calcMoneyOut
                                }
                            ],
                            statements: [statement],
                            moneyIn: calcMoneyIn,
                            moneyOut: calcMoneyOut
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
            previousMoneyIn: previousMoneyIn,
            previousMoneyOut: previousMoneyOut,
            hovedkategorier: hovedkategorier,
            underkategorier: underkategorier,
            kategoriData: kategoriData
        }
    }

    return {
        user: event.locals.user,
        statistics: createStatistics(),
        accountStatementsCount: await accountStatementsCount,
        accountStatements: await accountStatements,
        defaultDateRange: {
            from: defaultFromDate,
            to: defaultToDate
        }
    };
};

export const actions: Actions = {
    uploadCsv: async (event) => {
        const formData = await event.request.formData();
        const csv = formData.get('csv');
        const bank = formData.get('bank') as string || 'bulder';

        if (typeof csv !== "object" || !csv) {
            return fail(400, { csv, missing: true })
        }
        if (!event.locals.user?.id || !event.locals.session) {
            return fail(401, { incorrect: true })
        }

        const file = await csv.arrayBuffer();
        const stream = Readable.from(Buffer.from(file));

        // Parse CSV based on bank selection
        if (bank === 'bulder') {
            const parsedCSV = await parseCSV(stream)
        try {
            parsedCSV.map(async (line) => {
                if (!event.locals.user?.id) return;
                
                if (!line.Dato) return fail(400, { message: "Atleast one line in the file is missing a date" });
                
                // Convert Beløp string to number (European format uses comma as decimal separator)
                const belopNumber = line['Beløp'] ? parseFloat(line['Beløp'].replace(',', '.')) : null;
                
                const accountStatement = await db.select({
                    dato: table.accountStatements.dato
                }).from(table.accountStatements).where(sql`
                    ${table.accountStatements.userId}             = ${event.locals.user.id}
                    and ${table.accountStatements.dato}           = ${new Date(line.Dato).toISOString()} 
                    and ${table.accountStatements.belop}          IS NOT DISTINCT FROM ${belopNumber}
                    and ${table.accountStatements.tilKonto}       IS NOT DISTINCT FROM ${line['Til konto'] || null}
                    and ${table.accountStatements.tilKontonummer} IS NOT DISTINCT FROM ${line['Til kontonummer'] || null}
                    and ${table.accountStatements.fraKonto}       IS NOT DISTINCT FROM ${line['Fra konto'] || null}
                    and ${table.accountStatements.fraKontonummer} IS NOT DISTINCT FROM ${line['Fra kontonummer'] || null}
                    and ${table.accountStatements.type}           IS NOT DISTINCT FROM ${line.Type || null}
                    and ${table.accountStatements.kid}            IS NOT DISTINCT FROM ${line.KID || null}
                `).limit(1);

                if (accountStatement.length !== 0) return; 

                if (!line.Hovedkategori || line.Hovedkategori.trim() === "") line.Hovedkategori = "No category";
                if (!line.Underkategori || line.Underkategori.trim() === "") line.Underkategori = "No category";
                
                await db.insert(table.accountStatements).values({
                    userId: event.locals.user.id,
                    dato: new Date(line.Dato),
                    belop: belopNumber,
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
        } else if (bank === 'dnb') {
            // DNB CSV format:
            // "Dato";"Forklaring";"Rentedato";"Ut fra konto";"Inn på konto"
            // Date format: DD.MM.YYYY
            const parsedCSV = await parseCSVDnb(stream);
            try {
                parsedCSV.map(async (line) => {
                    if (!event.locals.user?.id) return;

                    if (!line.Dato) return fail(400, { message: "Atleast one line in the file is missing a date" });

                    // Parse DD.MM.YYYY date format
                    const dateParts = line.Dato.split('.');
                    const parsedDate = new Date(
                        parseInt(dateParts[2]), // year
                        parseInt(dateParts[1]) - 1, // month (0-indexed)
                        parseInt(dateParts[0]) // day
                    );

                    // Convert DNB format to belop: Inn på konto is positive, Ut fra konto is negative
                    let belopNumber: number | null = null;
                    if (line['Inn på konto']) {
                        belopNumber = parseFloat(line['Inn på konto'].replace(',', '.').replace(/\s/g, ''));
                    } else if (line['Ut fra konto']) {
                        // Ut fra konto values are already negative or should be made negative
                        const parsed = parseFloat(line['Ut fra konto'].replace(',', '.').replace(/\s/g, ''));
                        belopNumber = parsed > 0 ? -parsed : parsed;
                    }

                    // Check for duplicate entries
                    const accountStatement = await db.select({
                        dato: table.accountStatements.dato
                    }).from(table.accountStatements).where(sql`
                        ${table.accountStatements.userId}         = ${event.locals.user.id}
                        and ${table.accountStatements.dato}       = ${parsedDate.toISOString()}
                        and ${table.accountStatements.belop}      IS NOT DISTINCT FROM ${belopNumber}
                        and ${table.accountStatements.tekst}      IS NOT DISTINCT FROM ${line.Forklaring?.trim() || null}
                    `).limit(1);

                    if (accountStatement.length !== 0) return;

                    await db.insert(table.accountStatements).values({
                        userId: event.locals.user.id,
                        dato: parsedDate,
                        belop: belopNumber,
                        tilKonto: null,
                        tilKontonummer: null,
                        fraKonto: null,
                        fraKontonummer: null,
                        type: null,
                        tekst: line.Forklaring?.trim() || null,
                        kid: null,
                        hovedkategori: "No category",
                        underkategori: "No category"
                    });
                });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                return fail(500, { message: 'An error has occurred' });
            }
        }

        // Add more bank parsers here as needed
        // else if (bank === 'other_bank') { ... }
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
                `)
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
            `)

            return { formTekst: formTekst, formHovedkategori: formHovedkategori, formUnderkategori: formUnderkategori, formId: formId }
        }
    }
} satisfies Actions;

const parseCSV = (stream: Readable): Promise<Array<csvBulderFormat>> => {
    return new Promise((resolve) => {
        Papa.parse(stream, { header: true, encoding: "utf-8", delimiter: ";", complete: (results) => { resolve(results.data as Array<csvBulderFormat>) } });
    });
};

const parseCSVDnb = (stream: Readable): Promise<Array<csvDnbFormat>> => {
    return new Promise((resolve) => {
        Papa.parse(stream, { header: true, encoding: "utf-8", delimiter: ";", complete: (results) => { resolve(results.data as Array<csvDnbFormat>) } });
    });
};