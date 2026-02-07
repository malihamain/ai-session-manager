/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: ["lib/**/*.ts", "components/**/*.tsx"],
  coveragePathIgnorePatterns: ["/node_modules/", "\\.test\\.(ts|tsx)$"],
};

module.exports = config;
