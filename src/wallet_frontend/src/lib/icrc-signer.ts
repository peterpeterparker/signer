import { walletConsentMessage, walletGreet } from '$core/api/backend.api';
import { authStore } from '$core/stores/auth.store';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	ICRC29_READY,
	ICRC49_CALL_CANISTER,
	IcrcWalletGetAccountsResponse,
	IcrcWalletPermissionsResponse,
	type IcrcWalletGetAccountsRequestType,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType,
	type IcrcWalletRequestParamsType,
	type IcrcWalletScopesArrayType,
	type IcrcWalletSupportedMethodType, type IcrcBlobType
} from '$core/types/icrc';
import {
	type IcrcWalletGreetingsParamsType,
	type IcrcWalletGreetingsRequestType, IcrcWalletGreetingsResponse
} from '$core/types/icrc-demo';
import { JSON_RPC_VERSION_2 } from '$core/types/rpc';
import type { Result } from '$declarations/wallet_backend/wallet_backend.did';
import { IDL } from '@dfinity/candid';
import {
	arrayOfNumberToUint8Array,
	assertNonNullish, isNullish,
	nonNullish,
	toNullable
} from '@dfinity/utils';
import { get } from 'svelte/store';
import type { OptionIdentity } from '$core/types/identity';

interface IcrcSignerInit {
	acceptMethods: IcrcWalletSupportedMethodType[];
	onRequestPermissions: (scopes: IcrcWalletScopesArrayType) => void;
	onGreetings: (params: {message: Result, arg: IcrcBlobType}) => void;
}

export class IcrcSigner {
	#walletOrigin: string | undefined;

	readonly #acceptMethods: IcrcWalletSupportedMethodType[];
	readonly #callbackOnRequestPermissions: (scopes: IcrcWalletScopesArrayType) => void;
	readonly #callbackOnGreetings: (params: {message: Result, arg: IcrcBlobType}) => void;

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

	private async onGreetings(params: IcrcWalletGreetingsParamsType | undefined) {
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

		this.#callbackOnGreetings({message, arg});
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
	approveGreetings = async ({identity, arg}: {identity: OptionIdentity, arg: IcrcBlobType}) => {
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
			| IcrcWalletGetAccountsRequestType
			| IcrcWalletGreetingsRequestType
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
			case ICRC27_GET_ACCOUNTS:
				this.onGetAccounts();
				break;
			case ICRC49_CALL_CANISTER:
				await this.onGreetings(data?.params);
				break;
		}
	};
}
