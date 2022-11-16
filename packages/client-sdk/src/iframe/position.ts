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
 * Validates the string value is one of the accepted FloatLocations
 * @param location string
 * @returns boolean
 */
function normalize(location: FloatLocation | undefined) {
  if (
    !location ||
    !Object.values(FloatLocation).includes(location as FloatLocation)
  ) {
    return FloatLocation.BottomRight;
  }

  return location;
}

function getDesktopLocation(
  desktop?: Partial<DesktopSettings>,
): DesktopSettings {
  return {
    floatLocation: normalize(desktop?.floatLocation),
    shiftLeft: desktop?.shiftLeft || 0,
    shiftRight: desktop?.shiftRight || 0,
    shiftUp: desktop?.shiftUp || 0,
  };
}

function getMobileLocation(mobile?: Partial<MobileSettings>): MobileSettings {
  return {
    floatLocation: normalize(mobile?.floatLocation),
  };
}

export function getWalletPosition(
  desktop: Partial<DesktopSettings> | undefined,
  mobile: Partial<MobileSettings> | undefined,
): WalletPosition {
  return {
    desktop: getDesktopLocation(desktop),
    mobile: getMobileLocation(mobile),
  };
}
