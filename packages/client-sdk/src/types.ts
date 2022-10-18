/**
 * Type definition for the positioning of the Wallet
 */
export type WalletPosition = {
  shiftUp?: number;
  shiftLeft?: number;
};

/**
 * Type definition for the settings of the Wallet
 */
type MashSettings = {
  id: string;
  position?: WalletPosition;
};

export default MashSettings;
