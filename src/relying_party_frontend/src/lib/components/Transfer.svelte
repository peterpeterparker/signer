<script lang="ts">
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { assertNonNullish, nonNullish, principalToSubAccount, toNullable } from '@dfinity/utils';
	import { authStore } from '$core/stores/auth.store';
	import { AccountIdentifier, type Icrc1Account, SubAccount } from '@dfinity/ledger-icp';
	import { RELYING_PARTY_BACKEND_CANISTER_ID } from '$core/constants/app.constants';
	import { Principal } from '@dfinity/principal';
	import WalletAction from '$lib/components/WalletAction.svelte';
	import Balance from '$core/components/Balance.svelte';
	import { transfer } from '$core/api/relying-party-backend.api';

	type Props = {
		wallet: IcrcWallet | undefined;
	};

	let { wallet } = $props<Props>();

	let accounts = $derived(wallet?.accounts ?? []);

	let accountIdentifier = $derived(
		nonNullish($authStore.identity)
			? AccountIdentifier.fromPrincipal({
					principal: Principal.fromText(RELYING_PARTY_BACKEND_CANISTER_ID),
					subAccount: SubAccount.fromPrincipal($authStore.identity.getPrincipal())
				})
			: undefined
	);

	let balance: Balance | undefined;

	const onclickApprove = async () => {
		assertNonNullish($authStore.identity);

		const account = $state.snapshot(accounts[0]);

		let amount = 5_000_000_000n;

		const spender: Icrc1Account = {
			owner: Principal.fromText(RELYING_PARTY_BACKEND_CANISTER_ID),
			subaccount: toNullable(principalToSubAccount($authStore.identity.getPrincipal()))
		};

		await wallet?.approve({ account, spender, amount });

		await transfer({
			identity: $authStore.identity,
			amount,
			account: spender
		});

		await balance?.reload();
	};
</script>

<div class="bg-grey rounded-md px-4 py-6 mt-8 max-w-xl">
	<p class="font-bold">Test: ICRC Approve / Transfer From</p>

	{#if nonNullish(accountIdentifier)}
		<Balance bind:this={balance} {accountIdentifier} />
	{/if}

	<div class="flex gap-2">
		<WalletAction {wallet} {onclickApprove}>Approve 5 ICP</WalletAction>
	</div>
</div>
