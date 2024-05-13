<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { isNullish } from '@dfinity/utils';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});

	let wallet: IcrcWallet | undefined = $state(undefined);

	const onclick = async () => {
		wallet = await IcrcWallet.connect();
	};

	const getAccounts = async () => {
		wallet?.getAccounts();
	};
</script>

<h1>Relying Party</h1>

{#if isNullish(wallet)}
	<button {onclick}>Request Wallet Permissions</button>
{:else}
	<button onclick={getAccounts}>Get Accounts</button>
{/if}
