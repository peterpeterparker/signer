<script lang="ts">
	import { authStore } from '$core/stores/auth.store';

	const onclick = async () => {
		await authStore.signOut();
	};
</script>

<button {onclick}>Sign-out</button>
