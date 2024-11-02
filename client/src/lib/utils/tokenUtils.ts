export function parseJwt(token: string | null | undefined) {
	if (!token || typeof token !== 'string' || token === 'none') {
		return null;
	}

	try {
		const parts = token.split('.');
		if (parts.length < 2) {
			return null;
		}

		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join('')
		);

		const payload = JSON.parse(jsonPayload);
		const now = Math.floor(Date.now() / 1000);

		return {
			...payload,
			expiresIn: payload.exp ? payload.exp - now : null,
			issuedAgo: payload.iat ? now - payload.iat : null,
			isExpired: payload.exp ? payload.exp < now : null
		};
	} catch (e) {
		console.error('Failed to parse JWT:', e);
		return null;
	}
}
