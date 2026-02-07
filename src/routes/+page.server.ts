import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        redirect(302, '/dashboard');
    }

    return {
        user: event.locals.user?.username ?? null
    };
};
