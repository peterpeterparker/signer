import type { RpcNotification } from './rpc';

export enum SignerRpcMethod {
	ICRC29_READY = 'icrc29_ready'
}

export type SignerRpcNotification = RpcNotification<SignerRpcMethod>;
