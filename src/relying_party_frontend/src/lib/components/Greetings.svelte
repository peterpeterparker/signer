<script lang="ts">
	import { walletGreet } from '$core/api/backend.api';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { ICRC49_CALL_CANISTER } from '$core/types/icrc';
	import { assertNonNullish, isNullish } from '@dfinity/utils';
	import { authStore } from '$core/stores/auth.store';

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
				args: "Wallet Jimmy"
			});
		} catch (err) {
			greetings = `${err}`;
		}
	};

	let accounts = $derived(wallet?.accounts ?? []);

	let disabled = $derived(
		isNullish((wallet?.scopes ?? []).find(({ method }) => method === ICRC49_CALL_CANISTER))
	);

	const onclickApprove = async () => {
		const account = $state.snapshot(accounts[0]);

		assertNonNullish(account);

		await wallet?.greetings({account});
	};
</script>

<button {onclick}>Call Wallet Greetings: <strong>Directly</strong></button>

<button onclick={onclickApprove} {disabled}>Call Wallet Greetings: <strong>Approve</strong></button>

<div>
	<label for="greetings">Greetings:</label>
	<textarea id="greetings">{greetings}</textarea>
</div>
