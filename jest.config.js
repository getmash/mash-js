const path = require("path");

const tsconfig = path.join(__dirname, "tsconfig.test.json");

function project(pkg, config) {
  return Object.assign(
    {
      cache: true,
      cacheDirectory: "<rootDir>/.cache/jest",
      /*
       * Automatically clear mock calls and instances before every test.
       * Equivalent to calling jest.clearAllMocks() before each test.
       * This does not remove any mock implementation that may have been provided.
       */
      clearMocks: true,
      displayName: pkg,
      extensionsToTreatAsEsm: [".ts", ".tsx", ".mts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          { useESM: true, tsconfig, diagnostics: false },
        ],
      },
      setupFiles: ["<rootDir>/.jest/setupPostMessage.js"],
      testMatch: [`<rootDir>/packages/${pkg}/**/?(*.)+(test).[t]s?(x)`],
    },
    config,
  );
}

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/**/*.{ts,tsx}",
    "!packages/**/*.test.*",
    "!packages/**/src/index.ts",
    "!packages/**/dist/**",
  ],
  coverageDirectory: "coverage/",
  projects: [
    project("post-message", { testEnvironment: "jsdom" }),
    project("jsonrpc-engine", {
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@getmash/post-message": "<rootDir>/packages/post-message/src",
      },
    }),
    project("client-sdk", {
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@getmash/post-message": "<rootDir>/packages/post-message/src",
        "@getmash/jsonrpc-engine": "<rootDir>/packages/jsonrpc-engine/src",
      },
    }),
  ],
  testTimeout: 2000,
};
