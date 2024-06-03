<script lang="ts">
	import { createAgent } from '@dfinity/utils';
	import { AccountIdentifier, LedgerCanister } from '@dfinity/ledger-icp';
	import { ICP_LEDGER_CANISTER_ID } from '../constants/app.constants';
	import { formatE8sICP } from '../utils/icp.utils';
	import { AnonymousIdentity } from '@dfinity/agent';

	type Props = {
		accountIdentifier: AccountIdentifier;
	};

	let { accountIdentifier } = $props<Props>();

	let balance = $state(0n);

	const loadBalance = async () => {
		const agent = await createAgent({
			identity: new AnonymousIdentity(),
			host: 'http://localhost:4943',
			fetchRootKey: true
		});

		const { accountBalance } = LedgerCanister.create({
			agent,
			canisterId: ICP_LEDGER_CANISTER_ID
		});

		balance = await accountBalance({ accountIdentifier, certified: false });
	};

	$effect(() => {
		(async () => {
			await loadBalance();
		})();
	});
</script>

<p class="font-bold text-sm">Current balance:</p>
<p class="text-sm mb-2"><output>{formatE8sICP(balance)} ICP</output></p>
