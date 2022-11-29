import { PartialDeep } from "type-fest";

import {
  WalletButtonDesktopPosition,
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonMobilePosition,
  WalletButtonPosition,
} from "../api/routes.js";

export enum FloatLocation {
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
}

interface LocationSettings {
  floatLocation: FloatLocation;
}

export type DesktopSettings = LocationSettings & {
  shiftUp: number;
  shiftLeft: number;
  shiftRight: number;
};

export type MobileSettings = LocationSettings;

export type WalletPosition = {
  desktop: DesktopSettings;
  mobile: MobileSettings;
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
  };
}

export function getWalletPosition(
  desktop?: Partial<WalletButtonDesktopPosition> | undefined,
  mobile?: Partial<WalletButtonMobilePosition> | undefined,
): WalletButtonPosition {
  return {
    desktop: getDesktopLocation(desktop),
    mobile: getMobileLocation(mobile),
  };
}

export function formatPosition(position?: PartialDeep<WalletPosition>) {
  const formattedPosition: WalletButtonPosition = getWalletPosition();
  if (position?.desktop?.floatLocation === FloatLocation.BottomLeft) {
    formattedPosition.desktop.floatSide = WalletButtonFloatSide.Left;
  } else if (position?.desktop?.floatLocation === FloatLocation.BottomRight) {
    formattedPosition.desktop.floatSide = WalletButtonFloatSide.Right;
  }

  if (position?.desktop?.shiftLeft || position?.desktop?.shiftRight) {
    formattedPosition.desktop.floatPlacement =
      WalletButtonFloatPlacement.Custom;
    formattedPosition.desktop.customShiftConfiguration.horizontal =
      position.desktop.shiftLeft || 0;
    formattedPosition.desktop.customShiftConfiguration.horizontal =
      position.desktop.shiftRight || 0;
  }

  if (position?.desktop?.shiftUp) {
    formattedPosition.desktop.floatPlacement =
      WalletButtonFloatPlacement.Custom;
    formattedPosition.desktop.customShiftConfiguration.vertical =
      position.desktop.shiftUp || 0;
  }

  if (position?.mobile?.floatLocation === FloatLocation.BottomLeft) {
    formattedPosition.mobile.floatSide = WalletButtonFloatSide.Left;
  } else if (position?.mobile?.floatLocation === FloatLocation.BottomRight) {
    formattedPosition.mobile.floatSide = WalletButtonFloatSide.Right;
  }

  return formattedPosition;
}
