import { PageRevealer } from "../api/routes.js";
import { pageSelected } from "./pageMatcher.js";

/**
 * Inject page revealer widgets onto site.
 * @param pathname of the current location (e.g. /my/url) to filter configurations.
 */
export default function injectPageRevealers(
  pageRevealers: PageRevealer[],
  pathname: string,
) {
  pageRevealers.forEach(pageRevealer => {
    if (
      pageRevealer.active &&
      pageSelected(
        pathname,
        pageRevealer.pages.target,
        pageRevealer.pages.matchers,
      )
    ) {
      const boost = window.document.createElement("mash-page-revealer");
      // inject onto site
      document.body.appendChild(boost);
    }
  });
}
