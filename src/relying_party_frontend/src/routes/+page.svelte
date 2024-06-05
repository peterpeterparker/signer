<script lang="ts">
	import '$core/constants/app.constants';
	import { isNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import Greetings from '$lib/components/Greetings.svelte';
	import Button from '$core/components/Button.svelte';
	import { fade } from 'svelte/transition';
	import Transfer from '$lib/components/Transfer.svelte';
	import UserId from '$core/components/UserId.svelte';
	import Balance from '$core/components/Balance.svelte';
	import { AccountIdentifier } from '@dfinity/ledger-icp';

	let wallet: IcrcWallet | undefined = $state(undefined);

	const onclick = async () => {
		wallet = await IcrcWallet.connect();
	};

	let accounts = $derived(wallet?.accounts ?? []);
</script>

<UserId />

{#if isNullish(wallet)}
	<Button {onclick}>Connect Wallet</Button>
{:else}
	<div in:fade>
		<p class="font-bold text-sm mt-2">Wallet Accounts:</p>

		<ul class="text-sm">
			{#each accounts as account}
				<li>{encodeIcrcAccount(account)}</li>

				<Balance accountIdentifier={AccountIdentifier.fromPrincipal({principal: account.owner})} />
			{/each}
		</ul>
	</div>
{/if}

<Greetings {wallet} />

<Transfer {wallet} />
