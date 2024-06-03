import { walletConsentMessage, walletGreet } from '$core/api/backend.api';
import { authStore } from '$core/stores/auth.store';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC25_SUPPORTED_STANDARDS,
	ICRC27_GET_ACCOUNTS,
	ICRC29_READY,
	ICRC49_CALL_CANISTER,
	IcrcSupportedStandardsResponse,
	IcrcWalletGetAccountsResponse,
	IcrcWalletPermissionsResponse,
	type IcrcBlobType,
	type IcrcWalletCallCanisterParamsType,
	type IcrcWalletCallCanisterRequestType,
	type IcrcWalletGetAccountsRequestType,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType,
	type IcrcWalletRequestParamsType,
	type IcrcWalletScopesArrayType,
	type IcrcWalletStandardsRequestType,
	type IcrcWalletSupportedMethodType
} from '$core/types/icrc';
import { IcrcWalletGreetingsResponse } from '$core/types/icrc-demo';
import type { OptionIdentity } from '$core/types/identity';
import { JSON_RPC_VERSION_2 } from '$core/types/rpc';
import type { Result } from '$declarations/wallet_backend/wallet_backend.did';
import { IDL } from '@dfinity/candid';
import {
	arrayOfNumberToUint8Array,
	assertNonNullish,
	isNullish,
	nonNullish,
	toNullable
} from '@dfinity/utils';
import { get } from 'svelte/store';

interface IcrcSignerInit {
	// TODO: if we provide an opinionated lib, maybe acceptMethods should be fixed?
	acceptMethods: IcrcWalletSupportedMethodType[];
	onRequestPermissions: (scopes: IcrcWalletScopesArrayType) => void;
	onGreetings: (params: { message: Result; arg: IcrcBlobType }) => void;
}

export class IcrcSigner {
	#walletOrigin: string | undefined;

	readonly #acceptMethods: IcrcWalletSupportedMethodType[];
	readonly #callbackOnRequestPermissions: (scopes: IcrcWalletScopesArrayType) => void;
	readonly #callbackOnGreetings: (params: { message: Result; arg: IcrcBlobType }) => void;

	private constructor({ acceptMethods, onRequestPermissions, onGreetings }: IcrcSignerInit) {
		this.#acceptMethods = acceptMethods;
		this.#callbackOnRequestPermissions = onRequestPermissions;
		this.#callbackOnGreetings = onGreetings;

		window.addEventListener('message', this.onMessage);
	}

	static init(params: IcrcSignerInit): IcrcSigner {
		const notifyReady = () => {
			const msg: IcrcWalletNotificationType = {
				jsonrpc: JSON_RPC_VERSION_2,
				method: ICRC29_READY
			};

			window.opener.postMessage(msg, '*');
		};

		const signer = new IcrcSigner(params);

		notifyReady();

		return signer;
	}

	destroy = () => {
		window.removeEventListener('message', this.onMessage);
	};

	// TODO: id back and forth
	approvePermissions = (scopes: IcrcWalletScopesArrayType) => {
		const msg = IcrcWalletPermissionsResponse.parse({
			jsonrpc: JSON_RPC_VERSION_2,
			result: {
				scopes
			}
		});

		// TODO: walletOrigin is defined - should be saved in session

		window.opener.postMessage(msg, { targetOrigin: this.#walletOrigin });
	};

	private onRequestPermissions(params: IcrcWalletRequestParamsType | undefined) {
		// TODO error
		assertNonNullish(params);

		const { scopes } = params;

		const acceptableScopes = scopes.filter(({ method }) => this.#acceptMethods.includes(method));

		if (acceptableScopes.length === 0) {
			// TODO: error
		}

		this.#callbackOnRequestPermissions(acceptableScopes);
	}

	private onSupportedStandards() {
		// TODO: it's a bit unpractical to have a fixed onMessage switch and a static list here as well.
		// Maybe we can handle this with a more dynamic pattern without compromising on performance

		const msg = IcrcSupportedStandardsResponse.parse({
			jsonrpc: JSON_RPC_VERSION_2,
			result: {
				supportedStandards: [
					{
						name: 'ICRC-25',
						url: 'https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-25/ICRC-25.md'
					},
					{
						name: 'ICRC-27',
						url: 'https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-27/ICRC-27.md'
					},
					{
						name: 'ICRC-49',
						url: 'https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-49/ICRC-49.md'
					}
				]
			}
		});

		window.opener.postMessage(msg, { targetOrigin: this.#walletOrigin });
	}

	private async onGreetings(params: IcrcWalletCallCanisterParamsType | undefined) {
		// TODO: handle error
		assertNonNullish(params);

		// TODO: message content

		const { arg, method } = params;

		const message = await walletConsentMessage({
			identity: get(authStore).identity,
			args: {
				arg,
				method,
				user_preferences: {
					metadata: {
						language: 'en'
					},
					device_spec: toNullable()
				}
			}
		});

		this.#callbackOnGreetings({ message, arg });
	}

	private onGetAccounts() {
		const owner = get(authStore)?.identity?.getPrincipal();

		assertNonNullish(owner);

		// TODO: Create a type IcrcAccountForPostMessage
		const account: { owner: string } = {
			owner: owner.toText()
		};

		// TODO: type response
		const msg = IcrcWalletGetAccountsResponse.parse({
			jsonrpc: JSON_RPC_VERSION_2,
			result: {
				accounts: [account]
			}
		});

		window.opener.postMessage(msg, { targetOrigin: this.#walletOrigin });
	}

	// TODO: id back and forth
	approveGreetings = async ({ identity, arg }: { identity: OptionIdentity; arg: IcrcBlobType }) => {
		// TODO: according Frederik we should not decode the args and use agent-js standard DX to make calls
		const [args] = IDL.decode([IDL.Text], arrayOfNumberToUint8Array(arg));
		assertNonNullish(args);

		const message = await walletGreet({
			identity,
			args: `${args}`
		});

		// TODO: sending the message in plain without certificate is just meant for demo
		const msg = IcrcWalletGreetingsResponse.parse({
			jsonrpc: JSON_RPC_VERSION_2,
			result: {
				message
			}
		});

		// TODO: walletOrigin is defined - should be saved in session

		window.opener.postMessage(msg, { targetOrigin: this.#walletOrigin });
	};

	private onMessage = async ({
		data,
		origin
	}: MessageEvent<
		Partial<
			| IcrcWalletPermissionsRequestType
			| IcrcWalletStandardsRequestType
			| IcrcWalletGetAccountsRequestType
			| IcrcWalletCallCanisterRequestType
		>
	>) => {
		// TODO: this is ugly
		if (nonNullish(this.#walletOrigin) && this.#walletOrigin !== origin) {
			// TODO error
			// TODO mmmmh second access walletOrigin is not defined
		} else if (isNullish(this.#walletOrigin)) {
			this.#walletOrigin = origin;
		}

		const { method } = data;

		switch (method) {
			case ICRC25_REQUEST_PERMISSIONS:
				this.onRequestPermissions(data?.params);
				break;
			case ICRC25_SUPPORTED_STANDARDS:
				this.onSupportedStandards();
				break;
			case ICRC27_GET_ACCOUNTS:
				this.onGetAccounts();
				break;
			case ICRC49_CALL_CANISTER:
				await this.onGreetings(data?.params);
				break;
		}
	};
}
