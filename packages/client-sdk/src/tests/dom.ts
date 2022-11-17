import { JSDOM } from "jsdom";

export function createDOM() {
  const dom = new JSDOM(``);
  global.document = dom.window.document;
  //@ts-expect-error JSDOM Window mismatch
  global.window = dom.window;
}
