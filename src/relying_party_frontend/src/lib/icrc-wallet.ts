import type { SignerRpcNotification } from '$core/types/signer';

export type Unsubscribe = () => void;

export const initIcrcWallet = (): Unsubscribe => {
	window.addEventListener('message', onMessage);

	return () => {
		window.removeEventListener('message', onMessage);
	};
};

const onMessage = ({ data, origin }: MessageEvent<Partial<SignerRpcNotification>>) => {};
