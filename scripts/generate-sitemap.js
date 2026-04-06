/**
 * Generates sitemap.xml including all static pages and dynamic product pages.
 * Run before build: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.oliverskifs.se';
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop/', priority: '0.9', changefreq: 'weekly' },
  { path: '/about/', priority: '0.8', changefreq: 'monthly' },
  { path: '/exhibitions/', priority: '0.7', changefreq: 'monthly' },
  { path: '/classes/', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact/', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms/', priority: '0.3', changefreq: 'yearly' },
];

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf-8')
);

const productPages = products.map((p) => ({
  path: `/shop/${p.id}/`,
  priority: '0.8',
  changefreq: 'monthly',
}));

const allPages = [...staticPages, ...productPages];

const urls = allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, sitemap);
console.log(`Sitemap generated with ${allPages.length} URLs (${products.length} products)`);
