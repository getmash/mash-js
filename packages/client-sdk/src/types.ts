type Theme = {
    primaryColor: string,
    fontFamily: string
}

enum WalletButtonFloatSide {
    Left = "left",
    Right = "right",
}

enum WalletButtonFloatPlacement {
    Default = "default",
    Custom = "custom",
    Ghost = "ghost",
    Intercom = "intercom",
    BasicShiftVertical = "basic_shift_vertical",
    BasicShiftHorizontal = "basic_shift_horizontal",
  }

type WalletButtonShiftConfiguration = {
    horizontal: number,
    vertical: number
}

type WalletButtonDesktopPosition = {
    floatSide: WalletButtonFloatSide,
    floatPlacement: WalletButtonFloatPlacement,
    customShiftConfiguration: WalletButtonShiftConfiguration
}

type WalletButtonMobilePosition = {
    floatSide: WalletButtonFloatSide;
}

export type WalletButtonPosition = {
    desktop: WalletButtonDesktopPosition,
    mobile: WalletButtonMobilePosition
}

type EarnerCustomizationConfiguration = {
    walletButtonPosition: WalletButtonPosition,
    theme: Theme;
}

export type CustomizationResponse = {
    customization: EarnerCustomizationConfiguration
}