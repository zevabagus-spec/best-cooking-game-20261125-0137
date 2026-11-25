// Warung Rush — the hand-in program (Node 22, standard library only).
//
// The game itself is the game/ folder beside this file: plain static files a desktop
// browser opens offline (game/index.html and its ES modules, no library, no network).
// This program hands the entry in: it copies game/ and screenshots/ into the output
// directory and writes dossier.json there with buildDossier from the vendored make.fun
// library, under the scorer's own caps, so the dossier the judge reads is exactly the
// one the gate rebuilds.
//
// Run it:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.)
// Play it: node serve.ts, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps are the scorer's (see the competition's gate): the dossier text is capped,
// screenshots are at most 4 files of at most 256 KiB, and game/ is at most 993 files,
// 48 MiB in all, with no path over 1,000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Warung Rush handed in: game/ and screenshots/ copied, dossier.json written under ${out}`);
