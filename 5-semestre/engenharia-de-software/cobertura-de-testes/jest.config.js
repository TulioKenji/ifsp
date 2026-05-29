const { createDefaultPreset } = require("ts-jest");
// import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,

  },
  rootDir: "./src",
  // collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/dist/**",
  ],
  coverageDirectory: "../coverage",
  coverageReporters: ["text", "lcov", "html"],
};