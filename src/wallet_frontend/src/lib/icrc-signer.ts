import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC29_READY,
	type IcrcWalletNotificationType,
	type IcrcWalletRequestMethodType,
	type IcrcWalletRequestParamsType,
	type IcrcWalletRequestScopesType,
	type IcrcWalletRequestType
} from '$core/types/icrc';
import { assertNonNullish, nonNullish } from '@dfinity/utils';

interface IcrcSignerInit {
	acceptMethods: IcrcWalletRequestMethodType[];
	onRequestPermissions: (scopes: IcrcWalletRequestScopesType) => void;
}

export class IcrcSigner {
	private walletOrigin: string | undefined;
	private acceptMethods: IcrcWalletRequestMethodType[];
	private callbackOnRequestPermissions: (scopes: IcrcWalletRequestScopesType) => void;

	private constructor({ acceptMethods, onRequestPermissions }: IcrcSignerInit) {
		this.acceptMethods = acceptMethods;
		this.callbackOnRequestPermissions = onRequestPermissions;

		window.addEventListener('message', this.onMessage);
	}

	static init(params: IcrcSignerInit): IcrcSigner {
		const notifyReady = () => {
			const msg: IcrcWalletNotificationType = {
				jsonrpc: '2.0',
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

	private onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletRequestType>>) => {
		if (nonNullish(this.walletOrigin) && this.walletOrigin !== origin) {
			// TODO error
		}

		this.walletOrigin = origin;

		const { method, params } = data;

		switch (method) {
			case ICRC25_REQUEST_PERMISSIONS:
				this.onRequestPermissions(params);
				break;
		}
	};
}
