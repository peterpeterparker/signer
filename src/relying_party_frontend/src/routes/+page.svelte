<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
	import { isNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
	import { IcrcWallet } from '$lib/icrc-wallet';

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

	let accounts = $derived(wallet?.accounts ?? []);
</script>

<h1>Relying Party</h1>

{#if isNullish(wallet)}
	<button {onclick}>Connect Wallet</button>
{:else}
	<p>Accounts:</p>

	<ul>
		{#each accounts as account}
			<li>{encodeIcrcAccount(account)}</li>
		{/each}
	</ul>
{/if}
