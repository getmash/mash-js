import PostMessageEngine, {
  EngineListener,
  PostMessageEngineOptions,
} from "@getmash/post-message";

import {
  JsonRPCMessage,
  JsonRPCError,
  NewRequest,
  JsonRPCResponse,
  ErrorPayload,
} from "./JsonRPC";

export interface JsonRPCOptions extends PostMessageEngineOptions {
  // timeout in ms
  timeout?: number;
}

export type JsonRPCListener = EngineListener<JsonRPCMessage>;

export default class JsonRPCEngine extends PostMessageEngine<JsonRPCMessage> {
  // timeout in ms
  private timeout: number | null;

  constructor(options: JsonRPCOptions) {
    const { timeout, ...rest } = options;
    super(rest);
    this.timeout = timeout || null;
  }

  static _tryResolveMessage<TResult, TError>(
    data: JsonRPCResponse<TResult, TError>,
  ): [TResult | undefined, ErrorPayload<TError> | undefined] {
    return [data.result, data.error];
  }

  /**
   * Call function through PostMessage using JsonRPC format
   * @param method fn name to call
   * @param args arguments to pass into function
   * @returns Promise<T>
   */
  call<TResult, TError = unknown>(
    method: string,
    ...args: unknown[]
  ): Promise<TResult> {
    return new Promise((resolve, reject) => {
      const request = NewRequest(method, args);

      const timer = this.timeout
        ? setTimeout(() => {
            const timeoutError = new JsonRPCError(
              request.id,
              500,
              "Request timed out.",
            );
            reject(timeoutError.jsonrpc.error);
          }, this.timeout)
        : null;

      this._listen(evt => {
        const payload = evt.data;
        if (!payload || payload.id !== request.id) return;

        if (timer) {
          clearTimeout(timer);
        }

        const [result, err] = JsonRPCEngine._tryResolveMessage<TResult, TError>(
          payload,
        );
        this.unsubscribe(request.id);
        if (err) {
          reject(err);
          return;
        }

        if (!result) {
          const unknownError = new JsonRPCError(
            request.id,
            500,
            "Internal Error",
          );
          reject(unknownError.jsonrpc.error);
          return;
        }

        resolve(result);
      }, request.id);

      this.send(request);
    });
  }
}
