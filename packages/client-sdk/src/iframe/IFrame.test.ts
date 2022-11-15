import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { JSDOM } from "jsdom";
import sinon from "sinon";

import PostMessageEngine, { PostMessageEvent } from "@getmash/post-message";

import IFrame, {
  Targets,
  EventMessage,
  Events,
  IFRAME_NAME,
  toHTMLStyle,
  MAX_CONTENT_HEIGHT,
  MAX_CONTENT_WIDTH,
  MIN_CONTENT_HEIGHT,
  MIN_CONTENT_WIDTH,
  MAX_SHIFT_HORIZONTAL,
  MAX_SHIFT_UP,
} from "./IFrame.js";
import {
  FloatLocation,
  getWalletPosition,
  WalletPosition,
} from "./position.js";

const IFRAME_SOURCE = "http://localhost";

const MASH_SETTINGS: { id: string; position: Partial<WalletPosition> } = {
  id: "123",
  position: {},
};

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });

// Replaces the global window instance's postMessage implementation in order to fix 2 problems:
// 1. JSDOM does not set event source's or origin's which our post message engine depends on to filter messages: https://github.com/jsdom/jsdom/issues/2745
// 2. We need to fake what window events are being sent from or they will all look like they are coming from the global window
const replacePostMessage = (sourceWindow: Window | null) => {
  window.postMessage = (message: any) => {
    window.dispatchEvent(
      new window.MessageEvent("message", {
        source: sourceWindow,
        origin: IFRAME_SOURCE,
        data: message,
      }),
    );
  };
};

// JSDOM does not implement the matchMedia function on window.
function mockMatchMedia(mobile = false) {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      matches: mobile,
      media: query,
      onchange: null,
      addListener: sinon.fake(), // deprecated
      removeListener: sinon.fake(), // deprecated
      addEventListener: sinon.fake(),
      removeEventListener: sinon.fake(),
      dispatchEvent: sinon.fake(),
    }),
  });
}

