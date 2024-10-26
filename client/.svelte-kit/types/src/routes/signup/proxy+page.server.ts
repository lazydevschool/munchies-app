// @ts-nocheck
// src/routes/signup/+page.server.ts
import type { Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }: import('./$types').RequestEvent) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		// Server-side validation
		if (!username || username.length < 3) {
			return fail(400, { message: 'Username must be at least 3 characters.' });
		}
		if (!password || password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters.' });
		}

		try {
			const response = await fetch('http://auth-svc:3000/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			const responseText = await response.text();
			console.log('Response status:', response.status);
			console.log('Response body:', responseText);

			if (response.ok) {
				// Return a success response instead of throwing a redirect
				return { success: true, message: 'Signup successful' };
			} else {
				try {
					const errorData = JSON.parse(responseText);
					return fail(response.status, { message: errorData.message });
				} catch (parseError) {
					console.error('Error parsing response:', parseError);
					return fail(500, { message: 'Error parsing server response.' });
				}
			}
		} catch (error) {
			console.error('Signup error:', error);
			return fail(500, { message: 'An unexpected error occurred.' });
		}
	}
};
;null as any as Actions;