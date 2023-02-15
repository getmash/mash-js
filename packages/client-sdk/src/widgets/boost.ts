import { BoostConfiguration } from "../api/routes.js";
import { FloatLocation, WalletButtonLocation } from "../iframe/position.js";
import toAttributeStyle from "./attribute.js";
import { pageSelected } from "./pageMatcher.js";

/**
 * Inject floating boost buttons onto site.
 * @param pathname of the current location (e.g. /my/url) to filter configurations.
 * @param mashButtonLocation is used to ensure floating boost buttons do not overlap.
 */
export default function injectFloatingBoosts(
  boostConfigurations: BoostConfiguration[],
  pathname: string,
  mashButtonLocation: WalletButtonLocation,
) {
  boostConfigurations.forEach(config => {
    if (
      config.active &&
      pageSelected(pathname, config.pages.target, config.pages.matchers)
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

      // Taking advantage of the relatively limited number of float locations for the
      // Mash Button and Boost Buttons at the moment. If these become more configurable
      // might have to rethink this.
      //
      // If the same float side is used by a Boost and the Mash Button, shift the Boost vertically
      // by the same amount as the Mash Button.

      // desktop
      if (
        (mashButtonLocation.desktop.floatLocation ===
          FloatLocation.BottomLeft &&
          config.desktop.position === "bottom-left") ||
        (mashButtonLocation.desktop.floatLocation ===
          FloatLocation.BottomRight &&
          config.desktop.position === "bottom-right")
      ) {
        const yOffset = mashButtonLocation.desktop.bottom ?? 0;
        boost.setAttribute("y-offset", yOffset.toString());
      }

      // mobile
      if (
        (mashButtonLocation.mobile.floatLocation === FloatLocation.BottomLeft &&
          config.mobile.position === "bottom-left") ||
        (mashButtonLocation.mobile.floatLocation ===
          FloatLocation.BottomRight &&
          config.mobile.position === "bottom-right")
      ) {
        const yOffsetMobile = mashButtonLocation.mobile.bottom ?? 0;
        boost.setAttribute("y-offset-mobile", yOffsetMobile.toString());
      }

      // inject onto site
      document.body.appendChild(boost);
    }
  });
}
