import { RpcNotification } from '$core/types/rpc';
import { z } from 'zod';

export const ICRC25_REQUEST_PERMISSIONS = 'icrc25_request_permissions';
export const ICRC27_GET_ACCOUNTS = 'icrc27_get_accounts';
export const ICRC29_READY = 'icrc29_ready';

export const IcrcWalletMethod = z.enum([
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	ICRC29_READY
]);

export const IcrcWalletNotification = z
	.object({
		method: IcrcWalletMethod.extract([ICRC29_READY])
	})
	.merge(RpcNotification.omit({ method: true }));

export type IcrcWalletNotificationType = z.infer<typeof IcrcWalletNotification>;

const IcrcWalletRequestParams = z.object({
	scopes: z.array(
		z.object({
			method: IcrcWalletMethod.exclude([ICRC25_REQUEST_PERMISSIONS, ICRC29_READY])
		})
	)
});

export const IcrcWalletRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC25_REQUEST_PERMISSIONS]),
		params: IcrcWalletRequestParams
	})
	.merge(RpcNotification.omit({ method: true, params: true }));

export type IcrcWalletRequestType = z.infer<typeof IcrcWalletRequest>;
