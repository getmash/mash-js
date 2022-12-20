import { BoostConfiguration, PageMatcher, PageTarget } from "../api/routes.js";

/**
 * Convert enums to web component attribute style.
 */
function toAttributeStyle(attribute: string): string {
  return attribute.replace(/_/g, "-");
}

/**
 * Determine if page matched.
 */
function pageMatched(pathname: string, matchers: PageMatcher[]): boolean {
  return false;
}

/**
 * Determine if page is selected to load boosts.
 */
export function pageSelected(
  pathname: string,
  target: PageTarget,
  matchers: PageMatcher[],
): boolean {
  if (target == PageTarget.All) {
    return true;
  } else if (target == PageTarget.Exclude) {
    return !pageMatched(pathname, matchers);
  } else if (target == PageTarget.Include) {
    return pageMatched(pathname, matchers);
  } else {
    // unhandled target case, default to true
    return true;
  }
}

/**
 * Inject floating boost buttons onto site.
 * @param pathname of the current location (e.g. /my/url) to filter configurations.
 */
export default function injectFloatingBoosts(
  boostConfigurations: BoostConfiguration[],
  pathname: string,
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
      // inject onto site
      document.body.appendChild(boost);
    }
  });
}
