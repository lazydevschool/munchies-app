<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';

	export let form;

	const handleSubmit: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				if (result.data && result.data.success) {
					goto('/login');
				}
			}
			// The form will be automatically updated by SvelteKit
		};
	};
</script>

<h1>Sign Up</h1>

<form method="POST" use:enhance={handleSubmit}>
	<div>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" required />
	</div>
	<div>
		<label for="password">Password:</label>
		<input type="password" id="password" name="password" required />
	</div>
	<button type="submit">Sign Up</button>

	{#if form?.message}
		<p class="text-red-500">{form.message}</p>
	{/if}
</form>
