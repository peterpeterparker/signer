<script lang="ts">
	import type { Snippet } from 'svelte';
	import Progress from '$core/components/Progress.svelte';

	type Props = {
		onclick: () => void;
		children: Snippet;
		disabled: boolean;
		inProgress?: boolean;
	};

	let { onclick, disabled, children, inProgress } = $props<Props>();
</script>

<button
	{onclick}
	disabled={disabled || inProgress}
	class:opacity-40={disabled || inProgress}
	class="flex gap-3 items-center bg-blue text-white border border-blue px-4 py-2 rounded-xl my-2"
	>{@render children()}
	<Progress {inProgress} />
</button>
