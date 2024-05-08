import { z } from 'zod';

// https://www.jsonrpc.org/specification#conventions

const JsonRpc = z.literal('2.0');

const RpcId = z.union([z.string(), z.number(), z.null()]);

const Rpc = z.object({
	jsonrpc: JsonRpc,
	id: z.optional(RpcId)
});

const RpcRequest = Rpc.merge(
	z.object({
		method: z.string(),
		params: z.optional(z.never())
	})
);

export type RpcRequest = z.infer<typeof RpcRequest>;

export const RpcNotification = RpcRequest.omit({ id: true });

export type RpcNotification = z.infer<typeof RpcNotification>;

export enum RpcErrorCode {
	/**
	 * Invalid JSON was received by the server.
	 * An error occurred on the server while parsing the JSON text.
	 */
	PARSE_ERROR = -32700,
	/**
	 * The JSON sent is not a valid Request object.
	 */
	INVALID_REQUEST = -32600,
	/**
	 * The method does not exist / is not available.
	 */
	METHOD_NOT_FOUND = -32601,
	/**
	 * Invalid method parameter(s).
	 */
	INVALID_PARAMS = -32602,
	/**
	 * Internal JSON-RPC error.
	 */
	INTERNAL_ERROR = -32603,
	/**
	 * Reserved for implementation-defined server-errors.
	 */
	SERVER_ERROR = -32000
}

const RpcResponseError = z.object({
	code: z.union([z.number(), z.nativeEnum(RpcErrorCode)]),
	message: z.string(),
	data: z.optional(z.never())
});

const RpcResponse = Rpc.merge(
	z.object({
		result: z.never(),
		error: RpcResponseError
	})
)
	.partial()
	.refine((data) => data.result || data.error, 'Either first or second should be filled in.');

export type RpcResponse = z.infer<typeof RpcResponse>;
