<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
	import SignOut from '$core/components/SignOut.svelte';
	import { notSignedIn } from '$core/derived/auth.derived';
	import { notifyReady } from '$lib/signer.services';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});

	$effect(() => {
		if ($notSignedIn) {
			return;
		}

		notifyReady();
	});
</script>

<h1>Wallet</h1>

<SignOut />
