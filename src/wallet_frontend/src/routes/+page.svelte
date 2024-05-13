<script lang="ts">
	import '$core/constants/app.constants';
	import { whoAmI } from '$core/api/backend.api';
	import SignOut from '$core/components/SignOut.svelte';
	import { notSignedIn } from '$core/derived/auth.derived';
	import { IcrcSigner } from '$lib/icrc-signer';
	import { ICRC27_GET_ACCOUNTS, type IcrcWalletRequestScopesType } from '$core/types/icrc';
	import { nonNullish } from '@dfinity/utils';

	$effect(() => {
		(async () => {
			const value = await whoAmI(undefined);
			console.log(value);
		})();
	});

	let scopes: IcrcWalletRequestScopesType | undefined = $state(undefined);

	let signer: IcrcSigner | undefined;

	$effect(() => {
		if ($notSignedIn) {
			signer?.destroy();
			signer = undefined;
			return;
		}

		signer = IcrcSigner.init({
			acceptMethods: [ICRC27_GET_ACCOUNTS],
			onRequestPermissions: (s) => {
				console.log(s);

				scopes = s;
			}
		});
	});

	const onsubmit = ($event: FormDataEvent) => {
		$event.preventDefault();

		signer?.approvePermissions($state.snapshot(scopes)!);
	};
</script>

<h1>Wallet</h1>

<SignOut />

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
