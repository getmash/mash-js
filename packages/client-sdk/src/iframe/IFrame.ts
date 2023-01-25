import PostMessageEngine from "@getmash/post-message";

import {
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonPosition,
  WalletButtonShiftConfiguration,
} from "../api/routes.js";

export enum Targets {
  HostSiteFrame = "@mash/host-site-iframe",
  Wallet = "@mash/wallet",
}

enum Layout {
  Web = "web",
  Mobile = "mobile",
}

/* MediaQuery breakpoint to trigger mobile layout for Wallet */
const FULLSCREEN_THRESHOLD = 480;
/* Max Width for Wallet in Desktop layout */
export const MAX_CONTENT_WIDTH = 428;
/* Max Height for Wallet in Desktop layout */
export const MAX_CONTENT_HEIGHT = 628;
/* Min Width for Wallet when closed */
export const MIN_CONTENT_WIDTH = 100;
/* Min Height for Wallet when closed */
export const MIN_CONTENT_HEIGHT = 100;
/* Max Height of a notifcation */
export const MAX_HEIGHT_NOTIFICATION = 140;
/* Max amount the Wallet can be moved up */
export const MAX_SHIFT_VERTICAL = 200;
/* Max amount the Wallet can be moved horizontally */
export const MAX_SHIFT_HORIZONTAL = 300;
/* Basic vertical shift */
export const BASIC_SHIFT_VERTICAL = 100;
/* Basic horizontal shift */
export const BASIC_SHIFT_HORIZONTAL = 100;
/* Amount used to shift for Ghost */
export const GHOST_SHIFT = 80;
/* Amount used to shift for Intercom */
export const INTERCOM_SHIFT = 60;
/* Amount used to shift for Wix Action Bar */
export const WIX_ACTION_BAR = 74;

const MAX_Z_INDEX = 2147483647;

