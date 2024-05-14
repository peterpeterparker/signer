import { authStore } from '$core/stores/auth.store';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	ICRC29_READY,
	IcrcWalletGetAccountsResponse,
	IcrcWalletPermissionsResponse,
	type IcrcWalletGetAccountsRequestType,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType,
	type IcrcWalletRequestParamsType,
	type IcrcWalletScopesArrayType,
	type IcrcWalletSupportedMethodType
} from '$core/types/icrc';
import { JSON_RPC_VERSION_2 } from '$core/types/rpc';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

interface IcrcSignerInit {
	acceptMethods: IcrcWalletSupportedMethodType[];
	onRequestPermissions: (scopes: IcrcWalletScopesArrayType) => void;
}

export class IcrcSigner {
	private walletOrigin: string | undefined;
	private acceptMethods: IcrcWalletSupportedMethodType[];
	private callbackOnRequestPermissions: (scopes: IcrcWalletScopesArrayType) => void;

	private constructor({ acceptMethods, onRequestPermissions }: IcrcSignerInit) {
		this.acceptMethods = acceptMethods;
		this.callbackOnRequestPermissions = onRequestPermissions;

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

		// TODO: walletOrigin is defined

		window.opener.postMessage(msg, { targetOrigin: this.walletOrigin });
	};

	private onRequestPermissions(params: IcrcWalletRequestParamsType | undefined) {
		// TODO error
		assertNonNullish(params);

		const { scopes } = params;

		const acceptableScopes = scopes.filter(({ method }) => this.acceptMethods.includes(method));

		if (acceptableScopes.length === 0) {
			// TODO: error
		}

		this.callbackOnRequestPermissions(acceptableScopes);
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

		window.opener.postMessage(msg, { targetOrigin: this.walletOrigin });
	}

	private onMessage = ({
		data,
		origin
	}: MessageEvent<
		Partial<IcrcWalletPermissionsRequestType | IcrcWalletGetAccountsRequestType>
	>) => {
		if (nonNullish(this.walletOrigin) && this.walletOrigin !== origin) {
			// TODO error
			// TODO mmmmh second access walletOrigin is not defined
		}

		this.walletOrigin = origin;

		const { method } = data;

		switch (method) {
			case ICRC25_REQUEST_PERMISSIONS:
				this.onRequestPermissions(data?.params);
				break;
			case ICRC27_GET_ACCOUNTS:
				this.onGetAccounts();
				break;
		}
	};
}
