import { TinyColor } from "@ctrl/tinycolor";

import { Theme } from "../api/routes.js";

export default function injectTheme(baseUrl: string, theme: Theme) {
  const color = new TinyColor(theme.primaryColor);
  const hsl = color.toHsl();

  const style = window.document.createElement("style");
  style.innerHTML = `
:root {
  --mash-primary-color-h: ${hsl.h};
  --mash-primary-color-s: ${hsl.s * 100}%;
  --mash-primary-color-l: ${hsl.l * 100}%;
  --mash-primary-color: ${color.toHexString()};
  --mash-font-family: ${theme.fontFamily};
}  
`;
  window.document.head.appendChild(style);

  const link = window.document.createElement("link");
  link.rel = "stylesheet";
  link.href = baseUrl + "/theme/theme.css";

  window.document.head.appendChild(link);
}
