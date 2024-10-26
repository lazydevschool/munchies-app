// src/routes/debug/+page.server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	try {
		const response = await event.fetch('http://auth-svc:3000/debug');
		if (!response.ok) {
			throw new Error('Failed to fetch debug data');
		}
		const debugData = await response.json();
		return { debugData };
	} catch (err) {
		throw error(500, 'Error fetching debug data');
	}
}