describe("IFrame", () => {
  beforeEach(() => {
    const dom = new JSDOM(``);
    global.document = dom.window.document;
    //@ts-expect-error JSDOM Window mismatch
    global.window = dom.window;
  });

  it("mount iframe, should exist in dom", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      sinon.fake(),
      getWalletPosition(
        MASH_SETTINGS.position.desktop,
        MASH_SETTINGS.position.mobile,
      ),
    );

    assert.ok(document.getElementsByName(IFRAME_NAME).item(0));
  });

  it("trigger open event, should resize iframe correctly", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      sinon.fake(),
      getWalletPosition(
        MASH_SETTINGS.position.desktop,
        MASH_SETTINGS.position.mobile,
      ),
    );

    // @ts-expect-error grabbing the private iframe to get window
    replacePostMessage(iframe.iframe.contentWindow);

    // pretend to be the app in the iframe asking the SDK to resize it
    const wallet = new PostMessageEngine<EventMessage>({
      name: Targets.Wallet,
      targetName: Targets.HostSiteFrame,
      targetWindow: window,
      targetOrigin: "*",
    });
    wallet.send({ name: Events.WalletOpened, metadata: {} });
    await sleep(100);

    const element = document.getElementsByName(IFRAME_NAME).item(0);

    assert.equal(
      element.parentElement?.style.height,
      `${MAX_CONTENT_HEIGHT}px`,
    );
    assert.equal(element.parentElement?.style.width, `${MAX_CONTENT_WIDTH}px`);
  });

  // it("trigger close event, should resize iframe correctly", async () => {
  //   const callback = jest.fn();
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(
  //     callback,
  //     getWalletPosition(
  //       MASH_SETTINGS.position.desktop,
  //       MASH_SETTINGS.position.mobile,
  //     ),
  //   );
  //
  //   wallet.send({ name: Events.WalletOpened, metadata: {} });
  //   await sleep(100);
  //
  //   wallet.send({ name: Events.WalletClosed, metadata: {} });
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.height).toBe(`${MIN_CONTENT_HEIGHT}px`);
  //   expect(element.parentElement?.style.width).toBe(`${MIN_CONTENT_WIDTH}px`);
  // });
  //
  // it("trigger 2 notifications, should resize iframe correctly", async () => {
  //   const callback = jest.fn();
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(
  //     callback,
  //     getWalletPosition(
  //       MASH_SETTINGS.position.desktop,
  //       MASH_SETTINGS.position.mobile,
  //     ),
  //   );
  //
  //   wallet.send({ name: Events.NotificationUpdate, metadata: { count: 2 } });
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.height).toBe("280px");
  //   expect(element.parentElement?.style.width).toBe(`${MAX_CONTENT_WIDTH}px`);
  // });
  //
  // it("desktop, position iframe on left, should have valid css settigns", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomLeft,
  //       shiftLeft: 5,
  //       shiftRight: 10,
  //       shiftUp: 15,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.bottom).toEqual("15px");
  //   expect(element.parentElement?.style.left).toEqual("10px");
  //   expect(element.parentElement?.style.right).toEqual("");
  // });
  //
  // it("desktop, position iframe on right, should have valid css settigns", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: 5,
  //       shiftRight: 10,
  //       shiftUp: 2,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.bottom).toEqual("2px");
  //   expect(element.parentElement?.style.left).toEqual("");
  //   expect(element.parentElement?.style.right).toEqual("5px");
  // });
  //
  // it("mobile, position iframe on left, should have valid css settigns", async () => {
  //   mockMatchMedia(true);
  //
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: 5,
  //       shiftRight: 10,
  //       shiftUp: 2,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomLeft },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.bottom).toEqual("0px");
  //   expect(element.parentElement?.style.left).toEqual("0px");
  //   expect(element.parentElement?.style.right).toEqual("");
  // });
  //
  // it("mobile, position iframe on right, should have valid css settigns", async () => {
  //   mockMatchMedia(true);
  //
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: 5,
  //       shiftRight: 10,
  //       shiftUp: 2,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.bottom).toEqual("0px");
  //   expect(element.parentElement?.style.left).toEqual("");
  //   expect(element.parentElement?.style.right).toEqual("0px");
  // });
  //
  // it("bottom-right, horizontal shift is less than 0, should normalize to 0", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: -100,
  //       shiftRight: 5,
  //       shiftUp: 0,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.right).toEqual("0px");
  // });
  //
  // it("bottom-left, horizontal shift is less than 0, should normalize to 0", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomLeft,
  //       shiftLeft: 5,
  //       shiftRight: -100,
  //       shiftUp: 0,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.left).toEqual("0px");
  // });
  //
  // it("bottom-right, horizontal shift is greater than max, should normalize to max", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: MAX_SHIFT_HORIZONTAL + 100,
  //       shiftRight: 10,
  //       shiftUp: 0,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.right).toEqual(
  //     `${MAX_SHIFT_HORIZONTAL}px`,
  //   );
  // });
  //
  // it("bottom-left, horizontal shift is greater than max, should normalize to max", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomLeft,
  //       shiftLeft: 10,
  //       shiftRight: MAX_SHIFT_HORIZONTAL + 100,
  //       shiftUp: 0,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.left).toEqual(
  //     `${MAX_SHIFT_HORIZONTAL}px`,
  //   );
  // });
  //
  // it("vertical shift is less than 0, should normalize to 0", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: 0,
  //       shiftRight: 0,
  //       shiftUp: -100,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.bottom).toEqual("0px");
  // });
  //
  // it("vertical shift is greater than max, should normalize to max", async () => {
  //   const iframe = new IFrame(IFRAME_SOURCE);
  //   iframe.mount(jest.fn(), {
  //     desktop: {
  //       floatLocation: FloatLocation.BottomRight,
  //       shiftLeft: 0,
  //       shiftRight: 0,
  //       shiftUp: MAX_SHIFT_UP + 100,
  //     },
  //     mobile: { floatLocation: FloatLocation.BottomRight },
  //   });
  //
  //   await sleep(100);
  //
  //   const element = getIframe();
  //   expect(element.parentElement?.style.bottom).toEqual(`${MAX_SHIFT_UP}px`);
  // });
});

describe("toHTMLStyle", () => {
  it("single style, correctly formats string", () => {
    const style = { color: "red" };
    const str = toHTMLStyle(style);
    assert.equal(str, "color:red;");
  });

  it("multiple styles, correctly formats string", () => {
    const style = { color: "red", width: "100px", top: 1 };
    const str = toHTMLStyle(style);
    assert.equal(str, "color:red;width:100px;top:1;");
  });
});
