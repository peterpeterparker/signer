<script lang="ts">
	import '$lib/constants/app.constants';
    import {whoAmI} from "$lib/api/backend.api";

    $effect(() => {
        (async () => {
            const value = await whoAmI(undefined);
            console.log(value);
        })()
    });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
