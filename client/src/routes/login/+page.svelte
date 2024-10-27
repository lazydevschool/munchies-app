<!-- client/src/routes/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';

	let username: string = '';
	let password: string = '';
	let errorMessage: string = '';

	const handleSubmit: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				if (result.data?.success) {
					console.log('Login successful');
					goto(result.data.redirectTo);
				} else {
					errorMessage = result.data?.message || 'Login failed';
				}
			} else if (result.type === 'failure') {
				errorMessage = result.data?.message || 'An error occurred';
				if (result.data?.errors) {
					errorMessage += ': ' + result.data.errors.join(', ');
				}
			}
		};
	};
</script>

<svelte:head>
	<title>Login | My App</title>
</svelte:head>

<h1 class="mb-4 text-3xl font-bold">Login</h1>
<form
	method="POST"
	use:enhance={handleSubmit}
	class="px-8 pt-6 pb-8 mb-4 bg-white rounded shadow-md"
>
	<div class="mb-4">
		<label class="block mb-2 text-sm font-bold text-gray-700" for="username"> Username </label>
		<input
			id="username"
			name="username"
			type="text"
			bind:value={username}
			placeholder="Username"
			class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
		/>
	</div>
	<div class="mb-6">
		<label class="block mb-2 text-sm font-bold text-gray-700" for="password"> Password </label>
		<input
			id="password"
			name="password"
			type="password"
			bind:value={password}
			placeholder="******************"
			class="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
		/>
	</div>
	<div class="flex items-center justify-between">
		<button
			class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
			type="submit"
		>
			Sign In
		</button>
	</div>
</form>
{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}
