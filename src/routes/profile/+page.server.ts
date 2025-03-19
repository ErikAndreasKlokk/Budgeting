import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    return { user: event.locals.user };
};

export const actions: Actions = {
    uploadCsv: async (event) => {
        const formData = await event.request.formData();
        const csv = formData.get('csv');

        if (!validateCsv(csv)) {
            return fail(400, { messsage: 'Incorrectly formatted .csv file' })
        }

        const csvToJSON = csvJSON(csv)
        console.log(csvToJSON)
    }
};

function csvJSON(csv: string, quoteChar = '"', delimiter = ',') {
    const rows=csv.split("\n");
    const headers=rows[0].split(",");

    const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gs');
    
    //@ts-expect-error .shift() might return undefined, therefore you cant use matchAll
    const match = line => [...line.matchAll(regex)]
      .map(m => m[2]) 
      .slice(0, -1); 
  
    let lines = csv.split('\n');
    const heads = headers ?? match(lines.shift());
    lines = lines.slice(1);
    
    return lines.map(line => {
      return match(line).reduce((acc, cur, i) => {
        // replace blank matches with `null`
        const val = cur.length <= 0 ? null : Number(cur) || cur;
        const key = heads[i] ?? `{i}`;
        return { ...acc, [key]: val };
      }, {});
    });
  }

function validateCsv(csv: unknown): csv is string {
    return typeof csv === 'string' && csv !== null && csv !== undefined
}