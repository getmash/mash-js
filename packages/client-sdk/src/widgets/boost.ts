import { BoostConfiguration } from "../api/routes.js";
import toAttributeStyle from "./attribute.js";
import { pageSelected } from "./pageMatcher.js";

/**
 * Inject floating boost buttons onto site.
 * @param pathname of the current location (e.g. /my/url) to filter configurations.
 */
export default function injectFloatingBoosts(
  boostConfigurations: BoostConfiguration[],
  hostname: string,
  pathname: string,
) {
  boostConfigurations.forEach(config => {
    if (
      config.active &&
      pageSelected(
        hostname,
        pathname,
        config.pages.target,
        config.pages.matchers,
      )
    ) {
      const boost = window.document.createElement("mash-boost-button");
      // these must be floating boosts
      boost.setAttribute("layout-mode", "float");
      // set attributes pulled from configuration
      boost.setAttribute("icon", toAttributeStyle(config.icon));
      boost.setAttribute("color-variant", toAttributeStyle(config.style));
      boost.setAttribute("display-mode", toAttributeStyle(config.desktop.mode));
      boost.setAttribute(
        "float-location",
        toAttributeStyle(config.desktop.position),
      );
      boost.setAttribute("size", toAttributeStyle(config.desktop.size));
      boost.setAttribute(
        "mobile-display-mode",
        toAttributeStyle(config.mobile.mode),
      );
      boost.setAttribute(
        "mobile-float-location",
        toAttributeStyle(config.mobile.position),
      );
      boost.setAttribute("mobile-size", toAttributeStyle(config.mobile.size));
      // inject onto site
      document.body.appendChild(boost);
    }
  });
}
