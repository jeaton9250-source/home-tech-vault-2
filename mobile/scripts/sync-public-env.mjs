import { chmod, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const mobileDirectory = resolve(scriptDirectory, '..');
const webEnvironmentPath = resolve(mobileDirectory, '..', '.env.local');
const mobileEnvironmentPath = resolve(mobileDirectory, '.env.local');

function parseEnvironment(source) {
  const result = new Map();
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    result.set(name, value);
  }
  return result;
}

const source = parseEnvironment(await readFile(webEnvironmentPath, 'utf8'));
const supabaseUrl = source.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = source.get('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('The web .env.local file is missing the public Supabase URL or anon/publishable key.');
}

const output = [
  '# Generated from the web app public values by npm run setup.',
  '# This file is ignored by Git. Never add the service-role key here.',
  `EXPO_PUBLIC_SUPABASE_URL=${JSON.stringify(supabaseUrl)}`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${JSON.stringify(supabaseKey)}`,
  `EXPO_PUBLIC_WEB_URL=${JSON.stringify(source.get('NEXT_PUBLIC_SITE_URL') || 'https://www.hometechvault.com')}`,
  '',
].join('\n');

await writeFile(mobileEnvironmentPath, output, { encoding: 'utf8', mode: 0o600 });
await chmod(mobileEnvironmentPath, 0o600);
console.log('Mobile public environment is ready.');
