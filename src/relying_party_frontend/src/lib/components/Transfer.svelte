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
	import { icpLedgerAllowance } from '$core/api/icp-ledger.api';

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

	let inProgress = $state(false);

	const onclickApprove = async () => {
		inProgress = true;

		try {
			assertNonNullish($authStore.identity);

			const from = $state.snapshot(accounts[0]);

			const amount = 5_000_000n;
			const fee = 10_000n;

			const spender: Icrc1Account = {
				owner: Principal.fromText(RELYING_PARTY_BACKEND_CANISTER_ID),
				subaccount: toNullable(principalToSubAccount($authStore.identity.getPrincipal()))
			};

			await wallet?.approve({ account: from, spender, amount: amount + fee });

			const allowance = await icpLedgerAllowance({
				identity: $authStore.identity,
				account: {
					owner: from.owner,
					subaccount: toNullable(from.subaccount)
				},
				spender
			});

			console.log('Allowance:', allowance);

			await transfer({
				identity: $authStore.identity,
				amount,
				from: {
					owner: from.owner,
					subaccount: toNullable(from.subaccount)
				}
			});

			await balance?.reload();
		} finally {
			inProgress = false;
		}

	};
</script>

<div class="bg-grey rounded-md px-4 py-6 mt-8 max-w-xl">
	<p class="font-bold mb-3">Test: ICRC Approve / Transfer From</p>

	{#if nonNullish(accountIdentifier)}
		<Balance bind:this={balance} {accountIdentifier} />
	{/if}

	<div class="flex gap-2">
		<WalletAction {wallet} {onclickApprove} {inProgress}>Approve 0.5 ICP + Fee</WalletAction>
	</div>
</div>
