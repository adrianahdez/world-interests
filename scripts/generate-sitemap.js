#!/usr/bin/env node
'use strict';

/**
 * Generates sitemap.xml and robots.txt from the live backend category list.
 *
 * Usage: npm run generate-sitemap
 *
 * Requirements:
 *   - Backend must be running (REACT_APP_BACKEND_API_URL set in .env)
 *   - REACT_APP_SITE_URL must be set in .env.production (warns and uses hardcoded fallback if absent)
 *
 * Run this script whenever categories are added or removed in the backend,
 * then commit the updated sitemap.xml and robots.txt.
 */

const fs    = require('fs');
const path  = require('path');
const http  = require('http');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');

// Parses a .env file and returns a plain key→value object.
// Does NOT mutate process.env — use this when you need to read a specific file
// regardless of what is already set in the environment.
function parseEnvFile(filePath) {
  const result = {};
  try {
    fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq === -1) return;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key) result[key] = val;
      });
  } catch (_) {
    // File absent or unreadable — return empty object.
  }
  return result;
}

// Populates process.env from a .env file, skipping keys already set in the environment.
function loadEnvFile(filePath) {
  const parsed = parseEnvFile(filePath);
  Object.entries(parsed).forEach(([key, val]) => {
    if (!(key in process.env)) process.env[key] = val;
  });
}

// REACT_APP_BACKEND_API_URL comes from .env (dev config).
loadEnvFile(path.join(ROOT, '.env'));
const API_BASE = (process.env.REACT_APP_BACKEND_API_URL || '').replace(/\/$/, '');

if (!API_BASE) {
  console.error('[sitemap] ERROR: REACT_APP_BACKEND_API_URL is not set. Add it to .env.');
  process.exit(1);
}

// REACT_APP_SITE_URL must come from .env.production only — never from .env.
// Reading it from the file directly (not process.env) ensures .env cannot
// accidentally supply it, even if the developer adds it there by mistake.
const prodEnv  = parseEnvFile(path.join(ROOT, '.env.production'));
const SITE_URL = (prodEnv.REACT_APP_SITE_URL || '').replace(/\/$/, '');

if (!SITE_URL) {
  console.warn('[sitemap] WARNING: REACT_APP_SITE_URL is not set in .env.production — using hardcoded fallback.');
  console.warn('[sitemap]          Add REACT_APP_SITE_URL=https://your-domain.com to .env.production.');
}
const resolvedSiteUrl = SITE_URL || 'https://worldinterests.midri.net';

// Minimal HTTP/HTTPS fetch — no external dependencies required.
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const transport = url.startsWith('https') ? https : http;
    transport.get(url, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        return;
      }
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function buildSitemap(siteUrl, slugs) {
  const now = new Date().toISOString();
  const rootEntry = [
    '  <url>',
    `    <loc>${siteUrl}/</loc>`,
    `    <lastmod>${now}</lastmod>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
  ].join('\n');

  const categoryEntries = slugs.map(slug => [
    '  <url>',
    `    <loc>${siteUrl}/?category=${slug}</loc>`,
    `    <lastmod>${now}</lastmod>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>',
  ].join('\n')).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    rootEntry,
    categoryEntries,
    '</urlset>',
    '',
  ].join('\n');
}

function buildRobots(siteUrl) {
  return [
    '# If the domain changes, update REACT_APP_SITE_URL in .env.production and run:',
    '#   npm run generate-sitemap',
    '# That script will regenerate this file with the correct Sitemap URL.',
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

async function run() {
  const categoriesUrl = `${API_BASE}/api/categories`;
  console.log(`[sitemap] Fetching categories from ${categoriesUrl} …`);

  let response;
  try {
    response = await fetchJson(categoriesUrl);
  } catch (e) {
    console.error(`[sitemap] ERROR: Could not fetch categories — ${e.message}`);
    console.error('[sitemap]        Is the backend running? Check REACT_APP_BACKEND_API_URL in .env.');
    process.exit(1);
  }

  // API response shape: { error: false, data: { en: { slug: name }, es: { slug: name } } }
  const langData = response?.data?.en ?? response?.en ?? response;
  if (!langData || typeof langData !== 'object' || Object.keys(langData).length === 0) {
    console.error('[sitemap] ERROR: API returned no categories. Response:', JSON.stringify(response));
    process.exit(1);
  }

  const slugs = Object.keys(langData);
  console.log(`[sitemap] Found ${slugs.length} categories: ${slugs.join(', ')}`);

  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  const robotsPath  = path.join(ROOT, 'robots.txt');

  fs.writeFileSync(sitemapPath, buildSitemap(resolvedSiteUrl, slugs), 'utf8');
  console.log(`[sitemap] ✓ Written ${sitemapPath}`);

  fs.writeFileSync(robotsPath, buildRobots(resolvedSiteUrl), 'utf8');
  console.log(`[sitemap] ✓ Written ${robotsPath}`);

  console.log('[sitemap] Done. Commit sitemap.xml and robots.txt to deploy the updated sitemap.');
}

run();
