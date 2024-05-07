<script lang="ts">
	import { browser } from '$app/environment';
	import { authStore } from '../stores/auth.store';
	import { signedIn } from '$core/derived/auth.derived';
	import SignIn from '$core/components/SignIn.svelte';

	const init = async () => await Promise.all([syncAuthStore()]);

	const syncAuthStore = async () => {
		if (!browser) {
			return;
		}

		try {
			await authStore.sync();
		} catch (err: unknown) {
			console.error('Cannot sync authentication.', err);
		}
	};
</script>

<svelte:window on:storage={syncAuthStore} />

{#await init()}
	<p>Loading...</p>
{:then _}
	{#if $signedIn}
		<slot />
	{:else}
		<SignIn />
	{/if}
{/await}
