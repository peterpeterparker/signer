<script lang="ts">
	import '$core/constants/app.constants';
	import { isNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import Greetings from '$lib/components/Greetings.svelte';
	import Button from '$core/components/Button.svelte';
	import { fade } from 'svelte/transition';

	let wallet: IcrcWallet | undefined = $state(undefined);

	const onclick = async () => {
		wallet = await IcrcWallet.connect();
	};

	let accounts = $derived(wallet?.accounts ?? []);
</script>

{#if isNullish(wallet)}
	<Button {onclick}>Connect Wallet</Button>
{:else}
	<div in:fade>
		<p class="font-bold mt-2">Accounts:</p>

		<ul>
			{#each accounts as account}
				<li>{encodeIcrcAccount(account)}</li>
			{/each}
		</ul>
	</div>
{/if}

<Greetings {wallet} />
