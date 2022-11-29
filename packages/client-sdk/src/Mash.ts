import { PartialDeep } from "type-fest";

import * as MashAPI from "./api/routes.js";
import parseConfig, { PartialConfig, Config } from "./config.js";
import IFrame from "./iframe/IFrame.js";
import {
  getWalletPosition,
  WalletPosition,
  formatPosition,
} from "./iframe/position.js";
import MashRPCAPI, { AutopayAuthorization } from "./rpc/RPCApi.js";
import preconnect from "./widgets/preconnect.js";
import injectTheme from "./widgets/theme.js";
import { injectWidgets, isWidgetOnPage } from "./widgets/widgets.js";

export type MashSettings = {
  id: string;
  position: PartialDeep<WalletPosition>;
};

class Mash {
  private api: MashRPCAPI | null = null;
  private iframe: IFrame;
  private initialized = false;
  private config: Config;
  private positionPromise: Promise<MashAPI.WalletButtonPosition>;

  constructor(config: string | PartialConfig) {
    /**
     * Backwards compatibility to support existing earners
     */
    if (typeof config === "string") {
      this.positionPromise = Promise.resolve(getWalletPosition());
      this.iframe = new IFrame(config);
      // earnerID will be retrieved through MashSettings on the init call
      this.config = parseConfig({ earnerID: "", walletURL: config });
      return;
    }

    this.config = parseConfig(config);
    this.iframe = new IFrame(this.config.walletURL);

    if (this.config.widgets.injectTheme || this.config.widgets.injectWidgets) {
      preconnect(this.config.widgets.baseURL);
    }

    if (this.config.widgets.injectWidgets) {
      injectWidgets(this.config.widgets.baseURL);
    }

    this.positionPromise = MashAPI.getEarner(
      this.config.api,
      this.config.earnerID,
    )
      .then(result => {
        if (this.config.widgets.injectTheme) {
          injectTheme(this.config.widgets.baseURL, result.customization.theme);
        }
        return result.customization.walletButtonPosition;
      })
      .catch(() => {
        console.warn(
          "[MASH] Error when fetching wallet placement from API, using default placement and theme",
        );
        // If API error, inject default theme
        if (this.config.widgets.injectTheme) {
          injectTheme(this.config.widgets.baseURL, {
            primaryColor: "#000",
            fontFamily: "inherit",
          });
        }
        return getWalletPosition();
      });
  }

  private static hasValidAutopayAuthorization(
    cost: string,
    authorization: AutopayAuthorization | null,
  ): boolean {
    if (!authorization) return false;
    const maxSpend = parseFloat(authorization.maxAutopayAuthorized.value);
    const cleanCost = parseFloat(cost);
    const curSpend = parseFloat(authorization.spentAmount.fiat.value);
    return curSpend + cleanCost <= maxSpend;
  }

  init(settings?: MashSettings) {
    if (this.config.autoHide && !isWidgetOnPage()) {
      console.info(
        "[MASH] No mash elements found on page. Mash Wallet is hidden",
      );
      return Promise.resolve(null);
    }

    if (this.iframe.mounted) {
      console.warn("[MASH] Already mounted, ignoring this call to init Mash");
      return Promise.resolve(null);
    }

    // Backwards support for older init flow where earnerID is only
    // passed through settings object in init function
    if (!this.config.earnerID && settings) {
      this.config.earnerID = settings.id;
    }

    if (settings?.position) {
      const formattedPosition = formatPosition(settings?.position);
      const position = getWalletPosition(
        formattedPosition.desktop,
        formattedPosition.mobile,
      );
      return this.mount(position);
    }

    return this.positionPromise.then(position => {
      this.mount(position);
    });
  }

  /**
   * Request access for given resource. If users does not have access it will trigger
   * payment flow.
   * @param resourceID Unique resource ID
   * @returns boolean
   */
  access(resourceID: string): Promise<boolean> {
    if (!this.api) return Promise.resolve(false);

    return this.api
      .access(resourceID)
      .then(res => res.hasAccess)
      .catch(() => false);
  }

  /**
   * @deprecated use .access()
   */
  hasAccess(resourceID: string): Promise<boolean> {
    return this.access(resourceID);
  }

  /**
   * Trigger donation flow for user
   * @returns void
   */
  donate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.api) return reject("cannot connect to Mash widget");
      this.api
        .donate()
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  /**
   * Determine if user has a valid budget configured for the current site
   * @param resourceID Unique resource ID
   * @returns boolean
   */
  userHasValidBudget(resourceID: string): Promise<boolean> {
    if (!this.api) return Promise.resolve(false);
    return Promise.all([
      this.api.getAutopayAuthorization(),
      this.api.getResourceCost(resourceID),
    ]).then(result => {
      const [authorization, cost] = result;
      return Mash.hasValidAutopayAuthorization(cost.fiat.value, authorization);
    });
  }

  /**
   * Check if the wallet is initialized on the current page
   * @returns boolean
   */
  isReady() {
    return this.initialized;
  }

  private mount(position: MashAPI.WalletButtonPosition) {
    return new Promise((resolve, reject) => {
      const onIframeLoaded = (iframe: HTMLIFrameElement) => {
        this.api = new MashRPCAPI(this.iframe.src.origin, iframe.contentWindow);

        this.api
          .init(this.config.earnerID, position)
          .then(() => {
            this.initialized = true;
            resolve(null);
          })
          .catch(err => reject(err));
      };

      this.iframe.mount(onIframeLoaded, position);
    });
  }
}

export default Mash;
