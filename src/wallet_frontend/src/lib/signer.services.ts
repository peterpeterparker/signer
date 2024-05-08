import { SignerRpcMethod, type SignerRpcNotification } from '$core/types/signer';

// We broadcast the message because there is no caller yet. This is safe since it does not include any data exchange.
export const notifyReady = () => {
	const msg: SignerRpcNotification = {
		jsonrpc: '2.0',
		method: SignerRpcMethod.ICRC29_READY
	};

	parent.postMessage(msg, '*');
};
