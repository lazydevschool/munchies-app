<!-- src/routes/debug/+page.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/authStore';
  export let data: { debugData: any };

  // Subscribe to store changes
  $: storeState = $authStore;
</script>

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold">Debug Information</h1>
  
  <!-- Auth Store State -->
  <div class="p-4 mb-6 rounded bg-blue-50">
      <h2 class="mb-2 text-xl font-semibold">Frontend Auth Store State</h2>
      <div class="mb-2">
          <strong>Is Authenticated:</strong> {storeState.isAuthenticated}
      </div>
      <div class="mb-2">
          <strong>User:</strong> {storeState.user ? storeState.user.username : 'null'}
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
              <li>Auth Token: {data.debugData.local.cookies.authToken}</li>
              <li>Refresh Token: {data.debugData.local.cookies.refreshToken}</li>
          </ul>
      </div>
      <div class="mb-2">
          <strong>Request Info:</strong>
          <ul class="ml-4 list-disc">
              <li>URL: {data.debugData.local.request.url}</li>
              <li>Timestamp: {data.debugData.local.request.timestamp}</li>
          </ul>
      </div>
  </div>
</div>