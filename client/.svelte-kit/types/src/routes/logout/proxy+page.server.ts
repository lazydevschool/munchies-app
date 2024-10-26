// @ts-nocheck
// client/src/routes/logout/+page.server.ts

import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies }: import('./$types').RequestEvent) => {
		// Delete the auth cookie
		cookies.delete('auth_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });

		// Redirect to the login page
		throw redirect(302, '/login');
	}
};
;null as any as Actions;