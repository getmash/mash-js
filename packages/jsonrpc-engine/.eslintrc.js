module.exports = {
  extends: ["../../conf/eslintrc.base.js"],
  root: true,
  parserOptions: {
    project: "tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
};
