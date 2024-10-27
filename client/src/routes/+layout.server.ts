// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const authToken = cookies.get('auth_token');
	const refreshToken = cookies.get('refresh_token');
	const isAuthenticated = !!authToken;

	// Define protected routes
	const protectedRoutes = ['/profile', '/dashboard', '/debug'];
	const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

	// If on protected route and authenticated, verify token and get user data
	if (isProtectedRoute) {
		if (!isAuthenticated) {
			throw redirect(303, '/login');
		}

		try {
			const response = await fetch('http://auth-svc:3000/auth/verify', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Cookie: `auth_token=${authToken}; refresh_token=${refreshToken}`
				}
			});

			// Check both status and valid flag
			if (!response.ok || response.status === 401) {
				console.log('Token invalid or expired, redirecting to login');
				cookies.delete('auth_token', { path: '/' });
				cookies.delete('refresh_token', { path: '/' });
				throw redirect(303, '/login');
			}

			const userData = await response.json();

			console.log('userData', {
				authenticated: true,
				user: { username: userData.username }
			});

			return {
				authenticated: true,
				user: { username: userData.username }
			};
		} catch (error) {
			if (error instanceof redirect) throw error;
			console.error('Verify error:', error);
			throw redirect(303, '/login');
		}
	}

	// For non-protected routes, just return authentication state
	return {
		authenticated: isAuthenticated
	};
};
