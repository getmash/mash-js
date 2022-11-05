import PostMessageEngine from "./PostMessageEngine";

describe("PostMessageEngine", () => {
  it("can set target origin", () => {
    const engine = new PostMessageEngine({
      name: "",
      targetName: "",
      targetOrigin: "test-origin",
    });
    // @ts-expect-error Target Origin is a private variable we want to verify
    expect(engine._targetOrigin).toBe("test-origin");
  });

  it("check postMessage is sent with correct details", () => {
    const spy = jest.spyOn(window, "postMessage");
    const engine = new PostMessageEngine({
      name: "",
      targetName: "b",
      targetOrigin: "http://test-origin.com",
    });

    const payload = { value: "test" };
    engine.send(payload);
    expect(spy).toHaveBeenCalledWith(
      {
        targetName: "b",
        data: payload,
      },
      "http://test-origin.com",
    );
  });

  // postMessage is a async event so in order for the messages to be recieved this
  // test must be async with the timeout at the end. Timeout for postMessage is 0,
  // so 100 is sufficient to complete the tests correctly.
  it("validate listen only acts on expected messages", async () => {
    expect.assertions(1);
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
    const cb = jest.fn();
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
        expect(cb).toHaveBeenCalledTimes(1);
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
    expect(Object.keys(sender._listeners).length).toBe(2);
    sender.destroy();
    // @ts-expect-error testing the private value
    expect(Object.keys(sender._listeners).length).toBe(0);
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
    expect(Object.keys(sender._listeners).length).toBe(2);
    unsubscriber();
    // @ts-expect-error testing the private value
    expect(Object.keys(sender._listeners).length).toBe(1);
    // @ts-expect-error testing the private value
    expect(sender._listeners["2"]).toBeDefined();
  });

  describe("_shouldIgnoreMessage", () => {
    const tester = new PostMessageEngine({
      name: "zz",
      targetName: "ww",
      targetOrigin: "*",
    });

    const validEvent = {
      origin: "zz",
      source: window,
      data: {
        targetName: "zz",
        data: { value: "testing" },
      },
    };

    it("ignore on origin check", () => {
      // @ts-expect-error testing the private value
      tester._targetOrigin = "good";
      // @ts-expect-error testing the private value

      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        origin: "badddd",
      });
      expect(result).toBe(true);
      // @ts-expect-error testing the private value
      tester._targetOrigin = "*";
    });

    it("ignore on invalid message body", () => {
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({ ...validEvent, data: 2 });
      expect(result).toBe(true);
    });

    it("ignore on target name mismatch", () => {
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        data: { ...validEvent.data, targetName: "badddd" },
      });
      expect(result).toBe(true);
    });

    it("ignore on no data", () => {
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        // @ts-expect-error testing the private value
        data: { ...validEvent, data: undefined },
      });
      expect(result).toBe(true);
    });

    it("ignore on target window mismatch", () => {
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage({
        ...validEvent,
        source: {} as MessageEventSource,
      });
      expect(result).toBe(true);
    });

    it("valid event should not ignore", () => {
      // @ts-expect-error testing the private value
      const result = tester._shouldIgnoreMessage(validEvent);
      expect(result).toBe(false);
    });
  });
});
