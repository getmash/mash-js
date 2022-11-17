/**
 * Preconnect to given URL. https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preconnect
 * @param baseURL
 */
export default function preconnect(baseURL: string) {
  const link = window.document.createElement("link");
  link.rel = "preconnect";
  link.href = baseURL;
  window.document.head.appendChild(link);
}
