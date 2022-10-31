/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    forceExit: true,
    testPathIgnorePatterns: ['.d.ts', '.js'],
    maxWorkers: 1, //runs tests one at a time due to port being used
}
