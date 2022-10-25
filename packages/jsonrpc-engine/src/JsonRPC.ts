import { v4 as uuid } from "uuid";

/* JSON RPC SPEC: https://www.jsonrpc.org/specification */

export interface JsonRPCMessage {
  jsonrpc: "2.0";
  id: string;
}

export interface JsonRPCRequest extends JsonRPCMessage {
  method: string;
  params?: unknown[];
}

export interface ErrorPayload<E = unknown> {
  code: number;
  message: string;
  data?: E;
}

export interface JsonRPCResponse<R = unknown, E = unknown>
  extends JsonRPCMessage {
  result?: R;
  error?: ErrorPayload<E>;
}

export interface JsonRPCSuccessResponse<D = unknown> extends JsonRPCResponse {
  result: D;
}

export interface JsonRPCErrorResponse<E = unknown> extends JsonRPCResponse {
  error: ErrorPayload<E>;
}

export function NewRequest(method: string, params?: unknown[]): JsonRPCRequest {
  return { jsonrpc: "2.0", id: uuid(), method, params };
}

export function NewSuccessResponse<R = unknown>(
  id: string,
  result: R,
): JsonRPCSuccessResponse {
  return { jsonrpc: "2.0", id, result };
}

export function NewErrorResponse<E = unknown>(
  id: string,
  error: ErrorPayload<E>,
): JsonRPCErrorResponse<E> {
  return { jsonrpc: "2.0", id, error };
}

export class JsonRPCError<E = unknown> extends Error {
  jsonrpc: JsonRPCErrorResponse<E>;
  constructor(reqID: string, code: number, message: string, data?: E) {
    super(message);
    this.jsonrpc = NewErrorResponse<E>(reqID, { code, message, data });
  }
}
