import Color, { getReadableTextColor, VariablePrimaryColor } from "../color";
import css from "../css";
import WebComponents from "../elements";
import selector from "../selector";

function generate(color: Color): string {
  return css.toString([
    {
      selectors: [
        selector(WebComponents.Button, "button"),
        selector(WebComponents.Accordion, "button"),
      ],
      properties: {
        "font-family": "inherit",
      },
    },
    {
      selectors: [
        selector(WebComponents.Button, "solid"),
        selector(WebComponents.Accordion, "solid"),
      ],
      properties: {
        "background-color": VariablePrimaryColor,
        color: getReadableTextColor(color.toHexString()),
      },
    },
    {
      selectors: [
        selector(WebComponents.Button, "solid", "hover"),
        selector(WebComponents.Accordion, "solid", "hover"),
      ],
      properties: {
        "background-color": color.darken(20).toHexString(),
      },
    },
    {
      selectors: [
        selector(WebComponents.Button, "solid", "active"),
        selector(WebComponents.Accordion, "solid", "active"),
      ],
      properties: {
        "background-color": color.darken(40).toHexString(),
      },
    },
    {
      selectors: [
        selector(WebComponents.Button, "outlined"),
        selector(WebComponents.Accordion, "outlined"),
      ],
      properties: {
        "border-color": VariablePrimaryColor,
        "background-color": "transparent",
        color: VariablePrimaryColor,
      },
    },
    {
      selectors: [
        selector(WebComponents.Button, "outlined", "hover"),
        selector(WebComponents.Accordion, "outlined", "hover"),
      ],
      properties: {
        "background-color": color.lighten(80).toRgbString(),
      },
    },
    {
      selectors: [
        selector(WebComponents.Button, "outlined", "active"),
        selector(WebComponents.Accordion, "outlined", "active"),
      ],
      properties: {
        "background-color": color.lighten(60).toRgbString(),
      },
    },
  ]);
}

export default { generate };
