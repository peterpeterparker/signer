import { z } from 'zod';
import { ICRC49_CALL_CANISTER, IcrcBlob, IcrcWalletGetAccountsRequest, IcrcWalletMethod } from './icrc';
import { RpcRequest } from './rpc';

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