import PostMessageEngine from "@getmash/post-message";

import {
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonPosition,
  WalletButtonShiftConfiguration,
} from "../api/routes.js";
import {
  EventMessage,
  Events,
  MAX_Z_INDEX,
  OnLoadCallback,
  Targets,
  toHTMLStyle,
} from "./blocks.js";
import { WalletButtonLocation } from "./position.js";

enum Layout {
  Web = "web",
  Mobile = "mobile",
}

/* MediaQuery breakpoint to trigger mobile layout for Wallet */
const FULLSCREEN_THRESHOLD = 480;
/* Max Width for Wallet in Desktop layout */
export const MAX_CONTENT_WIDTH = 428;
/* Max Height for Wallet in Desktop layout */
export const MAX_CONTENT_HEIGHT = 714;
/* Min Width for Wallet when closed */
export const MIN_CONTENT_WIDTH = 100;
/* Min Height for Wallet when closed */
export const MIN_CONTENT_HEIGHT = 100;
/* Max Height of a notifcation */
export const MAX_HEIGHT_NOTIFICATION = 216;

/**
 * Default iframe style.
 */
const CONTAINER_STYLE = {
  position: "fixed",
  bottom: "0",
  right: "0",
  "margin-right": "20px",
  "margin-bottom": "20px",
  height: `${MIN_CONTENT_HEIGHT}px`,
  width: `${MIN_CONTENT_WIDTH}px`,
  "z-index": MAX_Z_INDEX - 1,

  // Defensive CSS to prevent leaking from host site
  animation: "none !important",
  "background-color": "transparent !important",
  transition: "none !important",
};

const IFRAME_STYLE = {
  border: "none",
  width: "100%",
  height: "100%",
  "background-color": "inherit !important",
  "color-scheme": "normal",
};

export const IFRAME_NAME = "mash_wallet";

export default class IFrame {
  readonly src: URL;

  private _mounted = false;
  get mounted() {
    return this._mounted;
  }
  private set mounted(val: boolean) {
    this._mounted = val;
  }

  private open = false;
  private notificationCount = 0;

  private container: HTMLDivElement;
  private iframe: HTMLIFrameElement;

  // engine and location are set on mount
  private engine: PostMessageEngine<EventMessage> | null = null;
  private location: WalletButtonLocation | null = null;

  constructor(src: string) {
    this.src = new URL(src);

    // Create wallet dom elements
    this.container = document.createElement("div");
    this.container.setAttribute("class", "mash mash-root");
    this.container.setAttribute("style", toHTMLStyle(CONTAINER_STYLE));

    this.iframe = document.createElement("iframe");
    this.iframe.setAttribute("class", "mash-this.iframe");
    this.iframe.setAttribute("style", toHTMLStyle(IFRAME_STYLE));
    this.iframe.setAttribute("src", src);
    this.iframe.setAttribute("title", "Mash Wallet");
    this.iframe.setAttribute("name", IFRAME_NAME);
    this.iframe.allowFullscreen = true;
  }

  /**
   * Set height and width of the div container holding the iframe.
   */
  private setContainerSize = (
    height: number,
    width: number,
    unit: "%" | "px",
    margin: boolean,
  ) => {
    this.container.style.height = `${height}${unit}`;
    this.container.style.width = `${width}${unit}`;

    if (margin) {
      this.container.style.marginRight = "20px";
      this.container.style.marginLeft = "20px";
      this.container.style.marginBottom = "20px";
    } else {
      this.container.style.marginRight = "0";
      this.container.style.marginLeft = "0";
      this.container.style.marginBottom = "0";
    }
  };

  /**
   * Resize the iframe container based on open state, notification count and
   * dimensions of the page
   */
  private resize = () => {
    const mediaQuery = this.getMediaQuery();

    if (this.open) {
      if (mediaQuery.matches) {
        this.setContainerSize(100, 100, "%", false);
        return;
      }
      this.setContainerSize(MAX_CONTENT_HEIGHT, MAX_CONTENT_WIDTH, "px", true);
      return;
    }

    // Get min acceptable width, if the screen is smaller then the MAX, then
    // use that as the width
    const maxWidth = Math.min(MAX_CONTENT_WIDTH, window.innerWidth);

    // Calculate MAX height that can be used based on notifications
    const maxHeight = this.notificationCount * MAX_HEIGHT_NOTIFICATION;

    // Calculate height, by takin the MAX between the maxHeight calculated above
    // and the MIN content height of the container. If any notifications exists,
    // the height will be influenced by them
    const height = Math.max(maxHeight, MIN_CONTENT_HEIGHT);

    // Calculate width based on if any notifications exists. If notifications exist
    // we must make the width larger to accomodate notifications
    const width = this.notificationCount === 0 ? MIN_CONTENT_WIDTH : maxWidth;

    this.setContainerSize(
      height,
      width,
      "px",
      mediaQuery.matches ? false : true,
    );
  };

