module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "coverage",
    "*.config.js",
    ".eslintrc.js",
  ],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "tsconfig.json",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc" },
        // need to define internal, group local files
        groups: [
          "builtin",
          "external",
          "internal",
          ["index", "sibling", "parent"],
          "type",
        ],
        "newlines-between": "always",
        // our internal paths look like external, need to override default which ignores external looking things
        pathGroupsExcludedImportTypes: ["builtin"],
        pathGroups: [
          {
            // treat path imports as internal
            pattern: "@getmash/**",
            group: "internal",
          },
        ],
      },
    ],
    "@typescript-eslint/ban-ts-comment": "off",
  },
  settings: {
    // import settings along with eslint-import-resolver-typescript allow js imports to be mapped back to ts files
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
	"project": ["tsconfig.json"]
      },
    }
  },
};
