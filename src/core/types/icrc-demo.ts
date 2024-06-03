import { z } from 'zod';
import { inferRpcResponse } from './rpc';

// TODO: a real response should be provided with a contentMap and certificate
// https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_49_call_canister.md#result
const DummyResponse = z.object({
	message: z.string()
});

export const IcrcWalletGreetingsResponse = inferRpcResponse(DummyResponse);

export type IcrcWalletGreetingsResponseType = z.infer<typeof IcrcWalletGreetingsResponse>;
