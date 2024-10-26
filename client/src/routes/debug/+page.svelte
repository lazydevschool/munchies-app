<!-- src/routes/debug/+page.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/authStore';
  export let data: { debugData: any };


</script>

<h1>Debug Information</h1>
<pre>{JSON.stringify(data.debugData, null, 2)}</pre>
<hr>
<h2>Auth Store</h2>
<pre>{JSON.stringify({authStore:$authStore}, null, 2)}</pre>
