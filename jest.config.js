// https://jestjs.io/docs/en/configuration
module.exports = {
  rootDir: "./",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  passWithNoTests: true,

  displayName: {
    name: "Unit Tests",
    color: "blueBright",
  },

  transform: {
    "^.+\\.ts?$": "ts-jest",
  },

  resetMocks: true,

  collectCoverageFrom: ["src/**"],
  coveragePathIgnorePatterns: [],
  coverageDirectory: "../build/tests-coverage",
  collectCoverage: process.env.CI !== undefined,
};
