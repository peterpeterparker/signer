<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
	import SignOut from '$core/components/SignOut.svelte';
	import { notSignedIn } from '$core/derived/auth.derived';
	import { IcrcSigner } from '$lib/icrc-signer';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});

	let signer: IcrcSigner | undefined;

	$effect(() => {
		if ($notSignedIn) {
			signer?.destroy();
			signer = undefined;
			return;
		}

		signer = IcrcSigner.init();
	});
</script>

<h1>Wallet</h1>

<SignOut />
