import { WALLET_POPUP_HEIGHT, WALLET_POPUP_WIDTH } from '$core/constants/app.constants';
import { SignerRpcNotification, type SignerRpcNotificationType } from '$core/types/signer';
import { popupTopRight } from '$core/utils/window.utils';

export class IcrcWallet {
	private constructor(private walletOrigin: string | undefined) {}

	static connect(): Promise<IcrcWallet> {
		return new Promise<IcrcWallet>((resolve) => {
			const popup = window.open(
				'http://localhost:5174',
				'walletWindow',
				popupTopRight({ width: WALLET_POPUP_WIDTH, height: WALLET_POPUP_HEIGHT })
			);

			const onMessage = ({ data, origin }: MessageEvent<Partial<SignerRpcNotificationType>>) => {
				const notification = SignerRpcNotification.parse(data);
				console.log(notification);

				popup?.close();

				const wallet = new IcrcWallet(origin);
				resolve(wallet);
			};

			window?.addEventListener('message', onMessage);
		});
	}
}
