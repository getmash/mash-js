import { JsonRPCError, JsonRPCRequest, NewSuccessResponse } from "./JsonRPC";
import JsonRPCEngine from "./JsonRPCEngine";

describe("JsonRPCEngine", () => {
  describe("call", () => {
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
        expect(message).toBeDefined();
        expect(message.method).toBe("test");
        expect(message.params).toStrictEqual([1, 2]);
        reciever.send(NewSuccessResponse(message.id, true));
      });

      const result = await sender.call<boolean>("test", 1, 2);
      expect(result).toBe(true);

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

      await expect(sender.call<boolean>("test", 1, 2)).rejects.toEqual(
        err.jsonrpc.error,
      );
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

      await expect(sender.call<boolean>("test", 1, 2)).rejects.toEqual(
        err.jsonrpc.error,
      );
    });

    it("fail on timeout", async () => {
      const sender = new JsonRPCEngine({
        name: "timeout",
        targetName: "don't_need",
        targetOrigin: "*",
        timeout: 5,
      });

      await expect(sender.call("test", 1)).rejects.toStrictEqual(
        expect.objectContaining({ code: 500, message: "Request timed out." }),
      );
    });
  });
});
