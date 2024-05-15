import { z } from 'zod';
import { ICRC49_CALL_CANISTER, IcrcBlob, IcrcWalletMethod } from './icrc';
import { RpcRequest, inferRpcResponse } from './rpc';

// TODO: regex for canisterId and principal?
const IcrcWalletGreetingsParams = z.object({
	canisterId: z.string(),
	sender: z.string(),
	method: z.string(),
	arg: IcrcBlob
});

export type IcrcWalletGreetingsParamsType = z.infer<typeof IcrcWalletGreetingsParams>;

export const IcrcWalletGreetingsRequest = z
	.object({
		method: IcrcWalletMethod.extract([ICRC49_CALL_CANISTER]),
		params: IcrcWalletGreetingsParams
	})
	.merge(RpcRequest.omit({ method: true, params: true }));

export type IcrcWalletGreetingsRequestType = z.infer<typeof IcrcWalletGreetingsRequest>;

// TODO: a real response should be provided with a contentMap and certificate
// https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_49_call_canister.md#result
const DummyResponse = z.object({
	message: z.string()
});

export const IcrcWalletGreetingsResponse = inferRpcResponse(DummyResponse);
