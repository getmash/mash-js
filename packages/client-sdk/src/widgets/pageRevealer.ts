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
      pageRevealer.setAttribute(
        "template-image",
        toAttributeStyle(config.templateImage),
      );
      pageRevealer.setAttribute(
        "template-image-color",
        config.templateImageColor,
      );
      pageRevealer.setAttribute("logo", config.logoEnabled.toString());
      pageRevealer.setAttribute("logo-src", config.logoURL);
      pageRevealer.setAttribute(
        "text-align",
        toAttributeStyle(config.textAlignment),
      );
      pageRevealer.setAttribute("title", config.title);
      pageRevealer.setAttribute("message", config.message);
      // lit should handle parsing the array on the other side
      pageRevealer.setAttribute("bullets", JSON.stringify(config.bullets));
      pageRevealer.setAttribute("button-color", config.buttonColor);
      pageRevealer.setAttribute(
        "font-family",
        toAttributeStyle(config.fontFamily),
      );

      // tie to content type
      pageRevealer.setAttribute("resource", config.contentTypeID);

      // inject onto site
      document.body.appendChild(pageRevealer);
    }
  });
}
