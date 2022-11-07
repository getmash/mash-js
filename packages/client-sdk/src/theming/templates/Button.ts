import Color, { getReadableTextColor, VariablePrimaryColor } from "../color";
import css from "../css";
import WebComponents from "../elements";
import selector from "../selector";

const selectors = (
  components: WebComponents[],
  part: string,
  state?: "active" | "hover",
) => components.map(c => selector(c, part, state));

function generate(color: Color): string {
  return css.toString([
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "button",
      ),
      properties: {
        "font-family": "inherit",
      },
    },
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "solid",
      ),
      properties: {
        "background-color": VariablePrimaryColor,
        color: getReadableTextColor(color.toHexString()),
      },
    },
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "solid",
        "hover",
      ),
      properties: {
        "background-color": color.darken(20).toHexString(),
      },
    },
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "solid",
        "active",
      ),
      properties: {
        "background-color": color.darken(40).toHexString(),
      },
    },
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "outlined",
      ),
      properties: {
        "border-color": VariablePrimaryColor,
        "background-color": "transparent",
        color: VariablePrimaryColor,
      },
    },
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "outlined",
        "hover",
      ),
      properties: {
        "background-color": color.lighten(80).toRgbString(),
      },
    },
    {
      selectors: selectors(
        [
          WebComponents.Button,
          WebComponents.Accordion,
          WebComponents.Download,
          WebComponents.TextReveal,
        ],
        "outlined",
        "active",
      ),
      properties: {
        "background-color": color.lighten(60).toRgbString(),
      },
    },
  ]);
}

export default { generate };
