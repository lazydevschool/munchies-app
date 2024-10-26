// client/src/routes/logout/+page.server.ts

import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Delete the auth cookie
		cookies.delete('auth_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });

		// Redirect to the login page
		throw redirect(302, '/login');
	}
};
