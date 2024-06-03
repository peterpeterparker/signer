<script lang="ts">
	import { assertNonNullish, createAgent } from '@dfinity/utils';
	import { authStore } from '../stores/auth.store';
	import { AccountIdentifier, LedgerCanister } from '@dfinity/ledger-icp';
	import { ICP_LEDGER_CANISTER_ID } from '../constants/app.constants';
	import { formatE8sICP } from '../utils/icp.utils';

	type Props = {
		accountIdentifier: AccountIdentifier;
	};

	let { accountIdentifier } = $props<Props>();

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

		balance = await accountBalance({ accountIdentifier });
	};

	$effect(() => {
		(async () => {
			await loadBalance();
		})();
	});
</script>

<p class="font-bold text-sm">Current balance:</p>
<p class="text-sm mb-2"><output>{formatE8sICP(balance)} ICP</output></p>
