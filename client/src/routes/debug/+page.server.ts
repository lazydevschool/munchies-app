// src/routes/debug/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchInterceptor } from '$lib/utils/fetchInterceptor';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
	try {
		const authToken = cookies.get('auth_token');
		const refreshToken = cookies.get('refresh_token');

		console.log('Debug route - Initial tokens:', {
			authToken: authToken ? 'present' : 'missing',
			refreshToken: refreshToken ? 'present' : 'missing'
		});

		// Fetch debug data from auth service using the interceptor
		const response = await fetchInterceptor('http://auth-svc:3000/debug', {
			cookies: {
				auth_token: authToken!,
				refresh_token: refreshToken!
			}
		});

		if (!response.ok) {
			console.error('Debug route - Failed to fetch:', response.status);
			throw new Error('Failed to fetch debug data');
		}

		// Update cookies from response if present
		const setCookieHeader = response.headers.get('Set-Cookie');
		if (setCookieHeader) {
			console.log('Debug route - Updating cookies from response');
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

		const authServiceDebugData = await response.json();

		// Get updated cookie values after potential refresh
		const updatedAuthToken = cookies.get('auth_token');
		const updatedRefreshToken = cookies.get('refresh_token');

		// Local debug data with enhanced cookie information
		const localDebugData = {
			cookies: {
				authToken: {
					present: updatedAuthToken ? 'present' : 'missing',
					value: updatedAuthToken?.split('.')[0] || 'none', // Just show first part for safety
					changed: updatedAuthToken !== authToken
				},
				refreshToken: {
					present: updatedRefreshToken ? 'present' : 'missing',
					value: updatedRefreshToken?.split('.')[0] || 'none',
					changed: updatedRefreshToken !== refreshToken
				}
			},
			request: {
				url: url.pathname,
				timestamp: new Date().toISOString()
			},
			lastUpdate: {
				timestamp: new Date().toISOString(),
				cookiesUpdated: !!setCookieHeader
			}
		};

		console.log('Debug route - Final tokens:', {
			authToken: updatedAuthToken ? 'present' : 'missing',
			refreshToken: updatedRefreshToken ? 'present' : 'missing',
			cookiesUpdated: !!setCookieHeader
		});

		return {
			debugData: {
				authService: authServiceDebugData,
				local: localDebugData
			}
		};
	} catch (err) {
		console.error('Debug page error:', err);
		throw error(500, 'Error fetching debug data');
	}
};
