// src/lib/stores/authStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createAuthStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		login: () => set(true),
		logout: () => set(false),
		initialize: (initialState: boolean) => {
			if (browser) {
				set(initialState);
			}
		}
	};
}

export const authStore = createAuthStore();
