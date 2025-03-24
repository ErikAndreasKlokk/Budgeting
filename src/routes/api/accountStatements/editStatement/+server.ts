import { db } from "$lib/server/db";
import * as table from '$lib/server/db/schema';
import type { RequestHandler } from "@sveltejs/kit"
import { sql } from 'drizzle-orm';


export const PATCH: RequestHandler = async ({ request, locals }) => {
    const statement = await request.json()

    if(!locals.user || !locals.session) return new Response("Unauthorized request", { status: 401 });
    
    await db.update(table.accountStatements).set({ 
        tekst: statement.tekst, 
        hovedkategori: statement.hovedkategori, 
        underkategori: statement.underkategori 
    }).where(sql`
        ${table.accountStatements.userId} = ${locals.user.id}
        and ${table.accountStatements.id} = ${statement.id} 
    `).limit(1)

    return new Response(null, { status: 204 })
}