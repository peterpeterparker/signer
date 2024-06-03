<script lang="ts">
	import { authStore } from '../stores/auth.store.js';
</script>

<p class="font-bold text-sm">User ID:</p>
<p class="text-sm mb-2"><output>{$authStore?.identity?.getPrincipal().toText() ?? ''}</output></p>
