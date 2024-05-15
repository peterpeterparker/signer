<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children } = $props<Props>();
</script>

<button
	class="flex gap-2 items-center bg-blue text-white border border-blue px-4 py-2 rounded-xl my-2"
	>{@render children()}</button
>
