import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/authStore';
import { parseJwt } from './tokenUtils';

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: any) => void;
	reject: (error: any) => void;
}> = [];

function processQueue(error: any, cookies: string | null = null) {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(cookies);
		}
	});
	failedQueue = [];
}

function parseCookies(cookieString: string): Record<string, string> {
	return cookieString
		.split(',')
		.map((cookie) => cookie.trim().split(';')[0]) // Get first part of each cookie
		.reduce(
			(acc, cookie) => {
				const [name, ...rest] = cookie.split('=');
				acc[name.trim()] = rest.join('=').trim();
				return acc;
			},
			{} as Record<string, string>
		);
}

async function refreshTokens(currentCookies?: Record<string, string>) {
	console.log('🔄 Starting token refresh with cookies:', currentCookies);

	try {
		const response = await fetch('http://auth-svc:3000/auth/refresh', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Cookie: currentCookies ? `refresh_token=${currentCookies.refresh_token}` : ''
			}
		});

		console.log('📥 Refresh response status:', response.status);

		if (!response.ok) {
			throw new Error('Token refresh failed');
		}

		const setCookieHeader = response.headers.get('Set-Cookie');
		if (!setCookieHeader) {
			throw new Error('No cookies received from refresh');
		}

		// Parse the new cookies
		const newCookies = parseCookies(setCookieHeader);

		return {
			success: true,
			cookies: newCookies,
			rawCookies: setCookieHeader
		};
	} catch (error) {
		console.error('❌ Refresh failed:', error);
		throw error;
	}
}

export async function fetchInterceptor(
	input: RequestInfo | URL,
	init?: RequestInit & { cookies?: Record<string, string> }
): Promise<Response> {
	const requestInit = { ...init };
	const currentCookies = init?.cookies || {};

	try {
		let response = await fetch(input, {
			...requestInit,
			headers: {
				...requestInit.headers,
				Cookie: Object.entries(currentCookies)
					.map(([name, value]) => `${name}=${value}`)
					.join('; ')
			}
		});

		if (response.status === 401 && currentCookies.refresh_token) {
			console.log('🔄 Got 401, attempting refresh');

			const refreshResult = await refreshTokens(currentCookies);

			// Retry the original request with new tokens
			const retryResponse = await fetch(input, {
				...requestInit,
				headers: {
					...requestInit.headers,
					Cookie: Object.entries(refreshResult.cookies)
						.map(([name, value]) => `${name}=${value}`)
						.join('; ')
				}
			});

			// Create a new response with the refresh cookies
			const finalResponse = new Response(retryResponse.body, {
				status: retryResponse.status,
				statusText: retryResponse.statusText,
				headers: new Headers({
					...Object.fromEntries(retryResponse.headers.entries()),
					'Set-Cookie': refreshResult.rawCookies
				})
			});

			return finalResponse;
		}

		return response;
	} catch (error) {
		console.error('❌ fetchInterceptor error:', error);
		throw error;
	}
}
