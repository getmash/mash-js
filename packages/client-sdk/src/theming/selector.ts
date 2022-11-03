function selector(
  element: string,
  part: string,
  state?: "active" | "hover" | "disabled",
) {
  if (state) return `${element}::part(${part}):${state}`;
  return `${element}::part(${part})`;
}

export default selector;
