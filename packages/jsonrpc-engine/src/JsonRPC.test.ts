import {
  NewRequest,
  NewSuccessResponse,
  NewErrorResponse,
  JsonRPCError,
} from "./JsonRPC";

describe("JsonRPC", () => {
  describe("NewRequest", () => {
    it("check valid json rpc request", () => {
      const result = NewRequest("test", [1, 2]);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("jsonrpc", "2.0");
      expect(result.method).toEqual("test");
      expect(result.params).toEqual([1, 2]);
    });
  });

  describe("NewSuccessResponse", () => {
    it("check valid json rpc success response", () => {
      const result = NewSuccessResponse<string>("1", "test");
      expect(result).toHaveProperty("id", "1");
      expect(result).toHaveProperty("jsonrpc", "2.0");
      expect(result).toHaveProperty("result", "test");
      const idx = Object.keys(result).findIndex(value => value === "error");
      expect(idx).toBe(-1);
    });
  });

  describe("NewErrorResponse", () => {
    it("check valid json rpc error response", () => {
      const error = { code: 400, message: "failure", data: "some stack" };
      const result = NewErrorResponse<string>("1", error);
      expect(result).toHaveProperty("id", "1");
      expect(result).toHaveProperty("jsonrpc", "2.0");
      expect(result.error).toMatchObject(error);
      const idx = Object.keys(result).findIndex(value => value === "result");
      expect(idx).toBe(-1);
    });
  });

  describe("JsonRPCError", () => {
    it("error obj should contain error response", () => {
      const data = { secret: "sauce" };
      const error = new JsonRPCError("1", 400, "Bad Request", data);
      expect(error.jsonrpc).toBeDefined();
      expect(error.jsonrpc.error).toBeDefined();
      expect(error.jsonrpc.result).toBeUndefined();
    });
  });
});
