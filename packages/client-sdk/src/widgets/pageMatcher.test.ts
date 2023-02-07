import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MatchType, PageTarget } from "../api/routes.js";
import { pageSelected } from "./pageMatcher.js";

describe("boosts", () => {
  it("excluded domain, page selected should be false", () => {
    assert.ok(
      !pageSelected("wallet.getmash.com", "/test/path", PageTarget.All, []),
    );
    assert.ok(
      !pageSelected(
        "mash-widget-dev.web.app",
        "/test/path",
        PageTarget.All,
        [],
      ),
    );
    assert.ok(
      !pageSelected("localhost:3001", "/test/path", PageTarget.All, []),
    );
  });

  it("page selected target all is always true", () => {
    assert.ok(pageSelected("test.com", "/test/path", PageTarget.All, []));
  });

  it("page selected target include is match", () => {
    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/test/path",
        },
      ]),
    );

    assert.ok(
      !pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/path/path",
        },
      ]),
    );

    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/test",
        },
      ]),
    );

    assert.ok(
      !pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/path",
        },
      ]),
    );

    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "test",
        },
      ]),
    );

    assert.ok(
      !pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "not",
        },
      ]),
    );
  });

  it("page selected target include is match with multiple matchers", () => {
    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "nope",
        },
        {
          id: "2",
          matchType: MatchType.Contains,
          matchText: "test",
        },
      ]),
    );
  });

  it("page selected target exclude is match inverse", () => {
    assert.ok(
      !pageSelected("test.com", "/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/test/path",
        },
      ]),
    );

    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/path/path",
        },
      ]),
    );

    assert.ok(
      !pageSelected("test.com", "/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/test",
        },
      ]),
    );

    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/path",
        },
      ]),
    );

    assert.ok(
      !pageSelected("test.com", "/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "test",
        },
      ]),
    );

    assert.ok(
      pageSelected("test.com", "/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "not",
        },
      ]),
    );
  });
});
