// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { fetchInterceptor } from '$lib/utils/fetchInterceptor';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const authToken = cookies.get('auth_token');
	const refreshToken = cookies.get('refresh_token');
	const isAuthenticated = !!authToken;

	console.log('📝 Layout load - Token status:', {
		authToken: authToken ? 'present' : 'missing',
		refreshToken: refreshToken ? 'present' : 'missing',
		path: url.pathname
	});

	const protectedRoutes = ['/profile', '/dashboard', '/debug'];
	const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

	if (isProtectedRoute) {
		if (!isAuthenticated && !refreshToken) {
			console.log('No tokens present, redirecting to login');
			throw redirect(303, '/login');
		}

		try {
			const response = await fetchInterceptor('http://auth-svc:3000/auth/verify', {
				method: 'POST',
				cookies: {
					auth_token: authToken!,
					refresh_token: refreshToken!
				}
			});

			const setCookieHeader = response.headers.get('Set-Cookie');
			if (setCookieHeader) {
				console.log('Layout load - Received new cookies');
				setCookieHeader.split(',').forEach((cookie) => {
					const [name, ...rest] = cookie.split('=');
					const value = rest.join('=').split(';')[0].trim();
					cookies.set(name.trim(), value, {
						path: '/',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'strict'
					});
				});
			}

			if (!response.ok) {
				throw new Error('Verification failed');
			}

			const userData = await response.json();
			return {
				authenticated: true,
				user: { username: userData.username }
			};
		} catch (error) {
			console.error('Layout load error:', error);
			cookies.delete('auth_token', { path: '/' });
			cookies.delete('refresh_token', { path: '/' });
			throw redirect(303, '/login');
		}
	}

	return {
		authenticated: isAuthenticated
	};
};
