<!-- /src/routes/profile/+page.svelte -->
<script>

import { authStore } from '$lib/stores/authStore';
</script>

<svelte:head>
  <title>Profile | My App</title>
</svelte:head>

<h1 class="mb-4 text-3xl font-bold">Your Profile</h1>
<div class="px-8 pt-6 pb-8 mb-4 bg-white rounded shadow-md">

  {#if $authStore.isAuthenticated}
  <p class="mb-4">Welcome, {$authStore.user?.username}</p>

{:else}
<p class="mb-4">this is a protected page. You are not logged in</p>
{/if}
</div>