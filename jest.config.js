module.exports = {
  // Specify the test environment
  testEnvironment: 'jest-environment-jsdom',

  // Specify the test files to include
  testRegex: '\\.test\\.(js|jsx|ts|tsx)$',

  // Transform ESM syntax using Babel
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
