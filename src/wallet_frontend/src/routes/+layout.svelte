<script lang="ts">
	import Layout from '$core/components/Layout.svelte';
	import '$core/styles/app.scss';
</script>

<Layout>
	<svelte:fragment slot="title">Wallet 👛</svelte:fragment>

	<slot />
</Layout>
