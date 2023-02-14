import {
  WalletButtonDesktopPosition,
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonMobilePosition,
  WalletButtonPosition,
} from "../api/routes.js";

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

function getDesktopLocation(
  desktop?: Partial<WalletButtonDesktopPosition>,
): WalletButtonDesktopPosition {
  return {
    floatSide: normalizeFloatSide(desktop?.floatSide),
    floatPlacement: normalizeFloatPlacement(desktop?.floatPlacement),
    customShiftConfiguration: {
      horizontal: desktop?.customShiftConfiguration?.horizontal || 0,
      vertical: desktop?.customShiftConfiguration?.vertical || 0,
    },
  };
}

function getMobileLocation(
  mobile?: Partial<WalletButtonMobilePosition>,
): WalletButtonMobilePosition {
  return {
    floatSide: normalizeFloatSide(mobile?.floatSide),
    floatPlacement: normalizeFloatPlacement(mobile?.floatPlacement),
    customShiftConfiguration: {
      horizontal: mobile?.customShiftConfiguration?.horizontal || 0,
      vertical: mobile?.customShiftConfiguration?.vertical || 0,
    },
  };
}

/**
 * Full remote wallet position configuration, any missing parts have default values.
 */
export function getWalletPosition(
  desktop?: Partial<WalletButtonDesktopPosition> | undefined,
  mobile?: Partial<WalletButtonMobilePosition> | undefined,
): WalletButtonPosition {
  return {
    desktop: getDesktopLocation(desktop),
    mobile: getMobileLocation(mobile),
  };
}
