type Widget = {
  path: string;
  element: string;
};

export const DeprecatedWidgets = [
  "mash-text-reveal",
  "mash-download-btn",
  "mash-paywall",
  "mash-youtube-player",
  "mash-donate-btn",
];

export const Widgets: Record<string, Widget> = {
  Accordion: { path: "accordion/accordion.js", element: "mash-accordion" },
  Boost: { path: "boost/boost.js", element: "mash-boost-button" },
  ButtonRevealer: {
    path: "content/button-revealer.js",
    element: "mash-button-revealer",
  },
  ContentRevealer: {
    path: "content/content-revealer.js",
    element: "mash-content-revealer",
  },
  ContentPageRevealer: {
    path: "content/page-revealer.js",
    element: "mash-page-revealer",
  },
  DonateButton: {
    path: "donate/donate-button.js",
    element: "mash-donate-button",
  },
  DownloadButton: {
    path: "download/download-button.js",
    element: "mash-download-button",
  },
  Link: { path: "link/link.js", element: "mash-link" },
  VideoPlayer: { path: "media/video-player.js", element: "mash-video-player" },
};

/**
 * Inject widgets into the page
 * @param baseURL Base URL of endpoint where widgets are hosted
 */
export function injectWidgets(baseURL: string) {
  const scripts = Object.values(Widgets).map(value => {
    const script = window.document.createElement("script");
    script.async = true;
    script.src = `${baseURL}/${value.path}`;
    return script;
  });
  window.document.head.append(...scripts);
}
