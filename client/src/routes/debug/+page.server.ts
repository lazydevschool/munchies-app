// src/routes/debug/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, cookies, url }) => {
	try {
		// Fetch debug data from auth service
		const response = await fetch('http://auth-svc:3000/debug');
		if (!response.ok) {
			throw new Error('Failed to fetch debug data');
		}
		const authServiceDebugData = await response.json();

		// Local debug data
		const localDebugData = {
			cookies: {
				authToken: cookies.get('auth_token') ? 'present' : 'missing',
				refreshToken: cookies.get('refresh_token') ? 'present' : 'missing'
			},
			request: {
				url: url.pathname,
				timestamp: new Date().toISOString()
			}
		};

		// Return combined debug data
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
