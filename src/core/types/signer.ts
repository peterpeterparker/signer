import { RpcNotification } from '$core/types/rpc';
import { z } from 'zod';

export enum SignerRpcMethod {
	ICRC29_READY = 'icrc29_ready'
}

const SignerRpcNotification = z
	.object({
		method: z.nativeEnum(SignerRpcMethod)
	})
	.merge(RpcNotification.omit({ method: true }));

export type SignerRpcNotification = z.infer<typeof SignerRpcNotification>;