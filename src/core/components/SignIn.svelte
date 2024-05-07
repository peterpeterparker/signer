<script lang="ts">
	import { authStore } from '$core/stores/auth.store';

	const onclick = async () => {
		await authStore.signIn({});
	};
</script>

<button {onclick}>Sign-in</button>
