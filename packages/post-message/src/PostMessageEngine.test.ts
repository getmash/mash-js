import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { JSDOM } from "jsdom";
import sinon from "sinon";

import PostMessageEngine from "./PostMessageEngine.js";

// help out sinon with overloaded function by defining the one post message uses
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/36436
type PostMessageSpy = sinon.SinonSpy<
  [message: any, targetOrigin: string, transfer?: Transferable[]],
  void
>;

describe("PostMessageEngine", () => {
  //@ts-expect-error JSDOM Window mismatch
  beforeEach(() => (global.window = new JSDOM("").window));

  // setup sandbox
  const sandbox = sinon.createSandbox();
  afterEach(() => {
    sandbox.restore();
  });

  it("can set target origin", () => {
    const engine = new PostMessageEngine({
      name: "",
      targetName: "",
      targetOrigin: "test-origin",
    });
    // @ts-expect-error Target Origin is a private variable we want to verify
    assert.equal(engine._targetOrigin, "test-origin");
  });

  it("check postMessage is sent with correct details", () => {
    const spy = sandbox.stub(
      window,
      "postMessage",
    ) as unknown as PostMessageSpy;
    const engine = new PostMessageEngine({
      name: "",
      targetName: "b",
      targetOrigin: "http://test-origin.com",
    });

    const payload = { value: "test" };
    engine.send(payload);

    assert.ok(
      spy.calledWith(
        {
          targetName: "b",
          data: payload,
        },
        "http://test-origin.com",
      ),
    );
  });

  // postMessage is a async event so in order for the messages to be recieved this
  // test must be async with the timeout at the end. Timeout for postMessage is 0,
  // so 100 is sufficient to complete the tests correctly.
  // it("validate listen only acts on expected messages", async () => {
  //   const sender = new PostMessageEngine({
  //     name: "pm_a",
  //     targetName: "pm_B",
  //     targetOrigin: "*",
  //   });
  //   const reciever = new PostMessageEngine({
  //     name: "pm_B",
  //     targetName: "pm_a",
  //     targetOrigin: "*",
  //   });
  //   const cb = jest.fn();
  //   reciever.listen(cb);
  //   // Valid Request - Should call cb
  //   sender.send({ value: "test" });
  //   // Invalid Requests - Should not call cb
  //   window.postMessage({}, "*");
  //   window.postMessage({ targetName: "zss", data: {} }, "*");
  //   window.postMessage("FAKE", "*");
  //   window.postMessage({ targetName: "asd" }, "*");
  //   await new Promise(resolve => {
  //     setTimeout(() => {
  //       expect(cb).toHaveBeenCalledTimes(1);
  //       sender.destroy();
  //       reciever.destroy();
  //       resolve(null);
  //     }, 100);
  //   });
  // });

  it("validate destroy removes all listener", () => {
    const sender = new PostMessageEngine({
      name: "",
      targetName: "",
      targetOrigin: "*",
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sender.listen(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sender.listen(() => {});
    // @ts-expect-error testing the private value
    assert.equal(Object.keys(sender._listeners).length, 2);
    sender.destroy();
    // @ts-expect-error testing the private value
    assert.equal(Object.keys(sender._listeners).length, 0);
  });

  it("validate unsubscribe function removes correct listener", () => {
    const sender = new PostMessageEngine({
      name: "",
      targetName: "",
      targetOrigin: "*",
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const unsubscriber = sender._listen(() => {}, "1");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sender._listen(() => {}, "2");
    // @ts-expect-error testing the private value
    assert.equal(Object.keys(sender._listeners).length, 2);
    unsubscriber();
    // @ts-expect-error testing the private value
    assert.equal(Object.keys(sender._listeners).length, 1);
    // @ts-expect-error testing the private value
    assert.ok(sender._listeners["2"]);
  });

  describe("_shouldIgnoreMessage", () => {
    // Some issues with nested describes in the test runner so re-setting window
    // Can drop when we pick up: https://github.com/nodejs/node/pull/45161
    //@ts-expect-error JSDOM Window mismatch
    beforeEach(() => (global.window = new JSDOM("").window));

    it("ignore on origin check", () => {
      const validEvent = {
        origin: "zz",
        source: window,
        data: {
          targetName: "zz",
          data: { value: "testing" },
        },
      };
      const tester = new PostMessageEngine({
        name: "zz",
        targetName: "ww",
        targetOrigin: "good",
      });

      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        origin: "badddd",
      });
      assert.ok(result);
    });

    it("ignore on invalid message body", () => {
      const validEvent = {
        origin: "zz",
        source: window,
        data: {
          targetName: "zz",
          data: { value: "testing" },
        },
      };
      const tester = new PostMessageEngine({
        name: "zz",
        targetName: "ww",
        targetOrigin: "*",
      });
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({ ...validEvent, data: 2 });
      assert.ok(result);
    });

    it("ignore on target name mismatch", () => {
      const validEvent = {
        origin: "zz",
        source: window,
        data: {
          targetName: "zz",
          data: { value: "testing" },
        },
      };
      const tester = new PostMessageEngine({
        name: "zz",
        targetName: "ww",
        targetOrigin: "*",
      });
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        data: { ...validEvent.data, targetName: "badddd" },
      });
      assert.ok(result);
    });

    it("ignore on no data", () => {
      const validEvent = {
        origin: "zz",
        source: window,
        data: {
          targetName: "zz",
          data: { value: "testing" },
        },
      };
      const tester = new PostMessageEngine({
        name: "zz",
        targetName: "ww",
        targetOrigin: "*",
      });
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        // @ts-expect-error testing the private value
        data: { ...validEvent, data: undefined },
      });
      assert.ok(result);
    });

    it("ignore on target window mismatch", () => {
      const validEvent = {
        origin: "zz",
        source: window,
        data: {
          targetName: "zz",
          data: { value: "testing" },
        },
      };
      const tester = new PostMessageEngine({
        name: "zz",
        targetName: "ww",
        targetOrigin: "*",
      });
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        source: {} as MessageEventSource,
      });
      assert.ok(result);
    });

    it("valid event should not ignore", () => {
      const validEvent = {
        origin: "zz",
        source: window,
        data: {
          targetName: "zz",
          data: { value: "testing" },
        },
      };
      const tester = new PostMessageEngine({
        name: "zz",
        targetName: "ww",
        targetOrigin: "*",
      });
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage(validEvent);
      assert.ok(!result);
    });
  });
});
