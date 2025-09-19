import * as fs from 'fs';
import * as path from 'path';
import { tokens } from '../app/styles/tokens';

const SAFE_LITERALS = new Set([
  '0',
  'none',
  '1px',
  'solid',
  'transparent',
  'display: inline-flex',
  'inline-flex',
  'center',
  'display',
  'flex',
]);

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
function extractVarsUsedInScss(css: string): Set<string> {
  const found = new Set<string>();
  for (const m of css.matchAll(/var\(\s*--([a-z0-9-]+)\s*(?:,[^)]+)?\)/gi)) {
    found.add(m[1].toLowerCase());
  }
  return found;
}

function extractCssDeclarations(css: string): Map<string, Set<string>> {
  const decls = new Map<string, Set<string>>();
  for (const block of css.matchAll(/\{([\s\S]*?)\}/g)) {
    for (const decl of block[1].matchAll(/([a-z-]+)\s*:\s*([^;]+);/gi)) {
      const prop = decl[1].toLowerCase();
      const val = decl[2].trim();
      if (!decls.has(prop)) decls.set(prop, new Set());
      decls.get(prop)!.add(val);
    }
  }
  return decls;
}

function assertCssValuesFromTokens(
  css: string,
  tokenMap: Map<string, string>,
  file: string
) {
  const decls = extractCssDeclarations(css);
  const tokenValues = new Set(
    [...tokenMap.values()].map((v) => normalizeColor(stripQuotes(v)))
  );

  for (const [prop, values] of decls.entries()) {
    for (const val of values) {
      const normalized = normalizeColor(stripQuotes(val));
      const isTokenRef = /var\(--[a-z0-9-]+\)/i.test(val);
      const isCalcToken = /calc\([^)]*var\(--[a-z0-9-]+\)[^)]*\)/i.test(val);

      if (
        !isTokenRef &&
        !isCalcToken &&
        !tokenValues.has(normalized) &&
        !SAFE_LITERALS.has(normalized)
      ) {
        throw new Error(
          `File ${file} uses hardcoded value "${val}" for "${prop}" not found in tokens.ts`
        );
      }
    }
  }
}

export function assertAllScssUsagesMatchTokens(opts?: {
  scssPaths?: string | string[];
}) {
  const candidates = new Set<string>(); // ✅ Declare here at the top

  const add = (p: string) => {
    const r = path.resolve(p);
    if (fs.existsSync(r)) candidates.add(r);
  };

  if (opts?.scssPaths) {
    (Array.isArray(opts.scssPaths) ? opts.scssPaths : [opts.scssPaths]).forEach(
      add
    );
  } else {
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (entry.endsWith('.scss')) {
          candidates.add(full);
        }
      }
    }
    walk(path.resolve('src'));
  }

  const tokenMap = flattenTokensToExpectedMap(tokens);
  const expected = new Set(tokenMap.keys());

  for (const file of candidates) {
    const css = fs.readFileSync(file, 'utf8');
    const used = extractVarsUsedInScss(css);

    for (const v of used) {
      if (!expected.has(v)) {
        throw new Error(
          `File ${file} uses unknown CSS variable --${v} (not in tokens.ts)`
        );
      }
    }

    assertCssValuesFromTokens(css, tokenMap, file);
  }
}

/* for single component */

export function assertScssComponentMatchesTokens(filePath: string) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`SCSS file not found: ${resolvedPath}`);
  }

  const css = fs.readFileSync(resolvedPath, 'utf8');
  const tokenMap = flattenTokensToExpectedMap(tokens);
  const expectedVars = new Set(tokenMap.keys());

  const usedVars = extractVarsUsedInScss(css);
  for (const v of usedVars) {
    if (!expectedVars.has(v)) {
      throw new Error(
        `File ${filePath} uses unknown CSS variable --${v} (not in tokens.ts)`
      );
    }
  }

  assertCssValuesFromTokens(css, tokenMap, filePath);
}