  /**
   * Position the IFrame container according to user settings
   * and screen size
   */
  private position = () => {
    const mediaQuery = this.getMediaQuery();

    // Mobile
    if (mediaQuery.matches) {
      // if open, return to default position
      if (this.open) {
        this.container.style.bottom = "0";
      } else {
        this.container.style.bottom = toPixel(this.location?.mobile.bottom);
        this.container.style.left = toPixel(this.location?.mobile.left);
        this.container.style.right = toPixel(this.location?.mobile.right);
      }

      return;
    }

    // Desktop
    this.container.style.bottom = toPixel(this.location?.desktop.bottom);
    this.container.style.left = toPixel(this.location?.desktop.left);
    this.container.style.right = toPixel(this.location?.desktop.right);
  };

  /**
   * Retrieve mediaQueryList for the given mediaQuery that changes the layout
   * of the iframe container.
   */
  private getMediaQuery() {
    return window.matchMedia(`(max-width: ${FULLSCREEN_THRESHOLD}px)`);
  }

  /**
   * MediaQuery listener that triggers whenever a change is detected. Notify the
   * Wallet of changes and resize the iframe container as required
   * @param mq MediaQueryListEvent
   */
  private onMediaQueryChanged = (mq: MediaQueryListEvent) => {
    this.resize();
    this.position();
    this.engine?.send({
      name: Events.LayoutChanged,
      metadata: { mode: mq.matches ? Layout.Mobile : Layout.Web },
    });
  };

  /**
   * Setup all listeners required for the iframe
   */
  private setupListeners() {
    this.getMediaQuery().addEventListener("change", this.onMediaQueryChanged);
  }

  /**
   * Normalize shift to ensure valid value
   * @param value number
   * @param max number
   * @returns number
   */
  private normalizeShift(value: number, max: number) {
    if (value < 0) {
      return 0;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  /**
   * Setup post message tunnel between the host site and the Mash Wallet
   * @param onLoadCallback OnLoadCallback
   */
  private setupPostMessageEngine = (onLoadCallback: OnLoadCallback) => {
    this.engine?.listen(evt => {
      const { data } = evt;

      // If event comes in without any data, ignore it. Malformed event or
      // something we don't care about
      if (!data) return;

      switch (data.name) {
        case Events.WalletOpened: {
          this.open = true;
          this.resize();
          this.position();
          break;
        }
        case Events.WalletClosed: {
          this.open = false;
          this.resize();
          this.position();
          break;
        }
        case Events.NotificationUpdate: {
          this.notificationCount =
            (data.metadata.count as number | undefined) || 0;
          this.resize();
          this.position();
          break;
        }
        case Events.WalletLoaded: {
          const mq = this.getMediaQuery();

          this.engine?.send({
            name: Events.LayoutChanged,
            metadata: { mode: mq.matches ? Layout.Mobile : Layout.Web },
          });

          onLoadCallback(this.iframe);
          break;
        }
      }
    });
  };

  /**
   * Mount the iframes and load the Mash Wallet. Accepts a callback that triggered
   * when the Wallet has loaded
   * @param onLoad OnLoadCallback
   */
  mount(onLoad: OnLoadCallback, position: WalletButtonPosition) {
    if (!this.mounted) {
      this.container.appendChild(this.iframe);
      document.body.appendChild(this.container);
      this.mounted = true;
    }

    this.desktopFloatSide = position.desktop.floatSide;
    this.desktopFloatPlacement = position.desktop.floatPlacement;
    this.desktopShiftConfiguration.horizontal = this.normalizeShift(
      position.desktop.customShiftConfiguration.horizontal,
      MAX_SHIFT_HORIZONTAL,
    );
    this.desktopShiftConfiguration.vertical = this.normalizeShift(
      position.desktop.customShiftConfiguration.vertical,
      MAX_SHIFT_VERTICAL,
    );
    this.mobileFloatSide = position.mobile.floatSide;
    this.mobileFloatPlacement = position.mobile.floatPlacement;
    this.mobileShiftConfiguration.vertical = this.normalizeShift(
      position.mobile.customShiftConfiguration?.vertical || 0,
      MAX_SHIFT_VERTICAL,
    );

    // Must init engine here to have the correct contentWindow.
    // If referencing this.iframe before it is mounted to the
    // dom, it will have an incorrect reference to global scope
    this.engine = new PostMessageEngine({
      name: Targets.HostSiteFrame,
      targetName: Targets.Wallet,
      targetWindow: this.iframe.contentWindow,
      targetOrigin: this.src.origin,
    });

    this.setupListeners();
    this.setupPostMessageEngine(onLoad);
    this.resize();
    this.position();
  }
}
function toPixel(bottom: number | undefined): string {
  throw new Error("Function not implemented.");
}
