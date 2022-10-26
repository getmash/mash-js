import JsonRPCEngine from "@getmash/jsonrpc-engine";

import { MashSettings } from "../settings";
import RPCMethods from "./methods";
import Targets from "./targets";

enum FiatCurrency {
  Usd = "USD",
}

type FiatAmount = {
  value: string;
  currency: FiatCurrency;
};

type Money = {
  satoshis: number;
  fiat: FiatAmount;
};

export type AutopayAuthorization = {
  contentGroupID: string;
  maxAutopayAuthorized: FiatAmount;
  spentAmount: Money;
};

type ResourceAccessResult = {
  hasAccess: boolean;
};

class MashRPCApi {
  private engine: JsonRPCEngine;

  constructor(origin: string, target?: Window | null) {
    this.engine = new JsonRPCEngine({
      name: Targets.MashSDK,
      targetName: Targets.Wallet,
      targetWindow: target || undefined,
      targetOrigin: origin,
    });
  }

  init(settings: MashSettings) {
    return this.engine.call<void>(RPCMethods.Init, settings);
  }

  access(resourceID: string) {
    return this.engine.call<ResourceAccessResult>(
      RPCMethods.Access,
      resourceID,
    );
  }

  donate() {
    return this.engine.call<void>(RPCMethods.Donate);
  }

  getAutopayAuthorization() {
    return this.engine
      .call<{ authorization: AutopayAuthorization | null }>(
        RPCMethods.GetAutopayAuthorization,
      )
      .then(res => res.authorization);
  }

  getResourceCost(resourceID: string) {
    return this.engine
      .call<{ cost: Money }>(RPCMethods.GetResourceCost, resourceID)
      .then(res => res.cost);
  }
}

export default MashRPCApi;
