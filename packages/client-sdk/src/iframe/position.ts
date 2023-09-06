import { PartialDeep } from "type-fest";

import {
  WalletButtonDesktopPosition,
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonMobilePosition,
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

function getMobilePositionConfig(
  cfg?: PartialDeep<WalletButtonMobilePosition>,
) {
  return {
    floatSide: normalizeFloatSide(cfg?.floatSide),
    floatPlacement: normalizeFloatPlacement(cfg?.floatPlacement),
  };
}

function getDesktopPositionConfig(
  cfg?: PartialDeep<WalletButtonDesktopPosition>,
) {
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
 * Initialize the location settings based on the position settings.
 */
function initLocation(
  position: WalletButtonDesktopPosition | WalletButtonMobilePosition,
): LocationSettings {
  if (position.floatSide === WalletButtonFloatSide.Left) {
    return {
      floatLocation: FloatLocation.BottomLeft,
      bottom: 0,
      left: 0,
    };
  }
  return {
    floatLocation: FloatLocation.BottomRight,
    bottom: 0,
    right: 0,
  };
}

/**
 * Override the default location settings with the position settings.
 */
function setMobileOverrides(
  position: WalletButtonMobilePosition,
  location: LocationSettings,
) {
  // overrides if needed
  switch (position.floatPlacement) {
    case WalletButtonFloatPlacement.WixActionBar: {
      location.bottom = WIX_ACTION_BAR;
      break;
    }
    case WalletButtonFloatPlacement.BasicShiftVertical: {
      location.bottom = BASIC_SHIFT_VERTICAL;
      break;
    }
  }
}

/**
 * Override the default location settings with the position settings.
 */
function setDesktopOverrides(
  position: WalletButtonDesktopPosition,
  location: LocationSettings,
) {
  // overrides if needed
  switch (position.floatPlacement) {
    case WalletButtonFloatPlacement.Ghost: {
      location.bottom = GHOST_SHIFT;
      break;
    }
    case WalletButtonFloatPlacement.Intercom: {
      location.bottom = INTERCOM_SHIFT;
      break;
    }
    case WalletButtonFloatPlacement.BasicShiftVertical: {
      location.bottom = BASIC_SHIFT_VERTICAL;
      break;
    }
    case WalletButtonFloatPlacement.BasicShiftHorizontal: {
      switch (position.floatSide) {
        case WalletButtonFloatSide.Left: {
          location.left = BASIC_SHIFT_HORIZONTAL;
          break;
        }
        case WalletButtonFloatSide.Right: {
          location.right = BASIC_SHIFT_HORIZONTAL;
          break;
        }
      }
      break;
    }
    case WalletButtonFloatPlacement.Custom: {
      switch (position.floatSide) {
        case WalletButtonFloatSide.Left: {
          location.left = normalizeShift(
            position.customShiftConfiguration.horizontal,
            MAX_SHIFT_HORIZONTAL,
          );
          break;
        }
        case WalletButtonFloatSide.Right: {
          location.right = normalizeShift(
            position.customShiftConfiguration.horizontal,
            MAX_SHIFT_HORIZONTAL,
          );
          break;
        }
      }
      location.bottom = normalizeShift(
        position.customShiftConfiguration.vertical,
        MAX_SHIFT_VERTICAL,
      );
      break;
    }
  }
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
  const mobileLocation = initLocation(config.mobile);
  const desktopLocation = initLocation(config.desktop);
  setMobileOverrides(config.mobile, mobileLocation);
  setDesktopOverrides(config.desktop, desktopLocation);
  return { mobile: mobileLocation, desktop: desktopLocation };
}

/**
 * Full wallet position configuration, any missing parts have default values.
 */
export function getWalletPosition(
  desktop?: Partial<WalletButtonDesktopPosition> | undefined,
  mobile?: Partial<WalletButtonMobilePosition> | undefined,
): WalletButtonPosition {
  return {
    desktop: getDesktopPositionConfig(desktop),
    mobile: getMobilePositionConfig(mobile),
  };
}
