import * as MashWebAPI from "./api/routes.js";
import {
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
} from "./api/routes.js";
import parseConfig, { PartialConfig, Config } from "./config.js";
import { MashEvent } from "./events.js";
import IFrame from "./iframe/IFrame.js";
import { PreboardingIFrame } from "./iframe/PreboardingIFrame.js";
import { getLocation } from "./iframe/position.js";
import MashRPCAPI, { AutopayAuthorization } from "./rpc/RPCApi.js";
import injectFloatingBoosts from "./widgets/boost.js";
import injectPageRevealers from "./widgets/pageRevealer.js";
import preconnect from "./widgets/preconnect.js";
import injectTheme from "./widgets/theme.js";
import { injectWidgets } from "./widgets/widgets.js";

/**
 * @deprecated use constructor local config struct.
 */
export type MashSettings = {
  id: string;
};

class Mash {
  private rpcAPI: MashRPCAPI | null = null;
  private iframe: IFrame;
  private preboardIFrame: PreboardingIFrame;
  private initialized = false;
  /**
   * Configuration set in the local source.
   */
  private localConfig: Config;
  /**
   * Configuration pulled down from the remote source.
   */
  private remoteCustomizationConfig: Promise<MashWebAPI.EarnerCustomizationConfiguration>;
  /**
   * Signals when a (web component) widget connects to the SDK.
   */
  private widgetConnected: Promise<void>;

  constructor(config: PartialConfig) {
    this.localConfig = parseConfig(config);
    this.iframe = new IFrame(this.localConfig.walletURL);
    this.preboardIFrame = new PreboardingIFrame(
      this.localConfig.preboardingURL,
    );

    // Listen for connect events from widgets
    this.widgetConnected = new Promise<void>(res => {
      // Note: subsequent calls to res will be a no-op, which allows us to ignore more than the initial received event.
      // See here: https://stackoverflow.com/questions/20328073#comment92822918_29491617
      window.addEventListener(MashEvent.WebComponentConnected, () => res());
    });

    const defaultConfiguration: MashWebAPI.EarnerCustomizationConfiguration = {
      walletButtonPosition: {
        desktop: {
          floatSide: WalletButtonFloatSide.Left,
          floatPlacement: WalletButtonFloatPlacement.Default,
          customShiftConfiguration: { horizontal: 0, vertical: 0 },
        },
        mobile: {
          floatSide: WalletButtonFloatSide.Left,
          floatPlacement: WalletButtonFloatPlacement.Default,
          customShiftConfiguration: { horizontal: 0, vertical: 0 },
        },
      },
      theme: {
        primaryColor: "#000",
        fontFamily: "inherit",
      },
      boostConfigurations: [],
      pageRevealers: [],
      autoHide: false,
    };

    // If localConfig doesn't have an earner ID, just set the default configuration.
    // This handles a backwards compatibility case.
    if (!this.localConfig.earnerID) {
      this.remoteCustomizationConfig = Promise.resolve(defaultConfiguration);
      return;
    }

    const injectWebComponentScripts =
      this.localConfig.widgets.injectWebComponentScripts ||
      this.localConfig.widgets.injectWidgets;

    if (this.localConfig.widgets.injectTheme || injectWebComponentScripts) {
      preconnect(this.localConfig.widgets.baseURL);
    }

    if (injectWebComponentScripts) {
      injectWidgets(this.localConfig.widgets.baseURL);
    }

    this.remoteCustomizationConfig = MashWebAPI.getEarner(
      this.localConfig.api,
      this.localConfig.earnerID,
    )
      .then(result => {
        // set local overrides
        result.customization.walletButtonPosition.desktop.floatSide =
          this.localConfig.mashButtonPosition?.desktop?.floatSide ??
          result.customization.walletButtonPosition.desktop.floatSide;
        result.customization.walletButtonPosition.mobile.floatSide =
          this.localConfig.mashButtonPosition?.mobile?.floatSide ??
          result.customization.walletButtonPosition.mobile.floatSide;

        if (this.localConfig.widgets.injectTheme) {
          injectTheme(
            this.localConfig.widgets.baseURL,
            result.customization.theme,
          );
        }

        if (this.localConfig.widgets.injectFloatingWidgets) {
          if (result.customization.boostConfigurations) {
            injectFloatingBoosts(
              result.customization.boostConfigurations,
              window.location.pathname,
              getLocation(result.customization.walletButtonPosition),
            );
          }

          if (result.customization.pageRevealers) {
            injectPageRevealers(
              result.customization.pageRevealers,
              window.location.pathname,
            );
          }
        }

        return result.customization;
      })
      .catch(err => {
        console.warn(
          "[MASH] Error when fetching remote configuration, using default configuration.\n",
          err,
        );

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

  /**
   * Initialize the Mash Button app and connect it to the site.
   * @param settings is deprecated, use the constructor for local settings.
   */
  async init(settings?: MashSettings) {
    // Backwards compatibility with legacy local configuration.
    if (settings) {
      this.localConfig.earnerID = settings.id;
    }

    if (this.iframe.mounted) {
      console.warn("[MASH] Already mounted, ignoring this call to init Mash");
      return Promise.resolve(null);
    }

    const customizationConfig = await this.remoteCustomizationConfig;

    // If autohiding, wait to see if a web component mounts
    const autohide = this.localConfig.autoHide ?? customizationConfig.autoHide;
    if (autohide) {
      console.info(
        "[MASH] Autohide is enabled - waiting for a web component widget to connect",
      );
      return this.widgetConnected.then(() => {
        console.info("[MASH] A web component widget connected - mounting");
        return this.mount(customizationConfig.walletButtonPosition);
      });
    }

    return this.mount(customizationConfig.walletButtonPosition);
  }

  /**
   * Request access for given resource. If users does not have access it will trigger payment flow.
   */
  access(resourceID: string): Promise<boolean> {
    if (!this.rpcAPI) return Promise.resolve(false);

    return this.rpcAPI
      .access(resourceID)
      .then(res => res.hasAccess)
      .catch(err => {
        console.warn(
          "[MASH] Error when attempting access, is this the correct resource ID?\n",
          err,
        );
        return false;
      });
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
      if (!this.rpcAPI) return reject("cannot connect to Mash widget");
      this.rpcAPI
        .donate()
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  /**
   * Determine if user has a valid budget configured for the current site.
   */
  userHasValidBudget(resourceID: string): Promise<boolean> {
    if (!this.rpcAPI) return Promise.resolve(false);
    return Promise.all([
      this.rpcAPI.getAutopayAuthorization(),
      this.rpcAPI.getResourceCost(resourceID),
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
  async mount(position: MashWebAPI.WalletButtonPosition) {
    return new Promise((resolve, reject) => {
      const onIframeLoaded = (iframe: HTMLIFrameElement) => {
        this.rpcAPI = new MashRPCAPI(
          this.iframe.src.origin,
          iframe.contentWindow,
        );

        this.rpcAPI
          .init(this.localConfig.earnerID, position)
          .then(() => {
            this.initialized = true;
            resolve(null);
          })
          .catch(err => reject(err));

        // Mount other dependent iframes
        this.preboardIFrame.mount();
      };

      this.iframe.mount(onIframeLoaded, position);
    });
  }
}

export default Mash;
