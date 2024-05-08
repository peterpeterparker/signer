import {
	ICRC29_READY,
	type IcrcWalletNotificationType,
	type IcrcWalletRequestType
} from '$core/types/icrc';

export class IcrcSigner {
	private walletOrigin: string | undefined;

	private constructor() {
		window.addEventListener('message', this.onMessage);
	}

	static init(): IcrcSigner {
		const notifyReady = () => {
			const msg: IcrcWalletNotificationType = {
				jsonrpc: '2.0',
				method: ICRC29_READY
			};

			window.opener.postMessage(msg, '*');
		};

		notifyReady();

		return new IcrcSigner();
	}

	destroy = () => {
		window.removeEventListener('message', this.onMessage);
	};

	private onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletRequestType>>) => {
		console.log(data, origin);
	};
}
