import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  NewRequest,
  NewSuccessResponse,
  NewErrorResponse,
  JsonRPCError,
} from "./JsonRPC.js";

describe("JsonRPC", () => {
  describe("NewRequest", () => {
    it("check valid json rpc request", () => {
      const result = NewRequest("test", [1, 2]);
      assert.ok(result.id);
      assert.equal(result.jsonrpc, "2.0");
      assert.equal(result.method, "test");
      assert.deepEqual(result.params, [1, 2]);
    });
  });

  describe("NewSuccessResponse", () => {
    it("check valid json rpc success response", () => {
      const result = NewSuccessResponse<string>("1", "test");
      assert.equal(result.id, "1");
      assert.equal(result.jsonrpc, "2.0");
      assert.equal(result.result, "test");
      const idx = Object.keys(result).findIndex(value => value === "error");
      assert.equal(idx, -1);
    });
  });

  describe("NewErrorResponse", () => {
    it("check valid json rpc error response", () => {
      const error = { code: 400, message: "failure", data: "some stack" };
      const result = NewErrorResponse<string>("1", error);
      assert.equal(result.id, "1");
      assert.equal(result.jsonrpc, "2.0");
      assert.deepEqual(result.error, error);
      const idx = Object.keys(result).findIndex(value => value === "result");
      assert.equal(idx, -1);
    });
  });

  describe("JsonRPCError", () => {
    it("error obj should contain error response", () => {
      const data = { secret: "sauce" };
      const error = new JsonRPCError("1", 400, "Bad Request", data);
      assert.ok(error.jsonrpc);
      assert.ok(error.jsonrpc.error);
      assert.ok(!error.jsonrpc.result);
    });
  });
});
