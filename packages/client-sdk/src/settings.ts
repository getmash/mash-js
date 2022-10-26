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

/**
 * Type definition for the settings passed in by the consumer.
 * Wallet position is optional and mobile and desktop settings can
 * be partially set
 */
export type MashSettings = {
  id: string;
  position?: {
    desktop: Partial<DesktopSettings>;
    mobile: Partial<MobileSettings>;
  };
};

/**
 * Type definition for the positioning of the Wallet
 */
export type WalletPosition = {
  desktop: DesktopSettings;
  mobile: MobileSettings;
};

/**
 * Type definition used internal after settings have been merged
 * This type ensure all the values have been set and configured
 */
export type MergedMashSettings = {
  id: string;
  position: WalletPosition;
};

const DEFAULT_DESKTOP: DesktopSettings = {
  floatLocation: FloatLocation.BottomRight,
  shiftUp: 0,
  shiftLeft: 0,
  shiftRight: 0,
};

const DEFAULT_MOBILE: MobileSettings = {
  floatLocation: FloatLocation.BottomRight,
};

function validateFloatLocation(location: FloatLocation) {
  return Object.values(FloatLocation).includes(location);
}

export function merge(settings: MashSettings): MergedMashSettings {
  // merge settings with default for desktop
  const desktop = Object.assign(
    DEFAULT_DESKTOP,
    settings.position?.desktop || {},
  );

  // Merge settings with default for mobile
  const mobile = Object.assign(DEFAULT_MOBILE, settings.position?.mobile || {});

  // Verify float location for mobile settings or default to BottomRight
  if (!validateFloatLocation(mobile.floatLocation)) {
    mobile.floatLocation = FloatLocation.BottomRight;
  }

  // Verify float location for desktop settings or default to BottomRight
  if (!validateFloatLocation(desktop.floatLocation)) {
    desktop.floatLocation = FloatLocation.BottomRight;
  }

  return {
    id: settings.id,
    position: { desktop, mobile },
  };
}
