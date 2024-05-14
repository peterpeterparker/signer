<script lang="ts">
	import '$core/constants/app.constants';
	import { isNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import Greetings from '$core/components/Greetings.svelte';

	let wallet: IcrcWallet | undefined = $state(undefined);

	const onclick = async () => {
		wallet = await IcrcWallet.connect();
	};

	let accounts = $derived(wallet?.accounts ?? []);
</script>

<h1>Relying Party</h1>

<Greetings />

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
