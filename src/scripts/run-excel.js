const { execSync } = require('child_process');

const args = process.argv.slice(2).join(' ');
execSync(`npx tsx src/scripts/excel-loader.ts ${args}`, { stdio: 'inherit' });
