<!-- src/routes/+layout.svelte -->
<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { browser } from '$app/environment';
	import { authStore } from '$lib/stores/authStore';

	export let data;

	$: if (browser && data) {
		// Only update store if data changes
		if (
			data.authenticated !== $authStore.isAuthenticated ||
			data.user?.username !== $authStore.user?.username
		) {
			authStore.initialize(data.authenticated);
			if (data.user?.username) {
				authStore.setUser({ username: data.user.username });
			} else {
				authStore.clearUser();
			}
		}
	}
</script>

<!-- Debug display -->
{#if browser && import.meta.env.DEV}
	<div class="p-2 text-sm bg-yellow-100">
		<p>Auth State: {data.authenticated ? '✅' : '❌'} {data.user?.username || 'Not logged in'}</p>
	</div>
{/if}

<Navbar />

<main class="container px-4 mx-auto mt-8">
	<slot />
</main>

<footer class="py-4 mt-8 bg-gray-100">
	<div class="container mx-auto text-center">© 2024 Munchies App. All rights reserved.</div>
</footer>
