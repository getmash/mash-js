import PostMessageEngine from "@getmash/post-message";

import { EventMessage, Events, Targets, toHTMLStyle } from "./blocks.js";
import zIndex from "./zIndex.js";

const CONTAINER_STYLE = {
  border: "none",
  width: "100%",
  height: "100dvh",
  position: "fixed",
  top: "0",
  left: "0",
  "z-index": zIndex.preboarding,
  visibility: "hidden",
};

const IFRAME_STYLE = {
  border: "none",
  width: "100%",
  height: "100%",
  "background-color": "inherit !important",
  "color-scheme": "normal",
};

const IFRAME_NAME = "mash_preboarding";

/**
 * A full screen iframe used to preboard users
 */
export class PreboardingIFrame {
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
    this.iframe.setAttribute("name", IFRAME_NAME);
    this.iframe.setAttribute("src", src);
    this.iframe.allowFullscreen = true;
  }

  /**
   * Show full screen iframe
   */
  private showPreboarding = () => {
    // Make modal visible
    this.container.style.visibility = "visible";

    // Prevent background from scrolling
    document.body.style.height = "100dvh";
    document.body.style.overflowY = "hidden";
  };

  /**
   * Close full screen iframe
   */
  private hidePreboarding = () => {
    // Hide modal visibility
    this.container.style.visibility = "hidden";

    // Revert background to its original values
    document.body.style.height = "";
    document.body.style.overflowY = "";
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
        case Events.PreboardingOpen: {
          this.showPreboarding();
          break;
        }
        case Events.PreboardingClose: {
          this.hidePreboarding();
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
      targetName: Targets.Preboard,
      targetWindow: this.iframe.contentWindow,
      targetOrigin: this.src.origin,
      targetWindowFilter: false,
    });

    this.setupPostMessageEngine();
  }
}
