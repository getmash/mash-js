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
  // Configuration set in the local source.
  private localConfig: Config;
  // Configuration pulled down from the remote source.
  private remoteConfig: Promise<MashAPI.EarnerCustomizationConfiguration>;

  constructor(config: PartialConfig) {
    this.localConfig = parseConfig(config);
    this.iframe = new IFrame(this.localConfig.walletURL);

    if (
      this.localConfig.widgets.injectTheme ||
      this.localConfig.widgets.injectWidgets
    ) {
      preconnect(this.localConfig.widgets.baseURL);
    }

    if (this.localConfig.widgets.injectWidgets) {
      injectWidgets(this.localConfig.widgets.baseURL);
    }

    this.remoteConfig = MashAPI.getEarner(
      this.localConfig.api,
      this.localConfig.earnerID,
    )
      .then(result => {
        if (this.localConfig.widgets.injectTheme) {
          injectTheme(
            this.localConfig.widgets.baseURL,
            result.customization.theme,
          );
        }
        return result.customization;
      })
      .catch(() => {
        console.warn(
          "[MASH] Error when fetching remote configuration, using default configuration",
        );

        const defaultConfiguration: MashAPI.EarnerCustomizationConfiguration = {
          walletButtonPosition: getWalletPosition(),
          theme: {
            primaryColor: "#000",
            fontFamily: "inherit",
          },
          boostConfigurations: [],
        };

        // If API error, inject default theme
        if (this.localConfig.widgets.injectTheme) {
          injectTheme(
            this.localConfig.widgets.baseURL,
            defaultConfiguration.theme,
          );
        }

        return defaultConfiguration;
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

  private _init(settings?: MashSettings) {
    // Just for backward compatibility with existing users who pass in settings.
    if (settings) {
      this.localConfig.earnerID = settings.id;
      const formattedPosition = formatPosition(settings?.position || {});
      const position = getWalletPosition(
        formattedPosition.desktop,
        formattedPosition.mobile,
      );
      return this.mount(position);
    }

    return this.remoteConfig.then(config =>
      this.mount(config.walletButtonPosition),
    );
  }

  /**
   * Initialize the Mash Button app and connect it to the site.
   * @param settings is deprecated, use the constructor instead.
   */
  init(settings?: MashSettings) {
    if (this.iframe.mounted) {
      console.warn("[MASH] Already mounted, ignoring this call to init Mash");
      return Promise.resolve(null);
    }

    if (!this.localConfig.autoHide) {
      return this._init(settings);
    }

    return isWidgetOnPage().then(widgetsExist => {
      if (!widgetsExist) {
        console.info(
          "[MASH] No mash elements found on page. Mash Wallet is hidden",
        );
        return Promise.resolve(null);
      }
      return this._init(settings);
    });
  }

  /**
   * Request access for given resource. If users does not have access it will trigger payment flow.
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
   * Trigger donation flow for user.
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
   * Determine if user has a valid budget configured for the current site.
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
   * Check if the wallet is initialized on the current page.
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Mount the Button App iframe.
   */
  private mount(position: MashAPI.WalletButtonPosition): Promise<null> {
    return new Promise((resolve, reject) => {
      const onIframeLoaded = (iframe: HTMLIFrameElement) => {
        this.api = new MashRPCAPI(this.iframe.src.origin, iframe.contentWindow);

        this.api
          .init(this.localConfig.earnerID, position)
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
