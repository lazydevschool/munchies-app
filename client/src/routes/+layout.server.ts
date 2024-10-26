export function load({ cookies }) {
	return {
		authenticated: !!cookies.get('auth_token')
	};
}
