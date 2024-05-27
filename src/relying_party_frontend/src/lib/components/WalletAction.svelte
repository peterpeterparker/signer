<script lang="ts">
	import { IcrcWallet } from '$lib/icrc-wallet';
	import { isNullish } from '@dfinity/utils';
	import { ICRC49_CALL_CANISTER } from '$core/types/icrc';
	import Action from '$core/components/Action.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		wallet: IcrcWallet | undefined;
		onclickApprove: ($event: UIEvent) => Promise<void>;
		children: Snippet;
	};

	let { wallet, onclickApprove, children } = $props<Props>();

	let disabled = $derived(
		isNullish((wallet?.scopes ?? []).find(({ method }) => method === ICRC49_CALL_CANISTER))
	);
</script>

<Action onclick={onclickApprove} {disabled}>
	{@render children()}
</Action>