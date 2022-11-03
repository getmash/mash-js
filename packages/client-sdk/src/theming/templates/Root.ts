import Color from "../color";
import css from "../css";

function generate(color: Color): string {
  return css.toString([
    {
      selectors: [":root"],
      properties: {
        "--mash-primary-color": color.toHexString(),
      },
    },
  ]);
}

export default { generate };
