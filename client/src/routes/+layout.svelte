<!-- src/routes/+layout.svelte -->
<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import { browser } from '$app/environment';
    import { authStore } from '$lib/stores/authStore';

    export let data;

    $: if (browser) {
        console.log('Setting auth state with:', data);
        authStore.initialize(data.authenticated);
        if (data.user?.username) {
            console.log('Setting user in store:', data.user);
            authStore.setUser({ username: data.user.username });
        }
    }

    // Debug subscription
    $: console.log('Current auth store value:', $authStore);
</script>
<!-- Debug display -->
{#if browser}
    <div class="p-2 bg-yellow-100">
        <p>Layout Data: authenticated={data.authenticated}, username={data.user?.username ?? 'none'}</p>
        <p>Store State: authenticated={$authStore.isAuthenticated}, username={$authStore.user?.username ?? 'none'}</p>
    </div>
{/if}
<Navbar />

<main class="container px-4 mx-auto mt-8">
    <slot />
</main>

<footer class="py-4 mt-8 bg-gray-100">
    <div class="container mx-auto text-center">
        © 2024 Munchies App. All rights reserved.
    </div>
</footer>
