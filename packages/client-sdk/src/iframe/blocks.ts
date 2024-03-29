export enum Events {
  PreboardingOpen = "preboarding:open",
  PreboardingClose = "preboarding:close",
  WalletOpened = "wallet:open",
  WalletClosed = "wallet:close",
  WalletLoaded = "wallet:loaded",
  LayoutChanged = "layout:changed",
  NotificationUpdate = "notifications:update",
}

export enum Targets {
  HostSiteFrame = "@mash/host-site-iframe",
  Wallet = "@mash/wallet",
  Preboard = "@mash/preboarding",
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
