import { db } from "$lib/server/db";
import * as table from '$lib/server/db/schema';
import type { RequestHandler } from "@sveltejs/kit"
import { sql } from 'drizzle-orm';


export const DELETE: RequestHandler = async ({ request, locals }) => {
    const statementIds = await request.json() as string[]

    if(!locals.user || !locals.session) return new Response("Unauthorized request", { status: 401 });

    statementIds.map(async (statementId) => {
        await db.delete(table.accountStatements).where(sql`
            ${table.accountStatements.userId} = ${locals?.user?.id}
            and ${table.accountStatements.id} = ${statementId}
        `)
    })

    return new Response(null, { status: 204 })
}