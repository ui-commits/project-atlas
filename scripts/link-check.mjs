#!/usr/bin/env node
/**
 * Dependency-free link validator for Project Atlas.
 *
 * Checks:
 *   1. Internal routes referenced by built HTML resolve to files inside dist/.
 *   2. External http(s) URLs respond successfully (redirects followed).
 *
 * Policy:
 *   - Every request is attempted up to ATTEMPTS times with backoff before
 *     classification, so one flaky response never fails CI on its own.
 *   - 404/410 after retries          -> confirmed broken; fails the run.
 *   - Persistent 429/5xx/timeouts/DNS -> transient warning; does not fail,
 *     because external hosting noise must not block merges. Set
 *     LINK_CHECK_STRICT=1 to promote transient warnings to failures.
 *
 * Usage:
 *   node scripts/link-check.mjs [dist-dir]      (default: dist)
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = process.argv[2] ?? 'dist';
const strict = process.env.LINK_CHECK_STRICT === '1';
const ATTEMPTS = 3;
const BACKOFF_MS = [2000, 4000];
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;

/** The site's own production origin is validated as an internal concern. */
const SELF_ORIGIN = 'https://project-atlas.vercel.app';

const USER_AGENT =
  'project-atlas-link-checker/1.0 (+https://github.com/ui-commits/project-atlas)';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function walkHtml(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkHtml(path)));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function* extractRefs(html) {
  const pattern = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) yield match[1];
}

/** True when a root-relative reference maps to a real file in dist/. */
async function resolvesInternally(ref) {
  let path = ref.split('#')[0].split('?')[0];
  if (path === '' || path === '/') path = '/index.html';
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw path if it is not valid percent-encoding */
  }
  const base = join(distDir, path.replace(/^\/+/, ''));
  const candidates = path.endsWith('/')
    ? [join(base, 'index.html')]
    : [base, `${base}.html`, join(base, 'index.html')];
  for (const candidate of candidates) {
    if (await isFile(candidate)) return true;
  }
  return false;
}

async function fetchOnce(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: '*/*' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // Free the socket without buffering the body.
  response.body?.cancel().catch(() => {});
  return response.status;
}

/**
 * Classify one external URL. Retries everything; only a final 404/410 is
 * "broken". Anything else that still fails is reported as transient.
 */
async function checkExternal(url) {
  let status = 0;
  let error = '';
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(BACKOFF_MS[Math.min(attempt - 1, BACKOFF_MS.length - 1)]);
    try {
      status = await fetchOnce(url);
      if (status >= 200 && status < 400) return { url, state: 'ok', detail: `HTTP ${status}` };
    } catch (cause) {
      status = 0;
      error = cause?.cause?.code ?? cause?.name ?? 'network error';
    }
  }
  if (status === 404 || status === 410) {
    return { url, state: 'broken', detail: `HTTP ${status}` };
  }
  return { url, state: 'transient', detail: status ? `HTTP ${status}` : error };
}

/** Bounded-concurrency map, preserving input order in the results. */
async function runPool(items, task) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker),
  );
  return results;
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

const htmlFiles = await walkHtml(distDir).catch(() => []);
if (htmlFiles.length === 0) {
  console.error(`link-check: no HTML files under "${distDir}" — build first`);
  process.exit(2);
}

const internalRefs = new Set();
const externalUrls = new Set();
let internalCount = 0;
let externalCount = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const ref of extractRefs(html)) {
    if (ref.startsWith('/')) {
      internalRefs.add(ref);
      internalCount += 1;
    } else if (/^https?:\/\//i.test(ref) && !ref.startsWith(SELF_ORIGIN)) {
      externalUrls.add(ref);
      externalCount += 1;
    }
    // mailto:, tel:, #fragments, and relative refs are intentionally skipped
  }
}

console.log(
  `link-check: ${htmlFiles.length} pages, ${internalCount} internal refs ` +
    `(${internalRefs.size} unique), ${externalCount} external refs ` +
    `(${externalUrls.size} unique)`,
);

/* Internal routes — deterministic, no retries needed. */
const internalBroken = [];
for (const ref of [...internalRefs].sort()) {
  if (!(await resolvesInternally(ref))) internalBroken.push(ref);
}

/* External URLs — retried HTTP checks. */
const externalResults = await runPool([...externalUrls].sort(), checkExternal);
const broken = externalResults.filter((r) => r.state === 'broken');
const transient = externalResults.filter((r) => r.state === 'transient');

/* Report */
for (const ref of internalBroken) {
  console.log(`::error::Internal route missing in dist/: ${ref}`);
}
for (const result of broken) {
  console.log(`::error::Confirmed broken link: ${result.url} (${result.detail})`);
}
for (const result of transient) {
  console.log(`::warning::Unreachable after retries (transient): ${result.url} (${result.detail})`);
}

console.log('\nlink-check summary');
console.log(`  internal refs : ${internalRefs.size} unique, ${internalBroken.length} missing`);
console.log(`  external urls : ${externalUrls.size} unique, ${broken.length} broken, ${transient.length} transient`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = [
    '| Scope | Unique | Broken | Transient |',
    '| --- | --- | --- | --- |',
    `| Internal routes | ${internalRefs.size} | ${internalBroken.length} | — |`,
    `| External URLs | ${externalUrls.size} | ${broken.length} | ${transient.length} |`,
  ].join('\n');
  const detail = [
    ...internalBroken.map((ref) => `- missing internal route: \`${ref}\``),
    ...broken.map((r) => `- broken: <${r.url}> (${r.detail})`),
    ...transient.map((r) => `- unreachable (transient): <${r.url}> (${r.detail})`),
  ].join('\n');
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `\n## Link validation\n\n${rows}\n${detail ? `\n${detail}\n` : ''}`,
  );
}

process.exitCode =
  broken.length + internalBroken.length > 0 || (strict && transient.length > 0)
    ? 1
    : 0;
