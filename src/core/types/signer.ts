import { RpcNotification } from '$core/types/rpc';
import { z } from 'zod';

export enum SignerRpcMethod {
	ICRC29_READY = 'icrc29_ready'
}

export const SignerRpcNotification = z
	.object({
		method: z.nativeEnum(SignerRpcMethod)
	})
	.merge(RpcNotification.omit({ method: true }));

export type SignerRpcNotificationType = z.infer<typeof SignerRpcNotification>;
