<script lang="ts">
	import '$lib/constants/app.constants';
	import { whoAmI } from '$lib/api/backend.api';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});
</script>

<h1>Wallet</h1>
