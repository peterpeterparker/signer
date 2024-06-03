<script lang="ts">
	import '$core/constants/app.constants';
	import { notSignedIn } from '$core/derived/auth.derived';
	import { IcrcSigner } from '$lib/icrc-signer';
	import {
		ICRC27_GET_ACCOUNTS,
		ICRC49_CALL_CANISTER,
		type IcrcBlobType,
		type IcrcWalletCallCanisterParamsType,
		type IcrcWalletScopesArrayType
	} from '$core/types/icrc';
	import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
	import { authStore } from '$core/stores/auth.store';
	import type { Result } from '$declarations/wallet_backend/wallet_backend.did';
	import Approve from '$core/components/Approve.svelte';
	import { fade } from 'svelte/transition';

	let scopes: IcrcWalletScopesArrayType | undefined = $state(undefined);
	let displayMessage: string | undefined = $state(undefined);
	let callParams: Pick<IcrcWalletCallCanisterParamsType, 'arg' | 'method'> | undefined =
		$state(undefined);

	let signer: IcrcSigner | undefined;

	$effect(() => {
		if ($notSignedIn) {
			signer?.destroy();
			signer = undefined;
			return;
		}

		signer = IcrcSigner.init({
			acceptMethods: [ICRC27_GET_ACCOUNTS, ICRC49_CALL_CANISTER],
			onRequestPermissions: (s) => {
				console.log(s);

				scopes = s;
			},
			onCallCanister: ({
				message,
				callParams: params
			}: {
				message: Result;
				callParams: Pick<IcrcWalletCallCanisterParamsType, 'arg' | 'method'>;
			}) => {
				// TODO: happy path
				if ('Err' in message) {
					throw new Error('Error consent message');
				}

				displayMessage = (message.Ok.consent_message as { GenericDisplayMessage: string })
					.GenericDisplayMessage;

				callParams = params;
			}
		});
	});

	const onsubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		signer?.approvePermissions($state.snapshot(scopes)!);
	};

	const onsubmitCall = ($event: SubmitEvent) => {
		$event.preventDefault();

		// TODO: happy path
		assertNonNullish(callParams);

		const {arg, method} = callParams;

		switch (method) {
			case "greet": {
				signer?.greetings({ identity: $authStore.identity, arg });
				break;
			}
			case "icrc2_approve": {
				signer?.approve({ identity: $authStore.identity, arg });
				break;
			}
		}
	};
</script>

<p class="font-bold text-sm">User ID:</p>
<p class="text-sm"><output>{$authStore?.identity?.getPrincipal().toText() ?? ''}</output></p>

{#if isNullish(scopes) && isNullish(displayMessage)}
	<p class="animate-pulse text-sm mt-4">Communicating...</p>
{/if}

{#if nonNullish(scopes)}
	<form {onsubmit} method="POST" class="bg-grey rounded-md px-4 py-6 mt-4 max-w-xl" in:fade>
		<p class="font-bold">Grant Permissions</p>

		<ul class="mt-2 mb-4 text-sm list-disc px-4">
			{#each scopes as scope}
				<li>{scope.method}</li>
			{/each}
		</ul>

		<Approve>Approve</Approve>
	</form>
{/if}

{#if nonNullish(displayMessage)}
	<form
		onsubmit={onsubmitCall}
		method="POST"
		class="bg-grey rounded-md px-4 py-6 mt-4 max-w-xl"
		in:fade
	>
		<p class="font-bold">Approve the following action?</p>

		<p class="text-sm break-words">{displayMessage}</p>

		<Approve>Approve</Approve>
	</form>
{/if}
