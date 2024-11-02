<!-- src/routes/debug/+page.svelte -->
<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import { parseJwt } from '$lib/utils/tokenUtils';
	export let data: { debugData: any };

	// Subscribe to store changes
	$: storeState = $authStore;

	// Only attempt to parse if we have valid token values
	$: authTokenInfo =
		data.debugData?.local?.cookies?.authToken?.value !== 'none'
			? parseJwt(data.debugData.local.cookies.authToken.value)
			: null;

	$: refreshTokenInfo =
		data.debugData?.local?.cookies?.refreshToken?.value !== 'none'
			? parseJwt(data.debugData.local.cookies.refreshToken.value)
			: null;

	// Optional: Update the display every second
	let timeNow = Date.now() / 1000;
	setInterval(() => {
		timeNow = Date.now() / 1000;
	}, 1000);
</script>

<div class="p-4">
	<h1 class="mb-4 text-2xl font-bold">Debug Information</h1>

	<!-- Auth Store State -->
	<div class="p-4 mb-6 rounded bg-blue-50">
		<h2 class="mb-2 text-xl font-semibold">Frontend Auth Store State</h2>
		<div class="mb-2">
			<strong>Is Authenticated:</strong>
			{storeState.isAuthenticated}
		</div>
		<div class="mb-2">
			<strong>User:</strong>
			{storeState.user ? storeState.user.username : 'null'}
		</div>
		<pre class="whitespace-pre-wrap">{JSON.stringify(storeState, null, 2)}</pre>
	</div>

	<!-- Auth Service Debug Data -->
	<div class="p-4 mb-6 rounded bg-green-50">
		<h2 class="mb-2 text-xl font-semibold">Auth Service Debug Data</h2>
		<pre class="whitespace-pre-wrap">{JSON.stringify(data.debugData.authService, null, 2)}</pre>
	</div>

	<!-- Local Debug Data -->
	<div class="p-4 mb-6 rounded bg-yellow-50">
		<h2 class="mb-2 text-xl font-semibold">Local Debug Data</h2>
		<div class="mb-2">
			<strong>Cookies:</strong>
			<ul class="ml-4 list-disc">
				<li>
					Auth Token: {data.debugData.local.cookies.authToken.present}
					{#if data.debugData.local.cookies.authToken.present === 'present'}
						<span class="text-xs text-gray-500"
							>(prefix: {data.debugData.local.cookies.authToken.prefix})</span
						>
					{/if}
				</li>
				<li>
					Refresh Token: {data.debugData.local.cookies.refreshToken.present}
					{#if data.debugData.local.cookies.refreshToken.present === 'present'}
						<span class="text-xs text-gray-500"
							>(prefix: {data.debugData.local.cookies.refreshToken.prefix})</span
						>
					{/if}
				</li>
			</ul>
		</div>
	</div>

	<!-- Token Details -->
	<div class="p-4 mb-6 rounded bg-purple-50">
		<h2 class="mb-2 text-xl font-semibold">Token Details</h2>

		<div class="mb-4">
			<h3 class="font-bold">Auth Token</h3>
			{#if data.debugData?.local?.cookies?.authToken?.present === 'present' && authTokenInfo}
				<ul class="ml-4 list-disc">
					<li>Expires in: {authTokenInfo.expiresIn?.toFixed(0) || 'N/A'} seconds</li>
					<li>Issued: {authTokenInfo.issuedAgo?.toFixed(0) || 'N/A'} seconds ago</li>
					<li>Status: {authTokenInfo.isExpired ? '❌ Expired' : '✅ Valid'}</li>
					<li>Username: {authTokenInfo.username || 'N/A'}</li>
				</ul>
			{:else}
				<p class="text-red-500">No valid auth token found</p>
			{/if}
		</div>

		<div class="mb-4">
			<h3 class="font-bold">Refresh Token</h3>
			{#if data.debugData?.local?.cookies?.refreshToken?.present === 'present' && refreshTokenInfo}
				<ul class="ml-4 list-disc">
					<li>Expires in: {refreshTokenInfo.expiresIn?.toFixed(0) || 'N/A'} seconds</li>
					<li>Issued: {refreshTokenInfo.issuedAgo?.toFixed(0) || 'N/A'} seconds ago</li>
					<li>Status: {refreshTokenInfo.isExpired ? '❌ Expired' : '✅ Valid'}</li>
					<li>Username: {refreshTokenInfo.username || 'N/A'}</li>
				</ul>
			{:else}
				<p class="text-red-500">No valid refresh token found</p>
			{/if}
		</div>

		<div class="text-sm text-gray-500">
			Current server time: {new Date(timeNow * 1000).toISOString()}
		</div>
	</div>
</div>
