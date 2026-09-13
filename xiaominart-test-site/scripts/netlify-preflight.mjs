import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'package.json',
  'package-lock.json',
  'server.mjs',
  'database/schema.sql',
  'database/demo-data.json',
  'README.md',
  '验收报告.md',
  '版本清单.md',
  'reverification-evidence-4347/_summary-4347.json'
];
const missing = required.filter(file => !existsSync(path.join(root, file)));
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const blockers = [
  'Current runtime is a long-lived Node HTTP server, not an Astro build output.',
  'Current persistence uses local SQLite, which is not a production Netlify data service.',
  'Netlify production site, repository binding, environment variables, and domain ownership are not configured.',
  'Real payment, production business policy, real assets, and DNS cutover remain unapproved.'
];
if (!missing.length) {
  console.log(`xiaominART Netlify preparation check: ${packageJson.version}`);
  console.log('Required handoff files: present');
}
for (const blocker of blockers) console.log(`BLOCKED: ${blocker}`);
if (missing.length) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exitCode = 1;
} else if (process.env.NETLIFY_PREP_ONLY === 'true') {
  console.error('Deployment intentionally stopped: preparation-only mode.');
  process.exitCode = 2;
}
