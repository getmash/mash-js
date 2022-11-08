import { jest } from "@jest/globals";

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
import { FloatLocation, MashSettings, merge } from "./settings.js";

const IFRAME_SOURCE = "http://localhost";

const MASH_SETTINGS: MashSettings = {
  id: "123",
  position: {
    desktop: {},
    mobile: {},
  },
};

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });

function mockMatchMedia(mobile = false) {
  // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    // @ts-ignore ignore type of wrapped to allow mock to function
    value: jest.fn().mockImplementation((query: string) => ({
      matches: mobile,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock Listener to ignore _shouldIgnoreMessage check, check will never be valid since
// we are manipulating the iframe here and not actually making calls from within the iframe
type Listener = (ev: PostMessageEvent<unknown>) => void;
jest
  .spyOn(PostMessageEngine.prototype, "_listen")
  .mockImplementation((listener: Listener) => {
    const wrapped = (evt: MessageEvent) => {
      /* eslint-disable-next-line */
      listener(evt.data);
    };

    // @ts-ignore ignore type of wrapped to allow mock to function
    window.addEventListener("message", wrapped, false);
    // @ts-ignore ignore type of wrapped to allow mock to function
    return () => window.removeEventListener("message", wrapped);
  });

const wallet = new PostMessageEngine<EventMessage>({
  name: Targets.Wallet,
  targetName: Targets.HostSiteFrame,
  targetWindow: window,
  targetOrigin: "*",
});

const getIframe = () => document.getElementsByName(IFRAME_NAME).item(0);

describe("IFrame", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    const element = getIframe();
    element.parentElement?.parentElement?.removeChild(element.parentElement);
  });

  it("mount iframe, should exist in dom", async () => {
    const callback = jest.fn();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(callback, merge(MASH_SETTINGS).position);

    wallet.send({ name: Events.WalletLoaded, metadata: {} });

    // PostMessage uses a setTimeout(0) in JSDOM,
    // need to sleep here to ensure it runs
    await sleep(100);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(getIframe()).toBeDefined();
  });

  it("trigger open event, should resize iframe correctly", async () => {
    const callback = jest.fn();
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(callback, merge(MASH_SETTINGS).position);

    wallet.send({ name: Events.WalletOpened, metadata: {} });
    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.height).toBe(`${MAX_CONTENT_HEIGHT}px`);
    expect(element.parentElement?.style.width).toBe(`${MAX_CONTENT_WIDTH}px`);
  });

  it("trigger close event, should resize iframe correctly", async () => {
    const callback = jest.fn();
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(callback, merge(MASH_SETTINGS).position);

    wallet.send({ name: Events.WalletOpened, metadata: {} });
    await sleep(100);

    wallet.send({ name: Events.WalletClosed, metadata: {} });
    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.height).toBe(`${MIN_CONTENT_HEIGHT}px`);
    expect(element.parentElement?.style.width).toBe(`${MIN_CONTENT_WIDTH}px`);
  });

  it("trigger 2 notifications, should resize iframe correctly", async () => {
    const callback = jest.fn();
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(callback, merge(MASH_SETTINGS).position);

    wallet.send({ name: Events.NotificationUpdate, metadata: { count: 2 } });
    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.height).toBe("280px");
    expect(element.parentElement?.style.width).toBe(`${MAX_CONTENT_WIDTH}px`);
  });

  it("desktop, position iframe on left, should have valid css settigns", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomLeft,
        shiftLeft: 5,
        shiftRight: 10,
        shiftUp: 15,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.bottom).toEqual("15px");
    expect(element.parentElement?.style.left).toEqual("10px");
    expect(element.parentElement?.style.right).toEqual("");
  });

  it("desktop, position iframe on right, should have valid css settigns", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: 5,
        shiftRight: 10,
        shiftUp: 2,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.bottom).toEqual("2px");
    expect(element.parentElement?.style.left).toEqual("");
    expect(element.parentElement?.style.right).toEqual("5px");
  });

  it("mobile, position iframe on left, should have valid css settigns", async () => {
    mockMatchMedia(true);

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: 5,
        shiftRight: 10,
        shiftUp: 2,
      },
      mobile: { floatLocation: FloatLocation.BottomLeft },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.bottom).toEqual("0px");
    expect(element.parentElement?.style.left).toEqual("0px");
    expect(element.parentElement?.style.right).toEqual("");
  });

  it("mobile, position iframe on right, should have valid css settigns", async () => {
    mockMatchMedia(true);

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: 5,
        shiftRight: 10,
        shiftUp: 2,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.bottom).toEqual("0px");
    expect(element.parentElement?.style.left).toEqual("");
    expect(element.parentElement?.style.right).toEqual("0px");
  });

  it("bottom-right, horizontal shift is less than 0, should normalize to 0", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: -100,
        shiftRight: 5,
        shiftUp: 0,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.right).toEqual("0px");
  });

  it("bottom-left, horizontal shift is less than 0, should normalize to 0", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomLeft,
        shiftLeft: 5,
        shiftRight: -100,
        shiftUp: 0,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.left).toEqual("0px");
  });

  it("bottom-right, horizontal shift is greater than max, should normalize to max", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: MAX_SHIFT_HORIZONTAL + 100,
        shiftRight: 10,
        shiftUp: 0,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.right).toEqual(
      `${MAX_SHIFT_HORIZONTAL}px`,
    );
  });

  it("bottom-left, horizontal shift is greater than max, should normalize to max", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomLeft,
        shiftLeft: 10,
        shiftRight: MAX_SHIFT_HORIZONTAL + 100,
        shiftUp: 0,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.left).toEqual(
      `${MAX_SHIFT_HORIZONTAL}px`,
    );
  });

  it("vertical shift is less than 0, should normalize to 0", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: 0,
        shiftRight: 0,
        shiftUp: -100,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.bottom).toEqual("0px");
  });

  it("vertical shift is greater than max, should normalize to max", async () => {
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(jest.fn(), {
      desktop: {
        floatLocation: FloatLocation.BottomRight,
        shiftLeft: 0,
        shiftRight: 0,
        shiftUp: MAX_SHIFT_UP + 100,
      },
      mobile: { floatLocation: FloatLocation.BottomRight },
    });

    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.bottom).toEqual(`${MAX_SHIFT_UP}px`);
  });
});

describe("toHTMLStyle", () => {
  it("single style, correctly formats string", () => {
    const style = { color: "red" };
    const str = toHTMLStyle(style);
    expect(str).toBe("color:red;");
  });

  it("multiple styles, correctly formats string", () => {
    const style = { color: "red", width: "100px", top: 1 };
    const str = toHTMLStyle(style);
    expect(str).toBe("color:red;width:100px;top:1;");
  });
});
