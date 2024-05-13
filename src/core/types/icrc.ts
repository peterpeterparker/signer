import { RpcNotification, RpcRequest } from '$core/types/rpc';
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

// Responses

export const IcrcWalletNotification = z
	.object({
		method: IcrcWalletMethod.extract([ICRC29_READY])
	})
	.merge(RpcNotification.omit({ method: true }));

export type IcrcWalletNotificationType = z.infer<typeof IcrcWalletNotification>;

// TODO: IcrcWalletGetAccountsResponse with RpcResponse<Generic>

// TODO: split request and response?

// Requests

const IcrcWalletRequestScopes = z.array(
	z.object({
		method: IcrcWalletRequestMethod
	})
);

export type IcrcWalletRequestScopesType = z.infer<typeof IcrcWalletRequestScopes>;

const IcrcWalletRequestParams = z.object({
	scopes: IcrcWalletRequestScopes
});

export type IcrcWalletRequestParamsType = z.infer<typeof IcrcWalletRequestParams>;

export const IcrcWalletPermissionsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC25_REQUEST_PERMISSIONS]),
		params: IcrcWalletRequestParams
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletPermissionsRequestType = z.infer<typeof IcrcWalletPermissionsRequest>;

export const IcrcWalletGetAccountsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC27_GET_ACCOUNTS])
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletGetAccountsRequestType = z.infer<typeof IcrcWalletGetAccountsRequest>;
