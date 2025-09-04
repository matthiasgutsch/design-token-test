import * as fs from 'fs';
import * as path from 'path';
import { tokens } from '../app/styles/tokens';

type AnyObj = Record<string, unknown>;
const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
const singularize = (s: string) => (s.endsWith('s') ? s.slice(0, -1) : s);
const isPlain = (v: unknown) =>
  !!v && typeof v === 'object' && !Array.isArray(v);

const ALIASES: Record<string, string> = {
  gridUnit: 'grid-unit',
  'typography.fontFamily': 'font-family-base',
  'typography.fontSizeBase': 'font-size-base',
};

function cssVarName(pathSegs: string[]): string {
  const key = pathSegs.join('.');
  if (ALIASES[key]) return ALIASES[key];
  if (pathSegs.length === 1) return kebab(pathSegs[0]);
  const [group, ...rest] = pathSegs;
  const prefix = singularize(group);
  return [prefix, ...rest.map(kebab)].join('-');
}

function flattenTokensToExpectedMap(
  obj: AnyObj,
  prefix: string[] = [],
  out = new Map<string, string>()
) {
  for (const [k, v] of Object.entries(obj)) {
    const next = [...prefix, k];
    if (isPlain(v)) {
      flattenTokensToExpectedMap(v as AnyObj, next, out);
    } else {
      const name = cssVarName(next); // e.g. font-size-base
      const val =
        typeof v === 'number' || typeof v === 'boolean'
          ? String(v)
          : (v as string);
      out.set(name, val);
    }
  }
  return out;
}

function extractRootVarsFrom(css: string) {
  const map = new Map<string, string>();
  for (const block of css.matchAll(/:root\s*\{([\s\S]*?)\}/g)) {
    for (const decl of block[1].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      map.set(decl[1].toLowerCase(), decl[2].trim());
    }
  }
  return map;
}

function normalizeColor(x: string) {
  let v = x.trim().toLowerCase();
  if (!v.startsWith('#')) return v;
  if (v.length === 4)
    v =
      '#' +
      v
        .slice(1)
        .split('')
        .map((ch) => ch + ch)
        .join('');
  return v;
}
const stripQuotes = (s: string) => {
  const t = s.trim();
  return (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
    ? t.slice(1, -1)
    : t;
};

export function assertAllRootTokensMatchTokensFile(opts?: {
  cssPaths?: string | string[]; // default looks for src/styles.scss
  failOnExtraVars?: boolean; // default false
}) {
  // locate styles file(s)
  const candidates = new Set<string>();
  const add = (p: string) => {
    const r = path.resolve(p);
    if (fs.existsSync(r)) candidates.add(r);
  };

  if (opts?.cssPaths) {
    (Array.isArray(opts.cssPaths) ? opts.cssPaths : [opts.cssPaths]).forEach(
      add
    );
  } else {
    add('src/styles.scss');
  }

  const files = [...candidates];
  if (files.length === 0)
    throw new Error('No styles file found to validate (:root).');

  // read and parse
  const css = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const rootVars = extractRootVarsFrom(css); // name -> value
  const expected = flattenTokensToExpectedMap(tokens); // name -> expected value

  // verify all expected are present and equal
  for (const [name, wantRaw] of expected.entries()) {
    const gotRaw = rootVars.get(name);
    if (gotRaw === undefined) throw new Error(`:root is missing --${name}`);

    let want = String(wantRaw).trim();
    let got = String(gotRaw).trim();

    // normalize special cases
    if (name.startsWith('color-')) {
      want = normalizeColor(want);
      got = normalizeColor(got);
    } else if (name === 'font-family-base') {
      want = stripQuotes(want).toLowerCase();
      got = stripQuotes(got).toLowerCase();
    }

    if (got !== want) {
      throw new Error(
        `Mismatch for --${name}. Expected "${want}", got "${got}".`
      );
    }
  }

  // optionally fail on extras
  if (opts?.failOnExtraVars) {
    const allowed = new Set(expected.keys());
    const extras = [...rootVars.keys()].filter((n) => !allowed.has(n));
    if (extras.length) {
      throw new Error(`Unknown variables in :root: ${extras.join(', ')}`);
    }
  }
}
