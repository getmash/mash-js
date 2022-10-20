import PostMessageEngine, { PostMessageEvent } from "@mash/post-message";

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
} from "./IFrame";
import MashSettings from "./types";

const IFRAME_SOURCE = "http://localhost";

const MASH_SETTINGS: MashSettings = {
  id: "123",
  position: {
    shiftUp: 0,
    shiftLeft: 300,
  },
};

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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

describe("mash_iframe", () => {
  it("mount iframe, should exist in dom", async () => {
    const callback = jest.fn();

    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(callback, MASH_SETTINGS.position);

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
    iframe.mount(callback, MASH_SETTINGS.position);

    wallet.send({ name: Events.WalletOpened, metadata: {} });
    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.height).toBe(`${MAX_CONTENT_HEIGHT}px`);
    expect(element.parentElement?.style.width).toBe(`${MAX_CONTENT_WIDTH}px`);
  });

  it("trigger close event, should resize iframe correctly", async () => {
    const callback = jest.fn();
    const iframe = new IFrame(IFRAME_SOURCE);
    iframe.mount(callback, MASH_SETTINGS.position);

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
    iframe.mount(callback, MASH_SETTINGS.position);

    wallet.send({ name: Events.NotificationUpdate, metadata: { count: 2 } });
    await sleep(100);

    const element = getIframe();
    expect(element.parentElement?.style.height).toBe("280px");
    expect(element.parentElement?.style.width).toBe(`${MAX_CONTENT_WIDTH}px`);
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
