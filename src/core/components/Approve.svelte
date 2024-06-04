<script lang="ts">
	import type { Snippet } from 'svelte';
	import Progress from './Progress.svelte';

	type Props = {
		children: Snippet;
		inProgress?: boolean;
	};

	let { children, inProgress } = $props<Props>();
</script>

<button
	class="flex gap-3 items-center bg-blue text-white border border-blue px-4 py-2 rounded-xl my-2"
	disabled={inProgress}
	class:opacity-40={inProgress}>{@render children()} <Progress {inProgress} /></button
>
