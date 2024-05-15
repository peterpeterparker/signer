import { inferRpcResponse, RpcNotification, RpcRequest } from '$core/types/rpc';
import { z } from 'zod';

export const ICRC25_REQUEST_PERMISSIONS = 'icrc25_request_permissions';
export const ICRC25_SUPPORTED_STANDARDS = 'icrc25_supported_standards';
export const ICRC27_GET_ACCOUNTS = 'icrc27_get_accounts';
export const ICRC32_SIGN_CHALLENGE = 'icrc32_sign_challenge';
export const ICRC29_READY = 'icrc29_ready';
export const ICRC49_CALL_CANISTER = 'icrc49_call_canister';

export const IcrcWalletMethod = z.enum([
	ICRC25_REQUEST_PERMISSIONS,
	ICRC25_SUPPORTED_STANDARDS,
	ICRC27_GET_ACCOUNTS,
	// TODO: not implemented yet
	ICRC32_SIGN_CHALLENGE,
	ICRC29_READY,
	ICRC49_CALL_CANISTER
]);

const IcrcWalletRequestMethod = IcrcWalletMethod.exclude([
	ICRC25_REQUEST_PERMISSIONS,
	ICRC25_SUPPORTED_STANDARDS,
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

export type IcrcWalletScopesType = z.infer<typeof IcrcWalletScopes>;

// Responses

export const IcrcWalletNotification = z
	.object({
		method: IcrcWalletMethod.extract([ICRC29_READY])
	})
	.merge(RpcNotification.omit({ method: true }));

export type IcrcWalletNotificationType = z.infer<typeof IcrcWalletNotification>;

export const IcrcBlob = z.array(z.number());

export type IcrcBlobType = z.infer<typeof IcrcBlob>;

export const IcrcGetAccount = z.object({
	owner: z.string(),
	subaccount: z.optional(IcrcBlob)
});

export const IcrcGetAccountArray = z.array(IcrcGetAccount);

export type IcrcGetAccountArrayType = z.infer<typeof IcrcGetAccountArray>;

export const IcrcWalletGetAccountsResponse = inferRpcResponse(
	z.object({
		accounts: IcrcGetAccountArray
	})
);

export const IcrcWalletPermissionsResponse = inferRpcResponse(IcrcWalletScopes);

const IcrcSupportedStandard = z.object({
	// TODO: regex that includes only the possible standards?
	name: z.string().startsWith('ICRC-'),
	url: z.string().url()
});

export const IcrcSupportedStandardArray = z.array(IcrcSupportedStandard);

export type IcrcSupportedStandardArrayType = z.infer<typeof IcrcSupportedStandardArray>;

export const IcrcSupportedStandardsResponse = inferRpcResponse(
	z.object({
		supportedStandards: IcrcSupportedStandardArray
	})
);

// TODO: split request and response?

// Requests

export type IcrcWalletRequestParamsType = IcrcWalletScopesType;

export const IcrcWalletPermissionsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC25_REQUEST_PERMISSIONS]),
		params: IcrcWalletScopes
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletPermissionsRequestType = z.infer<typeof IcrcWalletPermissionsRequest>;

export const IcrcWalletStandardsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC25_SUPPORTED_STANDARDS])
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletStandardsRequestType = z.infer<typeof IcrcWalletStandardsRequest>;

export const IcrcWalletGetAccountsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC27_GET_ACCOUNTS])
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletGetAccountsRequestType = z.infer<typeof IcrcWalletGetAccountsRequest>;
