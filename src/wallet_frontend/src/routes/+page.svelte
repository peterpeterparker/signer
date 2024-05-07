<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
    import SignOut from '$core/components/SignOut.svelte';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});
</script>

<h1>Wallet</h1>

<SignOut />