import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Cache for GitHub stars
let cachedStars: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

async function getGitHubStars(): Promise<number | null> {
    const now = Date.now();

    // Return cached value if still valid
    if (cachedStars !== null && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedStars;
    }

    try {
        const response = await fetch('https://api.github.com/repos/ErikAndreasKlokk/budgeting', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Budgeting-App'
            }
        });

        if (!response.ok) {
            return cachedStars; // Return stale cache on error
        }

        const data = await response.json();
        cachedStars = data.stargazers_count ?? null;
        cacheTimestamp = now;

        return cachedStars;
    } catch {
        return cachedStars; // Return stale cache on error
    }
}

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        redirect(302, '/dashboard');
    }

    const githubStars = await getGitHubStars();

    return {
        user: event.locals.user ?? null,
        githubStars
    };
};
