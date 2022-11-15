import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { JSDOM } from "jsdom";

import { JsonRPCError, JsonRPCRequest, NewSuccessResponse } from "./JsonRPC.js";
import JsonRPCEngine from "./JsonRPCEngine.js";

describe("JsonRPCEngine", () => {
  describe("call", () => {
    //@ts-expect-error JSDOM Window mismatch
    beforeEach(() => (global.window = new JSDOM("").window));
    it("call and wait for correct response", async () => {
      const sender = new JsonRPCEngine({
        name: "jsonrpc_sender",
        targetName: "jsonrpc_receiver",
        targetOrigin: "*",
      });

      const reciever = new JsonRPCEngine({
        name: "jsonrpc_receiver",
        targetName: "jsonrpc_sender",
        targetOrigin: "*",
      });

      reciever.listen(evt => {
        const message = evt.data as JsonRPCRequest;
        assert.ok(message);
        assert.equal(message.method, "test");
        assert.deepEqual(message.params, [1, 2]);
        reciever.send(NewSuccessResponse(message.id, true));
      });

      assert.doesNotReject(sender.call<boolean>("test", 1, 2));

      sender.destroy();
      reciever.destroy();
    });

    it("call and handle returned error", async () => {
      const sender = new JsonRPCEngine({
        name: "jsonrpc_sender_error",
        targetName: "jsonrpc_receiver_error",
        targetOrigin: "*",
      });

      const reciever = new JsonRPCEngine({
        name: "jsonrpc_receiver_error",
        targetName: "jsonrpc_sender_error",
        targetOrigin: "*",
      });

      const err = new JsonRPCError("1", 400, "failure");

      reciever.listen(evt => {
        const message = evt.data as JsonRPCRequest;
        reciever.send(new JsonRPCError(message.id, 400, "failure").jsonrpc);
      });

      assert.rejects(sender.call<boolean>("test", 1, 2), err.jsonrpc.error);
    });

    it("no error or result", async () => {
      const sender = new JsonRPCEngine({
        name: "jsonrpc_sender_no_payload",
        targetName: "jsonrpc_receiver_no_payload",
        targetOrigin: "*",
      });

      const reciever = new JsonRPCEngine({
        name: "jsonrpc_receiver_no_payload",
        targetName: "jsonrpc_sender_no_payload",
        targetOrigin: "*",
      });

      const err = new JsonRPCError("1", 500, "Internal Error");
      reciever.listen(evt => {
        const message = evt.data as JsonRPCRequest;
        // @ts-expect-error testing failure case
        reciever.send({ id: message.id });
      });
      assert.rejects(sender.call<boolean>("test", 1, 2), err.jsonrpc.error);
    });

    it("fail on timeout", async () => {
      const sender = new JsonRPCEngine({
        name: "timeout",
        targetName: "don't_need",
        targetOrigin: "*",
        timeout: 5,
      });
      assert.rejects(sender.call<boolean>("test", 1));
    });
  });
});
