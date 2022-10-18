module.exports = {
  extends: ["../../.eslintrc.js"],
  root: true,
  parserOptions: {
    project: "tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
};
