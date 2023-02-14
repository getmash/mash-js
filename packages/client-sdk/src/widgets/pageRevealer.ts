import { PageRevealer } from "../api/routes.js";
import toAttributeStyle from "./attribute.js";
import { pageSelected } from "./pageMatcher.js";

/**
 * Inject page revealer widgets onto site.
 * @param pathname of the current location (e.g. /my/url) to filter configurations.
 */
export default function injectPageRevealers(
  pageRevealers: PageRevealer[],
  pathname: string,
) {
  pageRevealers.forEach(config => {
    if (
      config.active &&
      pageSelected(pathname, config.pages.target, config.pages.matchers)
    ) {
      const pageRevealer = window.document.createElement("mash-page-revealer");
      pageRevealer.setAttribute("template", toAttributeStyle(config.template));
      if (config.templateImage) {
        pageRevealer.setAttribute(
          "template-image",
          toAttributeStyle(config.templateImage),
        );
      }
      if (config.templateImageColor) {
        pageRevealer.setAttribute(
          "template-image-color",
          toAttributeStyle(config.templateImageColor),
        );
      }

      // lit boolean properties are truthy if exist
      if (config.logoEnabled) {
        pageRevealer.setAttribute("logo", "true");
      }

      if (config.logoURL) {
        pageRevealer.setAttribute("logo-src", toAttributeStyle(config.logoURL));
      }
      pageRevealer.setAttribute(
        "text-align",
        toAttributeStyle(config.textAlignment),
      );
      pageRevealer.setAttribute("title", config.title);
      if (config.message) {
        pageRevealer.setAttribute("message", toAttributeStyle(config.message));
      }
      // lit should handle parsing the array on the other side
      pageRevealer.setAttribute("bullets", JSON.stringify(config.bullets));
      if (config.buttonColor) {
        pageRevealer.setAttribute(
          "button-color",
          toAttributeStyle(config.buttonColor),
        );
      }

      if (config.fontFamily) {
        pageRevealer.setAttribute(
          "font-family",
          toAttributeStyle(config.fontFamily),
        );
      }

      // tie to content type
      pageRevealer.setAttribute("resource", config.contentTypeID);

      // set key to track when user accessed
      const key = `mash-${config.id}-${pathname}`;
      pageRevealer.setAttribute("key", key);

      // inject onto site
      document.body.appendChild(pageRevealer);
    }
  });
}
