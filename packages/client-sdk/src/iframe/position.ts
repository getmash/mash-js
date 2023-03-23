import { PartialDeep } from "type-fest";
import {
  WalletButtonDevicePosition,
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonPosition,
} from "../api/routes.js";

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

export enum FloatLocation {
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}

export type LocationSettings = {
  floatLocation: FloatLocation;
  bottom?: number;
  left?: number;
  right?: number;
};

/**
 * Location of wallet button is more exact than the higher level position configs.
 */
export type WalletButtonLocation = {
  desktop: LocationSettings;
  mobile: LocationSettings;
};

/**
 * Validates the string value is one of the accepted FloatSides
 * @param location string
 * @returns WalletButtonFloatSide
 */
function normalizeFloatSide(location: WalletButtonFloatSide | undefined) {
  if (
    !location ||
    !Object.values(WalletButtonFloatSide).includes(
      location as WalletButtonFloatSide,
    )
  ) {
    return WalletButtonFloatSide.Right;
  }

  return location;
}

/**
 * Validates the string value is one of the accepted FloatPlacements
 * @param location string
 * @returns WalletButtonFloatPlacement
 */
function normalizeFloatPlacement(
  location: WalletButtonFloatPlacement | undefined,
) {
  if (
    !location ||
    !Object.values(WalletButtonFloatPlacement).includes(
      location as WalletButtonFloatPlacement,
    )
  ) {
    return WalletButtonFloatPlacement.Default;
  }

  return location;
}

function getPositionConfig(cfg?: PartialDeep<WalletButtonDevicePosition>) {
  return {
    floatSide: normalizeFloatSide(cfg?.floatSide),
    floatPlacement: normalizeFloatPlacement(cfg?.floatPlacement),
    customShiftConfiguration: {
      horizontal: cfg?.customShiftConfiguration?.horizontal || 0,
      vertical: cfg?.customShiftConfiguration?.vertical || 0,
    },
  };
}

/**
 * Full wallet position configuration, any missing parts have default values.
 */
export function getWalletPosition(
  desktop?: Partial<WalletButtonDevicePosition> | undefined,
  mobile?: Partial<WalletButtonDevicePosition> | undefined,
): WalletButtonPosition {
  return {
    desktop: getPositionConfig(desktop),
    mobile: getPositionConfig(mobile),
  };
}

/**
 * Normalize shift to ensure valid value.
 */
function normalizeShift(value: number, max: number) {
  if (value < 0) {
    return 0;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * Transform number value to css pixel representation.
 */
export function toPixel(n?: number): string {
  // empty string is not set
  return n === undefined || n === null ? "" : `${n}px`;
}

/**
 * Calculate location based on configuration.
 */
export function getLocation(
  config: WalletButtonPosition,
): WalletButtonLocation {
  // initialize mobile location based on float side, override specifics below
  const mobileLocation =
    config.mobile.floatSide === WalletButtonFloatSide.Right
      ? {
          floatLocation: FloatLocation.BottomRight,
          bottom: 0,
          right: 0,
        }
      : {
          floatLocation: FloatLocation.BottomLeft,
          bottom: 0,
          left: 0,
        };

  // overrides if needed
  switch (config.mobile.floatPlacement) {
    case WalletButtonFloatPlacement.WixActionBar: {
      mobileLocation.bottom = WIX_ACTION_BAR;
      break;
    }
    case WalletButtonFloatPlacement.BasicShiftVertical: {
      mobileLocation.bottom = BASIC_SHIFT_VERTICAL;
      break;
    }
    case WalletButtonFloatPlacement.Custom: {
      mobileLocation.bottom = normalizeShift(
        config.mobile.customShiftConfiguration.vertical,
        MAX_SHIFT_VERTICAL,
      );
      break;
    }
  }

  // initialize desktop location based on float side, override specifics below
  const desktopLocation =
    config.desktop.floatSide === WalletButtonFloatSide.Right
      ? {
          floatLocation: FloatLocation.BottomRight,
          bottom: 0,
          right: 0,
        }
      : {
          floatLocation: FloatLocation.BottomLeft,
          bottom: 0,
          left: 0,
        };

  // overrides if needed
  switch (config.desktop.floatPlacement) {
    case WalletButtonFloatPlacement.Ghost: {
      desktopLocation.bottom = GHOST_SHIFT;
      break;
    }
    case WalletButtonFloatPlacement.Intercom: {
      desktopLocation.bottom = INTERCOM_SHIFT;
      break;
    }
    case WalletButtonFloatPlacement.BasicShiftVertical: {
      desktopLocation.bottom = BASIC_SHIFT_VERTICAL;
      break;
    }
    case WalletButtonFloatPlacement.BasicShiftHorizontal: {
      switch (config.desktop.floatSide) {
        case WalletButtonFloatSide.Left: {
          desktopLocation.left = BASIC_SHIFT_HORIZONTAL;
          break;
        }
        case WalletButtonFloatSide.Right: {
          desktopLocation.right = BASIC_SHIFT_HORIZONTAL;
          break;
        }
      }
      break;
    }
    case WalletButtonFloatPlacement.Custom: {
      switch (config.desktop.floatSide) {
        case WalletButtonFloatSide.Left: {
          desktopLocation.left = normalizeShift(
            config.desktop.customShiftConfiguration.horizontal,
            MAX_SHIFT_HORIZONTAL,
          );
          break;
        }
        case WalletButtonFloatSide.Right: {
          desktopLocation.right = normalizeShift(
            config.desktop.customShiftConfiguration.horizontal,
            MAX_SHIFT_HORIZONTAL,
          );
          break;
        }
      }
      desktopLocation.bottom = normalizeShift(
        config.desktop.customShiftConfiguration.vertical,
        MAX_SHIFT_VERTICAL,
      );
      break;
    }
  }

  return { mobile: mobileLocation, desktop: desktopLocation };
}
