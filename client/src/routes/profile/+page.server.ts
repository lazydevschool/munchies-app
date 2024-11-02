import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { fetchInterceptor } from '$lib/utils/fetchInterceptor';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const authToken = cookies.get('auth_token');
	const refreshToken = cookies.get('refresh_token');

	try {
		const response = await fetchInterceptor('http://auth-svc:3000/profile', {
			cookies: {
				auth_token: authToken!,
				refresh_token: refreshToken!
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Profile Error Response:', errorText);
			throw error(response.status, 'Failed to load profile');
		}

		const setCookieHeader = response.headers.get('Set-Cookie');
		if (setCookieHeader) {
			console.log('Updating cookies from response');
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

		const profile = await response.json();
		return { profile };
	} catch (err) {
		console.error('Profile Load Error:', err);
		throw error(500, 'Error loading profile data');
	}
};

export const actions: Actions = {
	update: async ({ request, cookies }) => {
		const authToken = cookies.get('auth_token');
		const refreshToken = cookies.get('refresh_token');

		try {
			const formData = await request.formData();
			const updates = Object.fromEntries(formData);

			const response = await fetchInterceptor('http://auth-svc:3000/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				cookies: {
					auth_token: authToken!,
					refresh_token: refreshToken!
				},
				body: JSON.stringify(updates)
			});

			// Update cookies from response if present
			const setCookieHeader = response.headers.get('Set-Cookie');
			if (setCookieHeader) {
				console.log('Profile update - Received new cookies');
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

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Profile update error:', errorText);
				throw error(response.status, 'Failed to update profile');
			}

			const updatedProfile = await response.json();
			return { success: true, profile: updatedProfile };
		} catch (err) {
			console.error('Error updating profile:', err);
			if (err instanceof error) throw err;
			throw error(500, 'Error updating profile');
		}
	}
};
