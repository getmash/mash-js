const path = require("path");

const tsconfig = path.join(__dirname, "tsconfig.test.json");
const setupPostMessage = path.join(__dirname, "setupPostMessage.js");

function generate(config) {
  return Object.assign(
    {
      cache: true,
      cacheDirectory: ".cache/jest",
      /*
       * Automatically clear mock calls and instances before every test.
       * Equivalent to calling jest.clearAllMocks() before each test.
       * This does not remove any mock implementation that may have been provided.
       */
      clearMocks: true,
      collectCoverage: true,
      collectCoverageFrom: [ "**/*.{ts,tsx}" ],
      coverageDirectory: "coverage/",
      extensionsToTreatAsEsm: [".ts", ".tsx", ".mts"],
      moduleNameMapper: {
	// jest resolver needs help finding the ts files from js extensions in imports
	'^(\\.{1,2}/.*)\\.js$': '$1',
	// there is a bug in jest and it can't handle the exports in this library
	'^uuid$': require.resolve('uuid'),
      },
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          { useESM: true, tsconfig, diagnostics: false },
        ],
      },
      setupFiles: [setupPostMessage],
    },
    config,
  );
}

module.exports = generate
