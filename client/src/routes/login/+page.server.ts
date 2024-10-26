// client/src/routes/login/+page.server.ts

import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from '@sveltejs/kit';

const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = Object.fromEntries(await request.formData());

		try {
			// validate input
			const { username, password } = loginSchema.parse(data);

			// contact auth service
			const response = await fetch('http://auth-svc:3000/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return fail(response.status, { message: errorData.message || 'Login failed' });
			}

			const setCookieHeader = response.headers.get('Set-Cookie');
			if (!setCookieHeader) {
				return fail(400, { message: 'No cookies set' });
			}

			setCookieHeader.split(',').forEach((cookie) => {
				const [name, ...rest] = cookie.split('=');
				cookies.set(name.trim(), rest.join('=').trim(), { path: '/' });
			});

			// redirect to a protected route
			return {
				success: true,
				message: 'Login successful',
				redirectTo: '/profile'
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				return fail(400, {
					message: 'Invalid input',
					errors: error.errors.map((e) => e.message)
				});
			}

			console.error('Login error:', error);
			return fail(500, { message: 'An unexpected error occurred.' });
		}
	}
};
