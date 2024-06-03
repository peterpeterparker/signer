import { z } from 'zod';
import { inferRpcResponse } from './rpc';

// TODO: a real response should be provided with a contentMap and certificate
// https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_49_call_canister.md#result
const GreetingsResponseData = z.object({
	message: z.string()
});

export const IcrcWalletGreetingsResponse = inferRpcResponse(GreetingsResponseData);

export type IcrcWalletGreetingsResponseType = z.infer<typeof IcrcWalletGreetingsResponse>;

// TODO: a real response should be provided with a contentMap and certificate
// https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_49_call_canister.md#result

const IcrcApproveResponseData = z.object({
	blockIndex: z.bigint()
});

export const IcrcApproveResponse = inferRpcResponse(IcrcApproveResponseData);

export type IcrcApproveResponseType = z.infer<typeof IcrcApproveResponse>;
