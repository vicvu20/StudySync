import fs from 'node:fs';
import path from 'node:path';

const packagePath = path.resolve('frontend/package.json');

if (!fs.existsSync(packagePath)) {
  console.error('Could not find frontend/package.json.');
  console.error('Run this script from the StudySync repository root.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  test: 'vitest',
  'test:run': 'vitest run',
  'test:ui': 'vitest --ui'
};

packageJson.devDependencies = {
  ...packageJson.devDependencies,
  '@testing-library/jest-dom': '^6.6.3',
  '@testing-library/react': '^16.1.0',
  '@testing-library/user-event': '^14.5.2',
  '@vitest/ui': '^2.1.8',
  jsdom: '^25.0.1',
  vitest: '^2.1.8'
};

fs.writeFileSync(
  packagePath,
  `${JSON.stringify(packageJson, null, 2)}\n`
);

console.log('Updated frontend/package.json with Vitest and Testing Library.');
console.log('Next run: npm install');
console.log('Then run: npm run test:run --workspace frontend');
