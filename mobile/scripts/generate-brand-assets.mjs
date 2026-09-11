import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const mobileDirectory = resolve(scriptDirectory, '..');
const requireFromWebProject = createRequire(resolve(mobileDirectory, '..', 'package.json'));
const sharp = requireFromWebProject('sharp');

const fullIcon = await readFile(resolve(mobileDirectory, 'assets/brand/app-icon.svg'));
const mark = await readFile(resolve(mobileDirectory, 'assets/brand/app-mark.svg'));

await sharp(fullIcon).png().resize(1024, 1024).toFile(resolve(mobileDirectory, 'assets/images/htv-icon.png'));
await sharp(mark).png().resize(1024, 1024).toFile(resolve(mobileDirectory, 'assets/images/htv-mark.png'));
await sharp(fullIcon).png().resize(64, 64).toFile(resolve(mobileDirectory, 'assets/images/favicon.png'));

console.log('Home Tech Vault app icons generated.');
