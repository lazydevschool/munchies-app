// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { fetchInterceptor } from '$lib/utils/fetchInterceptor';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const authToken = cookies.get('auth_token');
	const refreshToken = cookies.get('refresh_token');
	const isAuthenticated = !!authToken;

	console.log('Layout load - Initial tokens:', {
		authToken: authToken ? 'present' : 'missing',
		refreshToken: refreshToken ? 'present' : 'missing'
	});

	const protectedRoutes = ['/profile', '/dashboard', '/debug'];
	const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

	if (isProtectedRoute) {
		if (!isAuthenticated && !refreshToken) {
			console.log('No tokens present, redirecting to login');
			throw redirect(303, '/login');
		}

		try {
			console.log('Verifying token...');
			const response = await fetchInterceptor('http://auth-svc:3000/auth/verify', {
				method: 'POST',
				cookies: {
					auth_token: authToken!,
					refresh_token: refreshToken!
				}
			});

			// Handle cookie updates first
			const setCookieHeader = response.headers.get('Set-Cookie');
			if (setCookieHeader) {
				console.log('Layout load - Updating cookies from verify/refresh');
				setCookieHeader.split(',').forEach((cookie) => {
					const [name, ...rest] = cookie.split('=');
					const cookieValue = rest.join('=').split(';')[0].trim();
					cookies.set(name.trim(), cookieValue, {
						path: '/',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'strict'
					});
				});
			}

			// Then check response status
			if (!response.ok) {
				console.log('Verify failed:', response.status);
				cookies.delete('auth_token', { path: '/' });
				cookies.delete('refresh_token', { path: '/' });
				throw redirect(303, '/login');
			}

			const userData = await response.json();
			console.log('Verify successful:', userData);

			// Get updated token values
			const updatedAuthToken = cookies.get('auth_token');
			const updatedRefreshToken = cookies.get('refresh_token');

			console.log('Layout load - Final tokens:', {
				authToken: updatedAuthToken ? 'present' : 'missing',
				refreshToken: updatedRefreshToken ? 'present' : 'missing'
			});

			return {
				authenticated: true,
				user: { username: userData.username }
			};
		} catch (error) {
			console.error('Layout load error:', error);
			if (error instanceof redirect) throw error;

			cookies.delete('auth_token', { path: '/' });
			cookies.delete('refresh_token', { path: '/' });
			throw redirect(303, '/login');
		}
	}

	return {
		authenticated: isAuthenticated
	};
};
