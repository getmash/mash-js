import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MatchType, PageTarget } from "../api/routes.js";
import { pageSelected } from "./boost.js";

describe("boosts", () => {
  it("page selected target all is always true", () => {
    assert.ok(pageSelected("/test/path", PageTarget.All, []));
  });

  it("page selected target include is match", () => {
    assert.ok(
      pageSelected("/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/test/path",
        },
      ]),
    );

    assert.ok(
      !pageSelected("/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/path/path",
        },
      ]),
    );

    assert.ok(
      pageSelected("/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/test",
        },
      ]),
    );

    assert.ok(
      !pageSelected("/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/path",
        },
      ]),
    );

    assert.ok(
      pageSelected("/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "test",
        },
      ]),
    );

    assert.ok(
      !pageSelected("/test/path", PageTarget.Include, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "not",
        },
      ]),
    );
  });

  it("page selected target exclude is match inverse", () => {
    assert.ok(
      !pageSelected("/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/test/path",
        },
      ]),
    );

    assert.ok(
      pageSelected("/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Equals,
          matchText: "/path/path",
        },
      ]),
    );

    assert.ok(
      !pageSelected("/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/test",
        },
      ]),
    );

    assert.ok(
      pageSelected("/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.StartsWith,
          matchText: "/path",
        },
      ]),
    );

    assert.ok(
      !pageSelected("/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "test",
        },
      ]),
    );

    assert.ok(
      pageSelected("/test/path", PageTarget.Exclude, [
        {
          id: "1",
          matchType: MatchType.Contains,
          matchText: "not",
        },
      ]),
    );
  });
});
