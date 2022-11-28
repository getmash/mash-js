import JsonRPCEngine from "@getmash/jsonrpc-engine";
import { WalletButtonPosition } from "../api/routes.js";

import RPCMethods from "./methods.js";
import Targets from "./targets.js";

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

  init(earnerID: string, position: WalletButtonPosition) {
    return this.engine.call<void>(RPCMethods.Init, { id: earnerID, position });
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
