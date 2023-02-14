import assert from "node:assert/strict";
import { beforeEach, test, mock } from "node:test";

import Mash from "./Mash.js";
import { MashEvent } from "./events.js";
import { createDOM } from "./tests/dom.js";

// Note: using test instead of describe/it so that we can await the result of the subtests
// https://nodejs.org/api/test.html#testname-options-fn
test("Mash", async t => {
  beforeEach(() => {
    createDOM();
  });

  // Tests that mounting is initiated immediately when not autohiding
  await t.test("initializes immediately when not autohiding", async () => {
    const mash = new Mash({
      earnerID: "abc123",
    });

    const mount = mock.method(mash, "mount", async () => null);

    await mash.init();
    assert.equal(mount.mock.callCount(), 1);
  });

  // Tests that mounting is initiated only on receiving an event when autohiding
  await t.test(
    "initializes after widgets connect when autohiding",
    async () => {
      const mash = new Mash({
        earnerID: "abc123",
        autoHide: true,
      });

      const mount = mock.method(mash, "mount", async () => null);

      const initialized = mash.init();
      assert.equal(mount.mock.callCount(), 0);
      // Make sure multiple events don't cause issues
      for (let i = 0; i < 3; i++) {
        window.dispatchEvent(
          new window.CustomEvent(MashEvent.WebComponentConnected),
        );
      }
      await initialized;
      assert.equal(mount.mock.callCount(), 1);
    },
  );
});
