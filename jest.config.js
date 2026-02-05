module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/__tests__/utils/setupFiles.ts"],
  testPathIgnorePatterns: ["<rootDir>/__tests__/utils/setupFiles.ts"],
  resetMocks: false,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/",
  ],
};
