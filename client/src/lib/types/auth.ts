// src/lib/types/auth.ts
export interface AuthState {
	isAuthenticated: boolean;
	user: {
		// id: string;
		username: string;
	} | null;
}
