import { BoostConfiguration } from "../api/routes.js";

/**
 * Convert enums to web component attribute style.
 */
function toAttributeStyle(attribute: string): string {
  return attribute.replace(/_/g, "-");
}

/**
 * Inject floating boost buttons onto site.
 */
export default function injectFloatingBoosts(
  boostConfigurations: BoostConfiguration[],
) {
  boostConfigurations.forEach(config => {
    if (config.active) {
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
