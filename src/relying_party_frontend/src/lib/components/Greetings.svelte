<script lang="ts">
	import { walletGreet } from '$core/api/wallet-backend.api';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { assertNonNullish } from '@dfinity/utils';
	import { authStore } from '$core/stores/auth.store';
	import Button from '$core/components/Button.svelte';
	import WalletAction from '$lib/components/WalletAction.svelte';

	type Props = {
		wallet: IcrcWallet | undefined;
	};

	let { wallet } = $props<Props>();

	let greetings = $state('');

	const onclick = async () => {
		greetings = 'Loading...';

		try {
			greetings = await walletGreet({
				identity: $authStore.identity,
				args: 'Wallet Jimmy'
			});
		} catch (err) {
			greetings = `${err}`;
		}
	};

	let accounts = $derived(wallet?.accounts ?? []);

	const onclickApprove = async () => {
		greetings = 'Calling...';

		const account = $state.snapshot(accounts[0]);

		assertNonNullish(account);

		greetings = await wallet?.greetings({ account });
	};
</script>

<div class="bg-grey rounded-md px-4 py-6 mt-8 max-w-xl">
	<p class="font-bold">Test: Call Greetings</p>

	<div class="flex gap-2">
		<Button {onclick}>Direct call</Button>

		<WalletAction {wallet} {onclickApprove}>Wallet approval</WalletAction>
	</div>

	<div class="flex flex-col gap-2 mt-2">
		<label for="greetings" class="text-sm">Results:</label>
		<textarea
			id="greetings"
			rows="5"
			class="border-2 border-dust bg-white rounded-lg py-2 px-2 relative text-sm"
			>{greetings}</textarea
		>
	</div>
</div>
