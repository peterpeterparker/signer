import { WALLET_POPUP_HEIGHT, WALLET_POPUP_WIDTH } from '$core/constants/app.constants';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	IcrcWalletGetAccountsResponse,
	IcrcWalletNotification,
	IcrcWalletPermissionsResponse,
	type IcrcWalletGetAccountsRequestType,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType
} from '$core/types/icrc';
import { JSON_RPC_VERSION_2, RpcRequest } from '$core/types/rpc';
import { popupTopRight } from '$core/utils/window.utils';
import type { IcrcAccount } from '@dfinity/ledger-icrc';
import { nonNullish } from '@dfinity/utils';

export class IcrcWallet {
	private constructor(private walletOrigin: string | undefined) {}

	static connect(): Promise<IcrcWallet> {
		return new Promise<IcrcWallet>((resolve) => {
			const popup = window.open(
				'http://localhost:5174',
				'walletWindow',
				popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
			);

			let walletOrigin: string | undefined = undefined;

			const onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletNotificationType>>) => {
				console.log(data, origin);

				if (nonNullish(walletOrigin) && walletOrigin !== origin) {
					// TODO
					throw new Error('Invalid origin');
				}

				walletOrigin = origin;

				const { success: isRpcRequest } = RpcRequest.safeParse(data);

				if (isRpcRequest) {
					// TODO: Parse throw an error if not expected msg.
					const notification = IcrcWalletNotification.parse(data);
					console.log(notification);

					const msg: IcrcWalletPermissionsRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC25_REQUEST_PERMISSIONS,
						params: {
							scopes: [{ method: ICRC27_GET_ACCOUNTS }]
						}
					};

					popup?.postMessage(msg, { targetOrigin: origin });
					return;
				}

				const response = IcrcWalletPermissionsResponse.parse(data);

				console.log('RESULT ----> ', response.result);

				// TODO: I'm not convinced by this pattern. Really handy but, not beautiful
				popup?.close();

				window.removeEventListener('message', onMessage);

				const wallet = new IcrcWallet(origin);
				resolve(wallet);
			};

			// TODO: create popup after registering this event
			window.addEventListener('message', onMessage);
		});
	}

	getAccounts = (): Promise<IcrcAccount[]> => {
		return new Promise<IcrcAccount[]>((resolve) => {
			const popup = window.open(
				'http://localhost:5174',
				'walletWindow',
				popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
			);

			// TODO: assert popup non nullish

			const onMessage = ({ data, origin }: MessageEvent<Partial<IcrcWalletNotificationType>>) => {
				if (nonNullish(this.walletOrigin) && this.walletOrigin !== origin) {
					// TODO
					throw new Error('Invalid origin');
				}

				const { success: isRpcRequest } = RpcRequest.safeParse(data);

				if (isRpcRequest) {
					// TODO: Parse throw an error if not expected msg - wallet is ready
					const _notification = IcrcWalletNotification.parse(data);

					// TODO: id with nanoid back and forth
					const msg: IcrcWalletGetAccountsRequestType = {
						jsonrpc: JSON_RPC_VERSION_2,
						method: ICRC27_GET_ACCOUNTS
					};

					popup?.postMessage(msg, { targetOrigin: this.walletOrigin });
					return;
				}

				console.log(data);

				const response = IcrcWalletGetAccountsResponse.parse(data);

				console.log('RESULT ----> ', response.result);

				// TODO: I'm not convinced by this pattern. Really handy but, not beautiful
				popup?.close();

				window.removeEventListener('message', onMessage);

				resolve([]);
			};

			// TODO: create popup after registering this event
			window.addEventListener('message', onMessage);
		});
	};
}
