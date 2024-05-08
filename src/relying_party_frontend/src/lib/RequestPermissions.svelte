<script lang="ts">
	import { IcrcWallet } from '$lib/icrc-wallet';

	const onclick = async () => {
		const wallet = await IcrcWallet.connect();
		console.log(wallet);
	};
</script>

<button {onclick}>Request Wallet Permissions</button>
