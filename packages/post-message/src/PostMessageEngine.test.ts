import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

import { JSDOM } from "jsdom";

import PostMessageEngine, { PostMessageEvent } from "./PostMessageEngine.js";

describe("PostMessageEngine", () => {
  beforeEach(() => {
    // @ts-expect-error JSDOM Window mismatch
    global.window = new JSDOM("").window;
    // Replaces the global window instance's postMessage implementation in order to
    // set event source or origin which our post message engine depends on to filter messages: https://github.com/jsdom/jsdom/issues/2745
    /* eslint-disable-next-line */
    window.postMessage = (message: any) => {
      window.dispatchEvent(
        new window.MessageEvent("message", {
          source: window,
          origin: "example.com",
          data: message,
        }),
      );
    };
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
    const m = mock.fn(window.postMessage);

    Object.defineProperty(window, "postMessage", {
      value: m,
    });

    const engine = new PostMessageEngine({
      name: "",
      targetName: "b",
      targetOrigin: "http://test-origin.com",
    });

    const payload = { value: "test" };
    engine.send(payload);
    assert.equal(m.mock.callCount(), 1);
  });

  // postMessage is a async event so in order for the messages to be recieved this
  // test must be async with the timeout at the end. Timeout for postMessage is 0,
  // so 100 is sufficient to complete the tests correctly.
  it("validate listen only acts on expected messages", async () => {
    const sender = new PostMessageEngine({
      name: "pm_a",
      targetName: "pm_B",
      targetOrigin: "*",
    });
    const reciever = new PostMessageEngine({
      name: "pm_B",
      targetName: "pm_a",
      targetOrigin: "*",
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    const cb = mock.fn((_: PostMessageEvent) => {});
    reciever.listen(cb);

    // Valid Request - Should call cb
    sender.send({ value: "test" });

    // Invalid Requests - Should not call cb
    window.postMessage({}, "*");
    window.postMessage({ targetName: "zss", data: {} }, "*");
    window.postMessage("FAKE", "*");
    window.postMessage({ targetName: "asd" }, "*");

    await new Promise(resolve => {
      setTimeout(() => {
        assert.equal(cb.mock.callCount(), 1);
        sender.destroy();
        reciever.destroy();
        resolve(null);
      }, 100);
    });
  });

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
