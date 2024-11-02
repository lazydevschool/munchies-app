import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/authStore';

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
	console.log('Attempting to refresh tokens with cookies:', currentCookies);

	try {
		const response = await fetch('http://auth-svc:3000/auth/refresh', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Cookie: currentCookies ? `refresh_token=${currentCookies.refresh_token}` : ''
			}
		});

		console.log('Refresh response status:', response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Refresh failed:', errorText);
			throw new Error('Token refresh failed');
		}

		const setCookieHeader = response.headers.get('Set-Cookie');
		if (!setCookieHeader) {
			throw new Error('No cookies received from refresh');
		}

		return {
			success: true,
			cookies: setCookieHeader
		};
	} catch (error) {
		console.error('Error during refresh:', error);
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
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				});
			}

			isRefreshing = true;

			try {
				const refreshResult = await refreshTokens(currentCookies);
				const newCookies = parseCookies(refreshResult.cookies);
				processQueue(null, refreshResult.cookies);

				// Create new request with refreshed tokens
				const newResponse = await fetch(input, {
					...requestInit,
					headers: {
						...requestInit.headers,
						Cookie: Object.entries(newCookies)
							.map(([name, value]) => `${name}=${value}`)
							.join('; ')
					}
				});

				// Return response with new cookies in headers
				const modifiedResponse = new Response(newResponse.body, {
					status: newResponse.status,
					statusText: newResponse.statusText,
					headers: new Headers({
						...Object.fromEntries(newResponse.headers.entries()),
						'Set-Cookie': refreshResult.cookies
					})
				});

				return modifiedResponse;
			} catch (error) {
				processQueue(error, null);
				throw error;
			} finally {
				isRefreshing = false;
			}
		}

		return response;
	} catch (error) {
		console.error('FetchInterceptor error:', error);
		throw error;
	}
}
