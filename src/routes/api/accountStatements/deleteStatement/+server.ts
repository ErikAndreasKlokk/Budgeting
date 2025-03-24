import { db } from "$lib/server/db";
import * as table from '$lib/server/db/schema';
import type { RequestHandler } from "@sveltejs/kit"
import { sql } from 'drizzle-orm';


export const DELETE: RequestHandler = async ({ request, locals }) => {
    const statement = await request.json()

    if(!locals.user || !locals.session) return new Response("Unauthorized request", { status: 401 });

    await db.delete(table.accountStatements).where(sql`
        ${table.accountStatements.userId} = ${locals.user.id}
        and ${table.accountStatements.id} = ${statement} 
    `).limit(1)

    return new Response(null, { status: 204 })
}