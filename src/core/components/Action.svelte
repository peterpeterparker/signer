<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		onclick: () => void;
		children: Snippet;
		disabled: boolean;
	};

	let { onclick, disabled, children } = $props<Props>();
</script>

<button
	{onclick}
	{disabled}
	class:opacity-40={disabled}
	class="flex gap-2 items-center bg-blue text-white border border-blue px-4 py-2 rounded-xl my-2"
	>{@render children()}</button
>
