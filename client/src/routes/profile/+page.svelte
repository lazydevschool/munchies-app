<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { authStore } from '$lib/stores/authStore';

	export let data;
	export let form: ActionData;

	let isEditing = false;
	let formData = { ...data.profile };

	const handleSubmit = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				isEditing = false;
				await update();
			} else if (result.type === 'error') {
				// If we get a 401, the page will automatically redirect due to layout.server.ts
				console.error('Profile update failed:', result);
			}
		};
	};
</script>

<svelte:head>
	<title>Profile | My App</title>
</svelte:head>

<h1 class="mb-4 text-3xl font-bold">Your Profile</h1>
<div class="px-8 pt-6 pb-8 mb-4 bg-white rounded shadow-md">
	{#if $authStore.isAuthenticated}
		{#if isEditing}
			<form method="POST" action="?/update" use:enhance={handleSubmit} class="space-y-4">
				<div>
					<label class="block mb-2 text-sm font-bold text-gray-700" for="full_name">
						Full Name
					</label>
					<input
						type="text"
						id="full_name"
						name="full_name"
						bind:value={formData.full_name}
						class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
					/>
				</div>

				<div>
					<label class="block mb-2 text-sm font-bold text-gray-700" for="email"> Email </label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={formData.email}
						class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
					/>
				</div>

				<div>
					<label class="block mb-2 text-sm font-bold text-gray-700" for="bio"> Bio </label>
					<textarea
						id="bio"
						name="bio"
						bind:value={formData.bio}
						class="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
						rows="4"
					></textarea>
				</div>

				<div>
					<label class="block mb-2 text-sm font-bold text-gray-700" for="favorite_color">
						Favorite Color
					</label>
					<input
						type="color"
						id="favorite_color"
						name="favorite_color"
						bind:value={formData.favorite_color}
						class="w-full h-10 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
					/>
				</div>

				<div class="flex justify-end space-x-4">
					<button
						type="button"
						on:click={() => {
							isEditing = false;
							formData = { ...data.profile };
						}}
						class="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:shadow-outline"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
					>
						Save
					</button>
				</div>
			</form>
		{:else}
			<div class="space-y-4">
				<p><span class="font-bold">Full Name:</span> {data.profile.full_name || 'Not set'}</p>
				<p><span class="font-bold">Email:</span> {data.profile.email || 'Not set'}</p>
				<p><span class="font-bold">Bio:</span> {data.profile.bio || 'Not set'}</p>
				<div class="flex items-center gap-2">
					<span class="font-bold">Favorite Color:</span>
					<div
						class="w-6 h-6 border border-gray-300 rounded"
						style="background-color: {data.profile.favorite_color}"
					></div>
				</div>
				<button
					on:click={() => (isEditing = true)}
					class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
				>
					Edit Profile
				</button>
			</div>
		{/if}
	{:else}
		<p class="mb-4">You must be logged in to view this page.</p>
	{/if}
</div>
