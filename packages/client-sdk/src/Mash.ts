import IFrame from "./IFrame";
import MashRPCAPI, { AutopayAuthorization } from "./rpc/RPCApi";
import MashSettings from "./types";

class Mash {
  private api: MashRPCAPI | null = null;
  private iframe: IFrame;
  private initialized = false;

  constructor(src = "https://wallet.getmash.com/widget") {
    this.iframe = new IFrame(src);
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

  init(settings: MashSettings) {
    if (this.iframe.mounted) {
      console.warn("[MASH] Already mounted, ignoring this call to init Mash");
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const onIframeLoaded = (iframe: HTMLIFrameElement) => {
        this.api = new MashRPCAPI(this.iframe.src.origin, iframe.contentWindow);

        this.api
          .init(settings.id)
          .then(() => {
            this.initialized = true;

            resolve(null);
          })
          .catch(err => reject(err));
      };

      this.iframe.mount(onIframeLoaded, settings.position);
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
}

export default Mash;
