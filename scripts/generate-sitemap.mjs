import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routes = [
  '/',
  '/catalog',
  '/brands',
  '/service',
  '/test-drive',
  '/offers',
  '/dealers',
  '/contact',
  '/about',
];

const rawBase = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? '';
const baseUrl = rawBase.replace(/\/$/, '');
const sitemapUrl = baseUrl ? `${baseUrl}/sitemap.xml` : '/sitemap.xml';
const now = new Date().toISOString();

const urlEntries = routes
  .map((route) => {
    const loc = baseUrl ? `${baseUrl}${route}` : route;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${urlEntries}\n` +
  `</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`;

mkdirSync(resolve('public'), { recursive: true });
writeFileSync(resolve('public/sitemap.xml'), sitemap, 'utf-8');
writeFileSync(resolve('public/robots.txt'), robots, 'utf-8');

if (!baseUrl) {
  console.warn('[sitemap] SITE_URL not set, using relative URLs in sitemap.');
}
