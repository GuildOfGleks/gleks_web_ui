#!/usr/bin/env node
/**
 * Announces the docs site's URLs to IndexNow, which Bing (and Yandex, and Seznam) consume.
 *
 * **Why this exists.** A new domain with no inbound links is discovered slowly: Bing's own URL
 * inspector reported `general/overview` as "known but not indexed" the day the sitemap was
 * submitted, and for a site with no link graph there is nothing to speed that up from the
 * outside. IndexNow inverts it — instead of waiting to be crawled, the site says "these URLs
 * changed" and the engine comes to fetch them. It is the one discovery lever that does not
 * depend on anybody linking to us.
 *
 * **Ownership is proved by a file, not a secret.** `public/<key>.txt` contains the key and
 * nothing else, so the engine can fetch `https://<host>/<key>.txt` and confirm whoever submitted
 * controls the host. The key is therefore public by construction — it is readable at that URL by
 * anyone — which is why it lives in the repo rather than in a GitHub secret. Nothing is exposed
 * by committing it that is not already served to the world.
 *
 * **The URL list comes from `sitemap.xml`**, which `scripts/build-lab.mjs` regenerates from
 * `nav-data.ts` before every build. That keeps one source of truth: a page added to the sidebar
 * is announced here automatically, with no second list to forget. Read from disk rather than
 * fetched from the live site, so what gets announced is what was just deployed.
 *
 * Run by `deploy-lab.yml` **after** the server health check passes — announcing a deploy that
 * did not come up would invite a crawl of the previous version at best, and of an error page at
 * worst. `npm run ping:indexnow` runs it by hand; `--dry-run` prints the payload and sends
 * nothing.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'projects/gleks-ui-lab/public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

const SITE_HOST = 'ui.guildofgleks.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * The key, and the name of the file that proves it.
 *
 * Both halves have to agree: the payload's `key` and the contents of `public/<key>.txt`. They
 * are derived from this one constant so they cannot drift — a mismatch is rejected with a `403`
 * that says nothing about which half was wrong.
 */
const KEY = '7d22960d75bad291fda7e1e64064d410';
const keyFilePath = path.join(publicDir, `${KEY}.txt`);

const dryRun = process.argv.includes('--dry-run');

/** Reads the `<loc>` entries out of the generated sitemap. */
function readSitemapUrls() {
  if (!existsSync(sitemapPath)) {
    throw new Error(`sitemap.xml not found at ${sitemapPath}. Run \`npm run generate:sitemap\`.`);
  }

  const xml = readFileSync(sitemapPath, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());

  if (urls.length === 0) {
    throw new Error('sitemap.xml contains no <loc> entries — did its shape change?');
  }

  // IndexNow rejects the whole request (422) if any URL is outside the declared host, so a
  // stray absolute URL would silently cost the entire submission rather than just itself.
  const foreign = urls.filter((url) => !url.startsWith(`https://${SITE_HOST}/`));
  if (foreign.length > 0) {
    throw new Error(`sitemap.xml lists URLs outside ${SITE_HOST}: ${foreign.join(', ')}`);
  }

  return urls;
}

/** The key file has to exist, contain exactly the key, and be about to ship in the build. */
function verifyKeyFile() {
  if (!existsSync(keyFilePath)) {
    throw new Error(
      `Key file missing: ${keyFilePath}. It must contain exactly "${KEY}" and nothing else — ` +
        'IndexNow fetches it to verify the submission.',
    );
  }

  const contents = readFileSync(keyFilePath, 'utf8').trim();
  if (contents !== KEY) {
    throw new Error(`Key file ${keyFilePath} contains "${contents}", expected "${KEY}".`);
  }
}

/**
 * Every documented IndexNow response, because the failures are the interesting part and the
 * status code is the only thing that distinguishes them — the body is empty.
 */
function describeStatus(status) {
  switch (status) {
    case 200:
      return 'OK — URLs accepted.';
    case 202:
      return 'Accepted — URLs received, key validation still pending. Normal on a first submission.';
    case 400:
      return 'Bad request — the payload was malformed.';
    case 403:
      return `Forbidden — the key was not valid. Check https://${SITE_HOST}/${KEY}.txt is served and contains exactly the key.`;
    case 422:
      return `Unprocessable — a URL did not belong to ${SITE_HOST}, or the key did not match the host.`;
    case 429:
      return 'Too many requests — submitting too often. Not an error worth retrying immediately.';
    default:
      return 'Undocumented status.';
  }
}

async function main() {
  verifyKeyFile();
  const urlList = readSitemapUrls();

  // The whole set on every deploy rather than a diff. A deploy rebuilds the entire site from
  // the installed package, so any page's rendered output can have changed — and 39 URLs is far
  // below any level IndexNow treats as excessive. Revisit if the site grows an order of
  // magnitude or starts deploying many times a day.
  const payload = {
    host: SITE_HOST,
    key: KEY,
    keyLocation: `https://${SITE_HOST}/${KEY}.txt`,
    urlList,
  };

  if (dryRun) {
    console.log(`[indexnow] dry run — would submit ${urlList.length} URLs to ${ENDPOINT}:`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`[indexnow] submitting ${urlList.length} URLs for ${SITE_HOST}…`);

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const summary = `[indexnow] HTTP ${response.status} — ${describeStatus(response.status)}`;

  if (response.ok) {
    console.log(summary);
    return;
  }

  // Thrown, not just logged, so a broken submission shows up as a red step. The workflow marks
  // this step `continue-on-error`, so a search-engine ping can never fail an otherwise good
  // deploy — the site is already live and healthy by the time this runs.
  throw new Error(summary);
}

main().catch((error) => {
  console.error(`[indexnow] ${error.message}`);
  process.exit(1);
});
