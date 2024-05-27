<script lang="ts">
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { assertNonNullish, createAgent } from '@dfinity/utils';
	import { authStore } from '$core/stores/auth.store';
	import { AccountIdentifier, LedgerCanister, SubAccount } from '@dfinity/ledger-icp';
	import {
		ICP_LEDGER_CANISTER_ID,
		RELYING_PARTY_BACKEND_CANISTER_ID
	} from '$core/constants/app.constants';
	import { Principal } from '@dfinity/principal';
	import { formatE8sICP } from '$core/utils/icp.utils';
	import WalletAction from '$lib/components/WalletAction.svelte';

	type Props = {
		wallet: IcrcWallet | undefined;
	};

	let { wallet } = $props<Props>();

	let balance = 0n;

	const loadBalance = async () => {
		assertNonNullish($authStore.identity);

		const agent = await createAgent({
			identity: $authStore.identity,
			host: 'http://localhost:4943',
			fetchRootKey: true
		});

		const { accountBalance } = LedgerCanister.create({
			agent,
			canisterId: ICP_LEDGER_CANISTER_ID
		});

		balance = await accountBalance({
			accountIdentifier: AccountIdentifier.fromPrincipal({
				principal: Principal.fromText(RELYING_PARTY_BACKEND_CANISTER_ID),
				subAccount: SubAccount.fromPrincipal($authStore.identity.getPrincipal())
			})
		});
	};

	$effect(() => {
		(async () => {
			await loadBalance();
		})();
	});

	const onclickApprove = async () => {};
</script>

<div class="bg-grey rounded-md px-4 py-6 mt-8 max-w-xl">
	<p class="font-bold">Test: ICRC Approve / Transfer From</p>

	<p>Current balance: {formatE8sICP(balance)} ICP</p>

	<div class="flex gap-2">
		<WalletAction {wallet} {onclickApprove}>Approve 5 ICP</WalletAction>
	</div>
</div>
