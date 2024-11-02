// src/lib/stores/authStore.ts
import { writable } from 'svelte/store';
import type { AuthState } from '$lib/types/auth';

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isAuthenticated: false,
		user: null
	});

	return {
		subscribe,
		setUser: (userData: { username: string }) => {
			console.log('authStore setUser called with:', userData);
			update((state) => ({ ...state, user: userData }));
		},
		initialize: (isAuthenticated: boolean) => {
			console.log('authStore initialize called with:', isAuthenticated);
			update((state) => ({
				...state,
				isAuthenticated
				// Don't reset user here
				// user: null
			}));
		},
		logout: () => set({ isAuthenticated: false, user: null }),
		clearUser: () => {
			update((state) => ({
				...state,
				user: null
			}));
		}
	};
}

export const authStore = createAuthStore();
