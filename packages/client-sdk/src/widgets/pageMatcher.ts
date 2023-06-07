import { MatchType, PageMatcher, PageTarget } from "../api/routes.js";

/**
 * Ensure the match text begins with a slash for easy comparison to the pathname.
 */
function standardizeMatchText(matchText: string): string {
  return matchText.startsWith("/") ? matchText : "/" + matchText;
}

/**
 * Page matched if any matcher returns true.
 */
function pageMatched(pathname: string, matchers: PageMatcher[]): boolean {
  for (const matcher of matchers) {
    const equals =
      matcher.matchType == MatchType.Equals &&
      pathname === standardizeMatchText(matcher.matchText);
    const startsWith =
      matcher.matchType == MatchType.StartsWith &&
      pathname.startsWith(standardizeMatchText(matcher.matchText));
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
