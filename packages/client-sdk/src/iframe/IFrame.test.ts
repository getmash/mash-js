import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { waitFor } from "@testing-library/dom";

import PostMessageEngine from "@getmash/post-message";

import {
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonPosition,
} from "../api/routes.js";
import { createDOM } from "../tests/dom.js";
import IFrame, {
  HEIGHT_PADDING,
  IFRAME_NAME,
  MAX_CONTENT_HEIGHT,
  MAX_CONTENT_WIDTH,
  MIN_CONTENT_HEIGHT,
  MIN_CONTENT_WIDTH,
} from "./IFrame.js";
import { EventMessage, Events, Targets, toHTMLStyle } from "./blocks.js";
import {
  BASIC_SHIFT_HORIZONTAL,
  BASIC_SHIFT_VERTICAL,
  getWalletPosition,
  GHOST_SHIFT,
  INTERCOM_SHIFT,
  MAX_SHIFT_HORIZONTAL,
  MAX_SHIFT_VERTICAL,
} from "./position.js";

const IFRAME_SOURCE = "http://localhost/widget";

const MASH_SETTINGS: { id: string; position: Partial<WalletButtonPosition> } = {
  id: "123",
  position: {},
};

// Replaces the global window instance's postMessage implementation in order to fix 2 problems:
// 1. JSDOM does not set event source's or origin's which our post message engine depends on to filter messages: https://github.com/jsdom/jsdom/issues/2745
// 2. We need to fake what window events are being sent from or they will all look like they are coming from the global window
const replacePostMessage = (sourceWindow: Window | null) => {
  /* eslint-disable-next-line */
  window.postMessage = (message: any) => {
    window.dispatchEvent(
      new window.MessageEvent("message", {
        source: sourceWindow,
        origin: new URL(IFRAME_SOURCE).origin,
        data: message,
      }),
    );
  };
};

// JSDOM does not implement the matchMedia function on window.
// Mock based on Jest-documented workaround:
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
function mockMatchMedia(mobile = false) {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      matches: mobile,
      media: query,
      onchange: null,
      addListener: () => ({}), // deprecated
      removeListener: () => ({}), // deprecated
      addEventListener: () => ({}),
      removeEventListener: () => ({}),
      dispatchEvent: () => ({}),
    }),
  });
}

// pull the SDK iframe off of the global window for inspection.
const getIframe = () => document.getElementsByName(IFRAME_NAME).item(0);

describe("IFrame Events", () => {
  beforeEach(() => {
    createDOM();
  });

  it("mount iframe, should exist in dom", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      () => ({}),
      getWalletPosition(
        MASH_SETTINGS.position.desktop,
        MASH_SETTINGS.position.mobile,
      ),
    );

    assert.ok(getIframe());
  });

  it("trigger open event, should resize iframe correctly", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      () => ({}),
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

    await waitFor(() => {
      assert.equal(
        getIframe().parentElement?.style.height,
        `${MAX_CONTENT_HEIGHT}px`,
      );
    });

    await waitFor(() => {
      assert.equal(
        getIframe().parentElement?.style.width,
        `${MAX_CONTENT_WIDTH}px`,
      );
    });
  });

  it("trigger open event on mobile, should reset to full viewport", async () => {
    mockMatchMedia(true);

    // mount with a custom mobile shift
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 100,
        },
      },
    });

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

    // make sure 0'd out on open
    await waitFor(() => {
      assert.equal(getIframe().parentElement?.style.bottom, "0px");
    });
  });

  it("trigger close event, should resize iframe correctly", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      () => ({}),
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
    wallet.send({ name: Events.WalletClosed, metadata: {} });
    await waitFor(() => {
      assert.equal(
        getIframe().parentElement?.style.height,
        `${MIN_CONTENT_HEIGHT}px`,
      );
    });
    await waitFor(() => {
      assert.equal(
        getIframe().parentElement?.style.width,
        `${MIN_CONTENT_WIDTH}px`,
      );
    });
  });

  it("trigger 2 notifications, should resize iframe correctly", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      () => ({}),
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

    wallet.send({ name: Events.NotificationUpdate, metadata: { count: 2 } });
    await waitFor(() => {
      assert.equal(getIframe().parentElement?.style.height, "432px");
    });
    await waitFor(() => {
      assert.equal(
        getIframe().parentElement?.style.width,
        `${MAX_CONTENT_WIDTH}px`,
      );
    });
  });
});

