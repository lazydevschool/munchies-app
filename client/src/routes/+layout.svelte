<!-- src/routes/+layout.svelte -->
<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';

	export let data;

	onMount(() => {
        authStore.initialize(data.authenticated);
    });
</script>

<Navbar />

<main class="container px-4 mx-auto mt-8">
    <slot />
</main>

<footer class="py-4 mt-8 bg-gray-100">
    <div class="container mx-auto text-center">
        © 2024 Munchies App. All rights reserved.
    </div>
</footer>
