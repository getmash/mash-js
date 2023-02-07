import { MatchType, PageMatcher, PageTarget } from "../api/routes.js";

const EXCLUDED_DOMAINS = [
  "wallet.getmash.com",
  "mash-widget-dev.web.app",
  "localhost:3001",
];

/**
 * Page matched if any matcher returns true.
 */
function pageMatched(pathname: string, matchers: PageMatcher[]): boolean {
  for (const matcher of matchers) {
    const equals =
      matcher.matchType == MatchType.Equals && pathname === matcher.matchText;
    const startsWith =
      matcher.matchType == MatchType.StartsWith &&
      pathname.startsWith(matcher.matchText);
    const contains =
      matcher.matchType == MatchType.Contains &&
      pathname.includes(matcher.matchText);

    if (equals || startsWith || contains) return true;
  }

  // defaults to false
  return false;
}

/**
 * Determine if page is selected
 */
export function pageSelected(
  hostname: string,
  pathname: string,
  target: PageTarget,
  matchers: PageMatcher[],
): boolean {
  if (EXCLUDED_DOMAINS.includes(hostname)) return false;

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
