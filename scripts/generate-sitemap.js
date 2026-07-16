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
  { path: '/crafts/', priority: '0.8', changefreq: 'weekly' },
  { path: '/about/', priority: '0.8', changefreq: 'monthly' },
  { path: '/press/', priority: '0.7', changefreq: 'monthly' },
  { path: '/exhibitions/', priority: '0.7', changefreq: 'monthly' },
  { path: '/classes/', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact/', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms/', priority: '0.3', changefreq: 'yearly' },
];

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf-8')
);

const crafts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'crafts.json'), 'utf-8')
);

const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const absUrl = (u) =>
  /^https?:\/\//.test(u) ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`;

const productPages = products.map((p) => ({
  path: `/shop/${p.id}/`,
  priority: '0.8',
  changefreq: 'monthly',
  image: p.imageUrl ? absUrl(p.imageUrl) : null,
  imageTitle: p.title?.sv || null,
  imageTitleSuffix: 'läderkonst av Oliver Skifs',
}));

const craftPages = crafts.map((c) => ({
  path: `/crafts/${c.id}/`,
  priority: '0.7',
  changefreq: 'monthly',
  image: c.imageUrl ? absUrl(c.imageUrl) : null,
  imageTitle: c.title?.sv || null,
  imageTitleSuffix: 'hantverk av Oliver Skifs',
}));

const allPages = [...staticPages, ...productPages, ...craftPages];

const urls = allPages
  .map((page) => {
    const imageBlock = page.image
      ? `
    <image:image>
      <image:loc>${xmlEscape(page.image)}</image:loc>${
          page.imageTitle
            ? `\n      <image:title>${xmlEscape(page.imageTitle)} – ${xmlEscape(page.imageTitleSuffix)}</image:title>`
            : ''
        }
    </image:image>`
      : '';
    return `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageBlock}
  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, sitemap);
console.log(
  `Sitemap generated with ${allPages.length} URLs (${products.length} products, ${crafts.length} crafts)`
);

const robots = `User-agent: *
Allow: /

Disallow: /cart/
Disallow: /admin/
Disallow: /checkout/

Sitemap: ${SITE_URL}/sitemap.xml
`;

const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
fs.writeFileSync(robotsPath, robots);
console.log('robots.txt generated');
