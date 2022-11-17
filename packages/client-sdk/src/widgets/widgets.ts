type Widget = {
  path: string;
  element: string;
};

const Widgets: Record<string, Widget> = {
  Accordion: { path: "accordion/accordion.js", element: "mash-accordion" },
  Boost: { path: "boost/boost.js", element: "mash-boost" },
  ButtonRevealer: {
    path: "content/button-revealer.js",
    element: "mash-button-revealer",
  },
  ContentRevealer: {
    path: "content/content-revealer.js",
    element: "mash-content-revealer",
  },
  DonateButton: {
    path: "donate/donate-button.js",
    element: "masn-donate-button",
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
    script.src = `${baseURL}${value.path}`;
    return script;
  });
  window.document.head.append(...scripts);
}

/**
 * Check if a known Mash Widget exists on the page
 * @returns boolean
 */
export function isWidgetOnPage() {
  const widgets = Object.values(Widgets);
  for (let i = 0; i < widgets.length; i++) {
    const el = window.document.querySelector(widgets[i].element);
    if (el) return true;
  }
  return false;
}
