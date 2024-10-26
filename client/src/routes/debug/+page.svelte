<!-- src/routes/debug/+page.svelte -->
<script lang="ts">
  export let data: { debugData: any };
</script>

<h1>Debug Information</h1>
<pre>{JSON.stringify(data.debugData, null, 2)}</pre>