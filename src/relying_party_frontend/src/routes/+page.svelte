<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
	import RequestPermissions from '$lib/RequestPermissions.svelte';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});
</script>

<h1>Relying Party</h1>

<RequestPermissions />