const WALLET_CONTAINER_STYLE = {
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

const MODAL_CONTAINER_STYLE = {
  border: "none",
  width: "100vw",
  height: "100vh",
  position: "fixed",
  top: "0",
  left: "0",
  "z-index": MAX_Z_INDEX,
  "backdrop-filter": "blur(7.5px)",
  visibility: "hidden",
  display: "flex",
  "flex-direction": "column",
  "align-items": "center",
  "justify-content": "center",
}

const WALLET_IFRAME_STYLE = {
  border: "none",
  width: "100%",
  height: "100%",
  "background-color": "inherit !important",
  "color-scheme": "normal",
};

const MODAL_IFRAME_STYLE = {
  border: "none",
  "border-radius": "20px",
  width: "70%",
  height: "70%",
  "background-color": "inherit !important",
  "color-scheme": "normal",
};

export type EventMessage<T = Record<string, unknown>> = {
  name: string;
  metadata: T;
};

export type OnLoadCallback = (iframe: HTMLIFrameElement) => void;

/**
 * Converts a dict of styles into HTML acceptable style string
 * @param styles Record<string, string|number>
 * @returns string
 */
export function toHTMLStyle(styles: Record<string, string | number>): string {
  return Object.keys(styles).reduce((str, key) => {
    const style = styles[key];
    return (str += `${key}:${style};`);
  }, "");
}

export enum Events {
  ModalOpen = "modal:open",
  ModalClose = "modal:close",
  WalletOpened = "wallet:open",
  WalletClosed = "wallet:close",
  WalletLoaded = "wallet:loaded",
  LayoutChanged = "layout:changed",
  NotificationUpdate = "notifications:update",
}

export const IFRAME_NAME = "mash_wallet";
export const MODAL_IFRAME_NAME = "mash_modal";

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

  private desktopFloatSide = WalletButtonFloatSide.Right;
  private desktopFloatPlacement = WalletButtonFloatPlacement.Default;
  private desktopShiftConfiguration: WalletButtonShiftConfiguration = {
    horizontal: 0,
    vertical: 0,
  };
  private mobileFloatSide = WalletButtonFloatSide.Right;
  private mobileFloatPlacement = WalletButtonFloatPlacement.Default;
  private mobileShiftConfiguration: WalletButtonShiftConfiguration = {
    horizontal: 0,
    vertical: 0,
  };

  private walletContainer: HTMLDivElement;
  private walletIframe: HTMLIFrameElement;
  private modalContainer: HTMLDivElement;
  private modalIframe: HTMLIFrameElement;
  private engine: PostMessageEngine<EventMessage> | null = null;

  constructor(src: string) {
    this.src = new URL(src);

    // Create wallet dom elements
    this.walletContainer = document.createElement("div");
    this.walletContainer.setAttribute("class", "mash mash-root");
    this.walletContainer.setAttribute("style", toHTMLStyle(WALLET_CONTAINER_STYLE));

    this.walletIframe = document.createElement("iframe");
    this.walletIframe.setAttribute("class", "mash-this.iframe");
    this.walletIframe.setAttribute("style", toHTMLStyle(WALLET_IFRAME_STYLE));
    this.walletIframe.setAttribute("src", src);
    this.walletIframe.setAttribute("title", "Mash Wallet");
    this.walletIframe.setAttribute("name", IFRAME_NAME);
    this.walletIframe.allowFullscreen = true;

    // Create modal dom elements
    this.modalContainer = document.createElement("div");
    this.modalContainer.setAttribute("style", toHTMLStyle(MODAL_CONTAINER_STYLE));

    this.modalIframe = document.createElement("iframe");
    this.modalIframe.setAttribute("title", "Mash Pre-Boarding");
    this.modalIframe.setAttribute("style", toHTMLStyle(MODAL_IFRAME_STYLE));
    this.modalIframe.setAttribute("name", MODAL_IFRAME_NAME);
    this.modalIframe.setAttribute("src", "https://wallet.getmash.com/earn");
    this.modalIframe.allowFullscreen = true;
  }

  /**
   * Set height and width of the div container holding the iframe
   * @param height number
   * @param width number
   * @param unit string
   */
  private setContainerSize = (
    height: number,
    width: number,
    unit: "%" | "px",
    margin: boolean,
  ) => {
    this.walletContainer.style.height = `${height}${unit}`;
    this.walletContainer.style.width = `${width}${unit}`;

    if (margin) {
      this.walletContainer.style.marginRight = "20px";
      this.walletContainer.style.marginLeft = "20px";
      this.walletContainer.style.marginBottom = "20px";
    } else {
      this.walletContainer.style.marginRight = "0";
      this.walletContainer.style.marginLeft = "0";
      this.walletContainer.style.marginBottom = "0";
    }
  };

  /**
   * Show full screen modal
   */
  private showModal = () => {
    this.modalContainer.style.visibility = "visible";
  }

  /**
   * Close full screen modal
   */
  private hideModal = () => {
    this.modalContainer.style.visibility = "hidden";
  }

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
      this.walletContainer.style.bottom = "0";

      switch (this.mobileFloatSide) {
        case WalletButtonFloatSide.Left: {
          this.walletContainer.style.right = "";
          this.walletContainer.style.left = "0";
          break;
        }
        case WalletButtonFloatSide.Right: {
          this.walletContainer.style.right = "0";
          this.walletContainer.style.left = "";
          break;
        }
      }
      switch (this.mobileFloatPlacement) {
        case WalletButtonFloatPlacement.WixActionBar: {
          this.walletContainer.style.bottom = `${WIX_ACTION_BAR}px`;
          break;
        }
        case WalletButtonFloatPlacement.BasicShiftVertical: {
          this.walletContainer.style.bottom = `${BASIC_SHIFT_VERTICAL}px`;
          break;
        }
        case WalletButtonFloatPlacement.Custom: {
          this.walletContainer.style.bottom = `${this.mobileShiftConfiguration.vertical}px`;
          break;
        }
      }
      return;
    }

    // Desktop
    switch (this.desktopFloatSide) {
      case WalletButtonFloatSide.Left: {
        this.walletContainer.style.left = "0";
        this.walletContainer.style.right = "";
        break;
      }
      case WalletButtonFloatSide.Right: {
        this.walletContainer.style.right = "0";
        this.walletContainer.style.left = "";
        break;
      }
    }
    switch (this.desktopFloatPlacement) {
      case WalletButtonFloatPlacement.Ghost: {
        switch (this.desktopFloatSide) {
          case WalletButtonFloatSide.Left: {
            this.walletContainer.style.left = "0";
            this.walletContainer.style.right = "";
            break;
          }
          case WalletButtonFloatSide.Right: {
            this.walletContainer.style.right = "0";
            this.walletContainer.style.left = "";
            break;
          }
        }
        this.walletContainer.style.bottom = `${GHOST_SHIFT}px`;
        break;
      }
      case WalletButtonFloatPlacement.Intercom: {
        switch (this.desktopFloatSide) {
          case WalletButtonFloatSide.Left: {
            this.walletContainer.style.left = "0";
            this.walletContainer.style.right = "";
            break;
          }
          case WalletButtonFloatSide.Right: {
            this.walletContainer.style.right = "0";
            this.walletContainer.style.left = "";
            break;
          }
        }
        this.walletContainer.style.bottom = `${INTERCOM_SHIFT}px`;
        break;
      }
      case WalletButtonFloatPlacement.BasicShiftHorizontal: {
        switch (this.desktopFloatSide) {
          case WalletButtonFloatSide.Left: {
            this.walletContainer.style.left = `${BASIC_SHIFT_HORIZONTAL}px`;
            this.walletContainer.style.right = "";
            break;
          }
          case WalletButtonFloatSide.Right: {
            this.walletContainer.style.right = `${BASIC_SHIFT_HORIZONTAL}px`;
            this.walletContainer.style.left = "";
            break;
          }
        }
        break;
      }
      case WalletButtonFloatPlacement.BasicShiftVertical: {
        this.walletContainer.style.bottom = `${BASIC_SHIFT_VERTICAL}px`;
        break;
      }
      case WalletButtonFloatPlacement.Custom: {
        switch (this.desktopFloatSide) {
          case WalletButtonFloatSide.Left: {
            this.walletContainer.style.left = `${this.desktopShiftConfiguration.horizontal}px`;
            this.walletContainer.style.right = "";
            break;
          }
          case WalletButtonFloatSide.Right: {
            this.walletContainer.style.right = `${this.desktopShiftConfiguration.horizontal}px`;
            this.walletContainer.style.left = "";
            break;
          }
        }
        this.walletContainer.style.bottom = `${this.desktopShiftConfiguration.vertical}px`;
        break;
      }
    }
  };

  /**
   * Retrieve mediaQueryList for the given mediaQuery that changes the layout
   * of the iframe container
   * @returns void
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

    // Clicking on the modal backdrop closes the modal
    this.modalContainer.onclick = this.hideModal;
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
        case Events.ModalOpen: {
          this.open = false;
          this.showModal();
          break;
        }
        case Events.ModalClose: {
          this.open = false;
          this.hideModal();
          break;
        }
        case Events.WalletOpened: {
          this.open = true;
          this.resize();
          break;
        }
        case Events.WalletClosed: {
          this.open = false;
          this.resize();
          break;
        }
        case Events.NotificationUpdate: {
          this.notificationCount =
            (data.metadata.count as number | undefined) || 0;
          this.resize();
          break;
        }
        case Events.WalletLoaded: {
          const mq = this.getMediaQuery();

          this.engine?.send({
            name: Events.LayoutChanged,
            metadata: { mode: mq.matches ? Layout.Mobile : Layout.Web },
          });

          onLoadCallback(this.walletIframe);
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
      this.walletContainer.appendChild(this.walletIframe);
      document.body.appendChild(this.walletContainer);

      this.modalContainer.appendChild(this.modalIframe);
      document.body.appendChild(this.modalContainer);

      this.mounted = true;
    }

    // Wallet settings
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
      targetWindow: this.walletIframe.contentWindow,
      targetOrigin: this.src.origin,
    });

    this.setupListeners();
    this.setupPostMessageEngine(onLoad);
    this.resize();
    this.position();
  }
}
