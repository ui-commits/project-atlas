#!/usr/bin/env node
/**
 * Staleness report for Project Atlas content records.
 *
 * Reads every record in src/content/projects/, compares `lastVerified`
 * against the record's review cadence (monthly=30, quarterly=91,
 * yearly=365 days; default quarterly), and reports entries overdue for
 * human verification.
 *
 * This is a report, not a gate: it never fails on stale records. In
 * GitHub Actions each overdue record emits a ::warning:: annotation and
 * the run summary lists them, so staleness is visible without turning
 * scheduled maintenance red.
 *
 * Usage:
 *   node scripts/stale-report.mjs [projects-dir]   (default: src/content/projects)
 *   STALE_FAIL=1 promotes overdue entries to a non-zero exit code.
 */

import { readdir, readFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectsDir = process.argv[2] ?? 'src/content/projects';
const failOnStale = process.env.STALE_FAIL === '1';
const CADENCE_DAYS = { monthly: 30, quarterly: 91, yearly: 365 };
const DEFAULT_CADENCE = 'quarterly';

/* ------------------------------------------------------------------ */
/*  Minimal frontmatter field extraction (scalar keys only)            */
/* ------------------------------------------------------------------ */

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  return match ? match[1] : '';
}

/** First scalar value for `key:` — quoted or bare, single line. */
function scalar(frontmatter, key) {
  const pattern = new RegExp(`^${key}:\\s*"?([^"\\n\\r]*)"?.*$`, 'm');
  const match = pattern.exec(frontmatter);
  return match ? match[1].trim() : undefined;
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

const files = (await readdir(projectsDir)).filter((name) => name.endsWith('.md'));
if (files.length === 0) {
  console.error(`stale-report: no records found under "${projectsDir}"`);
  process.exit(2);
}

const today = new Date();
const records = [];

for (const file of files) {
  const text = await readFile(join(projectsDir, file), 'utf8');
  const fm = parseFrontmatter(text);
  const verified = scalar(fm, 'lastVerified');
  if (!verified) {
    // The Zod schema makes this impossible at build time; guard anyway.
    console.error(`stale-report: ${file} has no lastVerified date`);
    continue;
  }
  const days = Math.floor((today - new Date(verified)) / 86_400_000);
  const cadence = scalar(fm, 'reviewCadence') ?? DEFAULT_CADENCE;
  const budget = CADENCE_DAYS[cadence] ?? CADENCE_DAYS[DEFAULT_CADENCE];
  records.push({
    slug: file.replace(/\.md$/, ''),
    registryId: scalar(fm, 'registryId') ?? '?',
    title: scalar(fm, 'title') ?? '?',
    status: scalar(fm, 'status') ?? '?',
    liveUrl: scalar(fm, 'liveUrl'),
    cadence,
    budget,
    days,
    overBy: days - budget,
  });
}

records.sort((a, b) => b.days - a.days);

const overdue = records.filter((r) => r.overBy > 0);

console.log(
  `stale-report: ${records.length} records as of ${today.toISOString().slice(0, 10)} ` +
    `(default cadence: ${DEFAULT_CADENCE})`,
);

if (records.length > 0) {
  console.log('\nMost recently verified:');
  for (const r of records.slice(0, 5)) {
    console.log(`  ${r.registryId}  ${r.slug.padEnd(32)} ${String(r.days).padStart(4)}d old (${r.cadence})`);
  }
}

if (overdue.length === 0) {
  console.log('\nNo records are overdue for verification.');
} else {
  console.log(`\nOverdue for verification (${overdue.length}):`);
  for (const r of overdue) {
    console.log(
      `::warning::${r.registryId} "${r.title}" is ${r.overBy} day(s) overdue ` +
        `(${r.days}d since lastVerified, ${r.cadence} cadence)` +
        (r.liveUrl ? ` — verify ${r.liveUrl}` : ''),
    );
  }
  console.log(
    '\nProcess: open each record, confirm its links and copy still hold, then bump ' +
      '`lastVerified` to today. Use the "Project record update" issue template for anything broken.',
  );
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = [
    '| ID | Slug | Status | Cadence | Age | State |',
    '| --- | --- | --- | --- | --- | --- |',
    ...records.map(
      (r) =>
        `| ${r.registryId} | \`${r.slug}\` | ${r.status} | ${r.cadence} | ${r.days}d | ` +
        (r.overBy > 0 ? `**overdue by ${r.overBy}d**` : 'ok') +
        (r.liveUrl ? ` · [live](${r.liveUrl})` : '') +
        ' |',
    ),
  ];
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `\n## Content staleness\n\n${rows.join('\n')}\n`,
  );
}

process.exitCode = failOnStale && overdue.length > 0 ? 1 : 0;
