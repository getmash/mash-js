import PostMessageEngine from "@getmash/post-message";

const MAX_Z_INDEX = 2147483647;

const CONTAINER_STYLE = {
  border: "none",
  width: "100%",
  height: "100vh",
  position: "fixed",
  top: "0",
  left: "0",
  "z-index": MAX_Z_INDEX,
  visibility: "hidden",
};

const IFRAME_STYLE = {
  border: "none",
  width: "100%",
  height: "100%",
  "background-color": "inherit !important",
  "color-scheme": "normal",
};

export enum Targets {
  HostSiteFrame = "@mash/host-site-iframe",
  Modal = "@mash/modal",
}

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

export const MODAL_IFRAME_NAME = "mash_modal";

/**
 * A full screen modal iframe
 */
export class ModalIFrame {
  readonly src: URL;

  private _mounted = false;
  get mounted() {
    return this._mounted;
  }
  private set mounted(val: boolean) {
    this._mounted = val;
  }

  private container: HTMLDivElement;
  private iframe: HTMLIFrameElement;

  private engine: PostMessageEngine<EventMessage> | null = null;

  constructor(src: string) {
    this.src = new URL(src);

    this.container = document.createElement("div");
    this.container.setAttribute("style", toHTMLStyle(CONTAINER_STYLE));

    this.iframe = document.createElement("iframe");
    this.iframe.setAttribute("title", "Mash Pre-Boarding");
    this.iframe.setAttribute("style", toHTMLStyle(IFRAME_STYLE));
    this.iframe.setAttribute("name", MODAL_IFRAME_NAME);
    this.iframe.setAttribute("src", src);
    this.iframe.allowFullscreen = true;
  }

  /**
   * Show full screen modal
   */
  private showModal = () => {
    this.container.style.visibility = "visible";
  };

  /**
   * Close full screen modal
   */
  private hideModal = () => {
    this.container.style.visibility = "hidden";
  };

  /**
   * Setup post message tunnel between the host site and the Mash Wallet
   */
  private setupPostMessageEngine = () => {
    this.engine?.listen(evt => {
      const { data } = evt;

      // If event comes in without any data, ignore it. Malformed event or
      // something we don't care about
      if (!data) return;

      switch (data.name) {
        case Events.ModalOpen: {
          this.showModal();
          break;
        }
        case Events.ModalClose: {
          this.hideModal();
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
  mount() {
    if (!this.mounted) {
      this.container.appendChild(this.iframe);
      document.body.appendChild(this.container);

      this.mounted = true;
    }

    this.engine = new PostMessageEngine({
      name: Targets.HostSiteFrame,
      targetName: Targets.Modal,
      targetWindow: this.iframe.contentWindow,
      targetOrigin: this.src.origin,
      targetWindowFilter: false,
    });

    this.setupPostMessageEngine();
  }
}