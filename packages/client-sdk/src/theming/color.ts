import { TinyColor, isReadable } from "@ctrl/tinycolor";

export const Black = "#000";
export const White = "#FFF";
export const VariablePrimaryColor = "var(--mash-primary-color)";

export function getReadableTextColor(bg: string): string {
  if (isReadable(bg, White)) {
    return White;
  }
  return Black;
}

class Color extends TinyColor {}
export default Color;
