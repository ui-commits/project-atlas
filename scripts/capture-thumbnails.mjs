/**
 * Capture local 16:10 WebP thumbnails for Project Atlas records.
 *
 * Usage:
 *   npm run capture:thumbnails
 *   npm run capture:thumbnails -- --force
 *   npm run capture:thumbnails -- --slug agentos
 *
 * Only records with a confirmed liveUrl are captured. A frontmatter thumbnail
 * block is added only after the image has been written successfully.
 */

import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const root = process.cwd();
const contentDir = path.join(root, 'src', 'content', 'projects');
const outputDir = path.join(root, 'public', 'images', 'projects');
const width = 1600;
const height = 1000;
const force = process.argv.includes('--force');
const slugIndex = process.argv.indexOf('--slug');
const onlySlug = slugIndex >= 0 ? process.argv[slugIndex + 1] : undefined;

if (slugIndex >= 0 && !onlySlug) throw new Error('Expected a value after --slug.');

function frontmatterOf(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`No YAML frontmatter found in ${filePath}`);
  return { block: match[1], start: match.index, end: match.index + match[0].length };
}

function quotedValue(block, field) {
  const match = block.match(new RegExp(`^${field}:\\s*["'](.+?)["']\\s*$`, 'm'));
  return match?.[1];
}

function hasThumbnail(block) {
  return /^thumbnail:\s*$/m.test(block);
}

function addThumbnail(source, frontmatter, slug, title) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const thumbnail = [
    'thumbnail:',
    `  src: "/images/projects/${slug}.webp"`,
    `  alt: "Screenshot of ${title.replaceAll('"', "'")}"`,
    `  width: ${width}`,
    `  height: ${height}`,
  ].join(newline);
  const updatedBlock = `${frontmatter.block}${newline}${thumbnail}`;
  return `${source.slice(0, frontmatter.start)}---${newline}${updatedBlock}${newline}---${source.slice(frontmatter.end)}`;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

await mkdir(outputDir, { recursive: true });

const filenames = (await readdir(contentDir)).filter((filename) => filename.endsWith('.md')).sort();
const records = [];

for (const filename of filenames) {
  const filePath = path.join(contentDir, filename);
  const source = await readFile(filePath, 'utf8');
  const frontmatter = frontmatterOf(source, filePath);
  const liveUrl = quotedValue(frontmatter.block, 'liveUrl');
  const title = quotedValue(frontmatter.block, 'title') ?? path.basename(filename, '.md');
  const slug = path.basename(filename, '.md');

  if (!liveUrl || (onlySlug && slug !== onlySlug)) continue;
  records.push({ filePath, source, frontmatter, liveUrl, title, slug });
}

if (onlySlug && records.length === 0) throw new Error(`No live project record found for slug "${onlySlug}".`);

console.log(`Preparing ${records.length} thumbnail capture${records.length === 1 ? '' : 's'} at ${width}x${height}.`);

const browser = await chromium.launch();
const report = { captured: [], skipped: [], failed: [] };

try {
  for (const record of records) {
    const outputPath = path.join(outputDir, `${record.slug}.webp`);
    const imageExists = await fileExists(outputPath);

    if (imageExists && !force) {
      report.skipped.push(record.slug);
      console.log(`SKIP  ${record.slug} (image exists; use --force to refresh)`);
      continue;
    }

    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    try {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(record.liveUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForTimeout(1_500);
      await page.screenshot({ path: outputPath, type: 'webp', quality: 82, animations: 'disabled', caret: 'hide' });

      if (!hasThumbnail(record.frontmatter.block)) {
        await writeFile(record.filePath, addThumbnail(record.source, record.frontmatter, record.slug, record.title), 'utf8');
      }

      report.captured.push(record.slug);
      console.log(`OK    ${record.slug}`);
    } catch (error) {
      report.failed.push({ slug: record.slug, url: record.liveUrl, error: error.message });
      console.error(`FAIL  ${record.slug}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const reportPath = path.join(outputDir, 'capture-report.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`\nCaptured: ${report.captured.length}; skipped: ${report.skipped.length}; failed: ${report.failed.length}.`);
console.log(`Report: ${path.relative(root, reportPath)}`);

if (report.failed.length > 0) process.exitCode = 1;
