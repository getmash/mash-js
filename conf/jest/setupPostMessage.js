function setupPostMessageWorkaround() {
  // Note: since we rely on evt.source when listening for events, we need to override the
  // jsdom postMessage implementation, as it currently doesn't set evt.source like is done
  // in the browser. Otherwise, evt.source is null, and PostMessageEngine listeners will
  // ignore the event.
  // See here: https://github.com/jsdom/jsdom/issues/2745#issuecomment-877237352
  // And here: https://github.com/jsdom/jsdom/blob/b1c0072e306e4e9ad83a5e1ddf0e356ba044bd25/lib/jsdom/living/post-message.js#L31
  //
  // Note 2: I attempted to make this a function that can be called as an opt-in for those
  // tests that want it, but TS + Jest was causing a tonne of headaches and interfering
  // with building the actual code to deploy. So, for now, it applies it for all tests...
  const stubFn = message =>
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window,
        origin: window.location.origin,
        data: message,
      }),
    );

  jest.spyOn(window, "postMessage").mockImplementation(stubFn);
}

setupPostMessageWorkaround();
