import type { Either } from '../utils/ts.utils';

// https://www.jsonrpc.org/specification#conventions

export type JsonRpc = '2.0';
export type RpcId = string | number | null;

export interface RpcRequest<RpcMethod extends string, RpcParams = never> {
	jsonrpc: JsonRpc;
	method: RpcMethod;
	params?: RpcParams;
	id?: RpcId;
}

export type RpcNotification<RpcMethod extends string, RpcParams = never> = Omit<
	RpcRequest<RpcMethod, RpcParams>,
	'id'
>;

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

export interface RpcResponseError<RpcErrorData = never> {
	code: number | RpcErrorCode;
	message: string;
	data?: RpcErrorData;
}

export type RpcResponse<RpcResult, RpcErrorData> = {
	jsonrpc: JsonRpc;
	id: RpcId;
} & Either<{ result?: RpcResult }, { error?: RpcResponseError<RpcErrorData> }>;
