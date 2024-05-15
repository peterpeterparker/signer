<script lang="ts">
	import { authStore } from '$core/stores/auth.store';
	import Button from '$core/components/Button.svelte';
	import IconSignIn from '$core/components/IconSignIn.svelte';

	const onclick = async () => {
		await authStore.signIn({});
	};
</script>

<Button {onclick}><IconSignIn /> Sign-in</Button>
