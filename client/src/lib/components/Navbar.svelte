<!-- src/lib/components/Navbar.svelte -->
<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';

	const handleLogout: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				authStore.logout();
				goto(result.location);
			}
		};
	};
</script>

<nav class="p-4 text-white bg-gray-800">
	<div class="container flex items-center justify-between mx-auto">
		<a href="/" class="text-xl font-bold">Munchies App</a>
		<div>
			{#if $authStore.isAuthenticated}
				<!-- Authenticated User Links -->
				<a href="/profile" class="mr-4 hover:text-gray-300">Profile</a>
				<form
					action="/logout"
					method="POST"
					use:enhance={handleLogout}
					class="inline-block"
				>
					<button
						type="submit"
						class="hover:text-gray-300"
					>
						Logout
					</button>
				</form>
			{:else}
				<!-- Non-Authenticated User Links -->
				<a href="/signup" class="mr-4 hover:text-gray-300">Signup</a>
				<a href="/login" class="mr-4 hover:text-gray-300">Login</a>
			{/if}
			<!-- Always Visible Links -->
			<a href="/debug" class="ml-4 hover:text-gray-300">Debug</a>
		</div>
	</div>
</nav>
