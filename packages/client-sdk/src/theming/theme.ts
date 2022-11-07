import Color from "./color";
import ButtonTemplate from "./templates/Button";
import RootTemplate from "./templates/Root";

export function minify(stylesheet: string) {
  return stylesheet.replaceAll(/\n|\t/g, " ");
}

export function build(primaryColor: string) {
  const color = new Color(primaryColor);
  const styles = [RootTemplate.generate(color), ButtonTemplate.generate(color)];
  return styles.join("\n");
}

export function inject(stylesheet: string) {
  const styleTag = window.document.createElement("style");
  styleTag.innerHTML = minify(stylesheet);
  console.log("styleTag: ", styleTag);
  window.document.head.appendChild(styleTag);
  console.log("window.document: ", window.document);
}