describe("IFrame Desktop", () => {
  beforeEach(() => {
    createDOM();
  });

  it("desktop, position iframe on left, should have valid css settigns", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: 10,
          vertical: 15,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, "15px");
    assert.equal(getIframe().parentElement?.style.left, "10px");
    assert.equal(getIframe().parentElement?.style.right, "");
  });

  it("desktop, position iframe on right, should have valid css settigns", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: 5,
          vertical: 2,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, "2px");
    assert.equal(getIframe().parentElement?.style.left, "");
    assert.equal(getIframe().parentElement?.style.right, "5px");
  });

  it("bottom-right, horizontal shift is less than 0, should normalize to 0", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.right, "0px");
  });

  it("bottom-left, horizontal shift is less than 0, should normalize to 0", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: -100,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.left, "0px");
  });

  it("bottom-right, horizontal shift is greater than max, should normalize to max", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: MAX_SHIFT_HORIZONTAL + 100,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.right,
      `${MAX_SHIFT_HORIZONTAL}px`,
    );
  });

  it("bottom-left, horizontal shift is greater than max, should normalize to max", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: MAX_SHIFT_HORIZONTAL + 100,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.left,
      `${MAX_SHIFT_HORIZONTAL}px`,
    );
  });

  it("vertical shift is less than 0, should normalize to 0", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, "0px");
  });

  it("vertical shift is greater than max, should normalize to max", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: MAX_SHIFT_VERTICAL + 100,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.bottom,
      `${MAX_SHIFT_VERTICAL}px`,
    );
  });

  it("basic horizontal shift to the left", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.BasicShiftHorizontal,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.right,
      `${BASIC_SHIFT_HORIZONTAL}px`,
    );
  });

  it("basic horizontal shift to the right", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.BasicShiftHorizontal,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.left,
      `${BASIC_SHIFT_HORIZONTAL}px`,
    );
  });

  it("basic vertical shift up", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.BasicShiftVertical,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.bottom,
      `${BASIC_SHIFT_VERTICAL}px`,
    );
  });

  it("using Ghost shift, right side", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Ghost,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, `${GHOST_SHIFT}px`);
    assert.equal(getIframe().parentElement?.style.right, "0px");
  });

  it("using Intercom shift, right side", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Intercom,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.bottom,
      `${INTERCOM_SHIFT}px`,
    );
    assert.equal(getIframe().parentElement?.style.right, "0px");
  });
  it("using Ghost shift, left side", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.Ghost,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, `${GHOST_SHIFT}px`);
    assert.equal(getIframe().parentElement?.style.left, "0px");
  });

  it("using Intercom shift, left side", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.Intercom,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(
      getIframe().parentElement?.style.bottom,
      `${INTERCOM_SHIFT}px`,
    );
    assert.equal(getIframe().parentElement?.style.left, "0px");
  });

  it("using custom shift", async () => {
    mockMatchMedia();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Custom,
        customShiftConfiguration: {
          horizontal: 200,
          vertical: 100,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, "100px");
    assert.equal(getIframe().parentElement?.style.right, "200px");
  });
});

describe("IFrame Mobile", () => {
  beforeEach(() => {
    createDOM();
  });

  it("mobile, position iframe on left, should have valid css settigns", async () => {
    mockMatchMedia(true);

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Left,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, "0px");
    assert.equal(getIframe().parentElement?.style.left, "0px");
    assert.equal(getIframe().parentElement?.style.right, "");
  });

  it("mobile, position iframe on right, should have valid css settigns", async () => {
    mockMatchMedia(true);

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(() => ({}), {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: {
          horizontal: 0,
          vertical: 0,
        },
      },
    });

    assert.equal(getIframe().parentElement?.style.bottom, "0px");
    assert.equal(getIframe().parentElement?.style.left, "");
    assert.equal(getIframe().parentElement?.style.right, "0px");
  });

  it("should reduce height if too small to fit in desktop iframe", async () => {
    // Mock media query and set the screen height so it's smaller than the Wallet when open
    mockMatchMedia(false);
    window.innerHeight = 600;

    // mount wallet with default position
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(
      () => ({}),
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

    // Wait for Wallet to open and check if it's height is responsive to the screen height
    await waitFor(() => {
      assert.equal(
        getIframe().parentElement?.style.height,
        `${window.innerHeight - HEIGHT_PADDING}px`,
      );
    });
  });
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
