<script lang="ts">
	import '$core/constants/app.constants';
	import { notSignedIn } from '$core/derived/auth.derived';
	import { IcrcSigner } from '$lib/icrc-signer';
	import {
		ICRC27_GET_ACCOUNTS,
		ICRC49_CALL_CANISTER,
		type IcrcBlobType,
		type IcrcWalletScopesArrayType
	} from '$core/types/icrc';
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import { authStore } from '$core/stores/auth.store';
	import type { Result } from '$declarations/wallet_backend/wallet_backend.did';

	let scopes: IcrcWalletScopesArrayType | undefined = $state(undefined);
	let displayMessage: string | undefined = $state(undefined);
	let arg: IcrcBlobType | undefined = $state(undefined);

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
			onGreetings: ({ message, arg: params }: { message: Result; arg: IcrcBlobType }) => {
				// TODO: happy path
				if ('Err' in message) {
					throw new Error('Error consent message');
				}

				displayMessage = (message.Ok.consent_message as { GenericDisplayMessage: string })
					.GenericDisplayMessage;

				arg = params;
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
		assertNonNullish(arg);

		signer?.approveGreetings({ identity: $authStore.identity, arg });
	};
</script>

<h1>Wallet</h1>

<p>User ID: {$authStore?.identity?.getPrincipal().toText() ?? ''}</p>

<hr />

{#if nonNullish(scopes)}
	<h2>Grant Permissions</h2>

	<form {onsubmit} method="POST">
		<ul>
			{#each scopes as scope}
				<li>{scope.method}</li>
			{/each}
		</ul>

		<button>Approve</button>
	</form>
{/if}

{#if nonNullish(displayMessage)}
	<h2>Approve the following action?</h2>

	<form onsubmit={onsubmitCall} method="POST">
		<p>{displayMessage}</p>

		<button>Approve</button>
	</form>
{/if}
