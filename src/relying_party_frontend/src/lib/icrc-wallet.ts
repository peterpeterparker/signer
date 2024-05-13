import { WALLET_POPUP_HEIGHT, WALLET_POPUP_WIDTH } from '$core/constants/app.constants';
import {
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	IcrcWalletNotification,
	type IcrcWalletNotificationType,
	type IcrcWalletPermissionsRequestType
} from '$core/types/icrc';
import { popupTopRight } from '$core/utils/window.utils';
import {JSON_RPC_VERSION_2, RpcRequest, RpcResponse} from "$core/types/rpc";
import {nonNullish} from "@dfinity/utils";

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
					throw new Error("Invalid origin");
				}

				walletOrigin = origin;

				const {success: isRpcRequest} = RpcRequest.safeParse(data);

				if (isRpcRequest) {
					// Parse throw an error if not expected msg.
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

				const response = RpcResponse.parse(data);

				console.log('RESULT ----> ', response.result);

				// TODO: I'm not convinced by this pattern. Really handy but, not beautiful
				popup?.close();

				window.removeEventListener('message', onMessage);

				const wallet = new IcrcWallet(origin);
				resolve(wallet);
			};

			window.addEventListener('message', onMessage);
		});
	}


}
