export type CSSProperties = Record<string, string | number>;

export type StyleRule = {
  selectors: string[];
  properties: CSSProperties;
};

function toString(sheet: StyleRule[]): string {
  return sheet
    .reduce<string[]>((list, rule) => {
      const selectors = rule.selectors.join(", ");

      const properties = Object.keys(rule.properties).reduce<string[]>(
        (group, key) => {
          group.push(`${key}: ${rule.properties[key]};`);
          return group;
        },
        [],
      );

      list.push(`
${selectors} {
  ${properties.join("\n  ")}
}`);

      return list;
    }, [])
    .join("");
}

export default {
  toString,
};
