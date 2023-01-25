/**
 * Convert enums to web component attribute style.
 */
export default function toAttributeStyle(attribute: string): string {
  return attribute.replace(/_/g, "-");
}
