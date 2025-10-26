export default {
  entry: ['src/app/**/*.{ts,tsx}', 'scripts/*.js'],
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['**/*.test.ts', '**/*.spec.ts'],
  ignoreDependencies: ['@types/*'],
  ignoreBinaries: ['next'],
  ignoreExportsUsedInFile: true,
  ignoreWorkspace: true
}
