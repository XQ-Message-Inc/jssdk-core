module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/__tests__/utils/setupFiles.ts"],
  testPathIgnorePatterns: ["<rootDir>/__tests__/utils/setupFiles.ts"],
  resetMocks: false,
};
