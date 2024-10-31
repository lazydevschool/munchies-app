import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const authToken = cookies.get('auth_token');
	const refreshToken = cookies.get('refresh_token');

	console.log('Profile Load - Tokens:', {
		authToken: authToken ? 'present' : 'missing',
		refreshToken: refreshToken ? 'present' : 'missing'
	});

	try {
		console.log('Attempting to fetch profile from:', 'http://auth-svc:3000/profile');

		const response = await fetch('http://auth-svc:3000/profile', {
			headers: {
				Cookie: `auth_token=${authToken}; refresh_token=${refreshToken}`
			}
		});

		console.log('Profile Response Status:', response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Profile Error Response:', errorText);
			throw error(response.status, 'Failed to load profile');
		}

		const profile = await response.json();
		console.log('Profile Data:', profile);

		return { profile };
	} catch (err) {
		console.error('Profile Load Error:', err);
		throw error(500, 'Error loading profile data');
	}
};

export const actions: Actions = {
	update: async ({ request, fetch, cookies }) => {
		try {
			const formData = await request.formData();
			const updates = {
				full_name: formData.get('full_name'),
				email: formData.get('email'),
				bio: formData.get('bio'),
				favorite_color: formData.get('favorite_color')
			};

			const response = await fetch('http://auth-svc:3000/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Cookie: `auth_token=${cookies.get('auth_token')}; refresh_token=${cookies.get('refresh_token')}`
				},
				body: JSON.stringify(updates)
			});

			if (!response.ok) {
				throw error(response.status, 'Failed to update profile');
			}

			const updatedProfile = await response.json();
			return { profile: updatedProfile };
		} catch (err) {
			console.error('Error updating profile:', err);
			throw error(500, 'Error updating profile data');
		}
	}
};
