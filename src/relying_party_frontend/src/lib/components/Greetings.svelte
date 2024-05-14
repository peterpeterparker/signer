<script lang="ts">
	import { walletGreet } from '$core/api/backend.api';
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { ICRC49_CALL_CANISTER } from '$core/types/icrc';
	import { isNullish } from '@dfinity/utils';

	type Props = {
		wallet: IcrcWallet | undefined;
	};

	let { wallet } = $props<Props>();

	let greetings = $state('');

	const onclick = async () => {
		greetings = 'Loading...';

		try {
			greetings = await walletGreet(undefined);
		} catch (err) {
			greetings = `${err}`;
		}
	};

	const onclickApprove = async () => {};

	let disabled = $derived(
		isNullish((wallet?.scopes ?? []).find(({ method }) => method === ICRC49_CALL_CANISTER))
	);
</script>

<button {onclick}>Call Wallet Greetings: <strong>Directly</strong></button>

<button onclick={onclickApprove} {disabled}>Call Wallet Greetings: <strong>Approve</strong></button>

<div>
	<label for="greetings">Greetings:</label>
	<textarea id="greetings">{greetings}</textarea>
</div>
