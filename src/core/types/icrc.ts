import { inferRpcResponse, RpcNotification, RpcRequest } from '$core/types/rpc';
import { z } from 'zod';

export const ICRC25_REQUEST_PERMISSIONS = 'icrc25_request_permissions';
export const ICRC27_GET_ACCOUNTS = 'icrc27_get_accounts';
export const ICRC32_SIGN_CHALLENGE = 'icrc32_sign_challenge';
export const ICRC29_READY = 'icrc29_ready';

export const IcrcWalletMethod = z.enum([
	ICRC25_REQUEST_PERMISSIONS,
	ICRC27_GET_ACCOUNTS,
	ICRC32_SIGN_CHALLENGE,
	ICRC29_READY
]);

const IcrcWalletRequestMethod = IcrcWalletMethod.exclude([
	ICRC25_REQUEST_PERMISSIONS,
	ICRC29_READY
]);

export type IcrcWalletSupportedMethodType = z.infer<typeof IcrcWalletRequestMethod>;

const IcrcWalletScopesArray = z.array(
	z.object({
		method: IcrcWalletRequestMethod
	})
);

export type IcrcWalletScopesArrayType = z.infer<typeof IcrcWalletScopesArray>;

const IcrcWalletScopes = z.object({
	scopes: IcrcWalletScopesArray
});

// Responses

export const IcrcWalletNotification = z
	.object({
		method: IcrcWalletMethod.extract([ICRC29_READY])
	})
	.merge(RpcNotification.omit({ method: true }));

export type IcrcWalletNotificationType = z.infer<typeof IcrcWalletNotification>;

export const IcrcAccount = z.object({
	owner: z.string(),
	subaccount: z.optional(z.array(z.number()))
});

export const IcrcWalletGetAccountsResponse = inferRpcResponse(
	z.object({
		accounts: z.array(IcrcAccount)
	})
);

export const IcrcWalletPermissionsResponse = inferRpcResponse(IcrcWalletScopes);

// TODO: split request and response?

// Requests

export type IcrcWalletRequestParamsType = z.infer<typeof IcrcWalletScopes>;

export const IcrcWalletPermissionsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC25_REQUEST_PERMISSIONS]),
		params: IcrcWalletScopes
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletPermissionsRequestType = z.infer<typeof IcrcWalletPermissionsRequest>;

export const IcrcWalletGetAccountsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC27_GET_ACCOUNTS])
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletGetAccountsRequestType = z.infer<typeof IcrcWalletGetAccountsRequest>;
