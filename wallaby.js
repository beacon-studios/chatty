module.exports = function(wallaby) {
  return {
    files: [
      "src/**/*.ts",
      { pattern: "test/spec/**/*Helper.ts", instrument: false},
    ],
    tests: [
      "test/spec/**/*Spec.ts",
    ],
    compilers: {
      "**/*.ts": wallaby.compilers.typeScript(),
    },
    env: {
      type: 'node',
    },
    testFramework: 'jest'
  }
};
