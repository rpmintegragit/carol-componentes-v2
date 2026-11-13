// Pos-build do alvo GitHub Pages / Cloudflare Pages:
// - gera produto/<slug>/index.html pre-renderizado (HTTP 200, meta/OG/JSON-LD por produto)
// - gera sitemap.xml e robots.txt
// - injeta Open Graph na home
// Sem segredo, sem preco, sem dado comercial (regras do projeto).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const DIST = 'dist-pages';
const BASE = process.env.CAROL_PAGES_BASE || '/carol-componentes-v2/';
const ORIGIN = (process.env.CAROL_SITE_ORIGIN || 'https://rpmintegragit.github.io').replace(/\/$/, '');
const SITE = ORIGIN + BASE;

const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
const products = catalog.products;
const template = readFileSync(path.join(DIST, 'index.html'), 'utf8');

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shortName = (n = '') => n.replace(/\s*\/\s*Merkbak/ig, '').replace(/\s*Merkbak$/i, '');
const abs = (p = '') => (p.startsWith('http') ? p : ORIGIN + (p.startsWith('/') ? BASE.replace(/\/$/, '') + p : BASE + p));
const trim = (s = '', n = 158) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

const og = (title, desc, url, image, type = 'website') => [
  `<link rel="canonical" href="${url}"/>`,
  `<meta property="og:site_name" content="Carol Componentes Industriais"/>`,
  `<meta property="og:type" content="${type}"/>`,
  `<meta property="og:title" content="${esc(title)}"/>`,
  `<meta property="og:description" content="${esc(desc)}"/>`,
  `<meta property="og:url" content="${url}"/>`,
  `<meta property="og:image" content="${image}"/>`,
  `<meta property="og:locale" content="pt_BR"/>`,
  `<meta name="twitter:card" content="summary_large_image"/>`,
].join('');

// Home: injeta OG
const homeImage = abs('/images/brand/carol-logo.png');
const homeDesc = 'Componentes industriais em Joinville com envio para todo o Brasil: fixação, retenção, grampos, amortecedores de vibração, elementos de máquinas e mais.';
let home = template.replace('<title>', og('Carol Componentes | Componentes industriais', homeDesc, SITE, homeImage) + '<title>');
writeFileSync(path.join(DIST, 'index.html'), home);
writeFileSync(path.join(DIST, '404.html'), home);

// Paginas por produto
let count = 0;
for (const p of products) {
  const name = shortName(p.name);
  const title = `${name} — ${p.brand || p.supplier || 'Carol Componentes'} | Carol Componentes`;
  const url = `${SITE}produto/${p.slug}/`;
  const desc = trim(p.summary || p.description || `${name}: especificações técnicas, medidas e cotação na Carol Componentes, Joinville/SC.`);
  const img = abs((p.image || '').replace(/\.(png|jpe?g)$/i, '.large.webp') || '/images/brand/carol-logo.png');
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    sku: p.sku || undefined,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    image: img,
    description: desc,
    url,
  });
  const head = og(title, desc, url, img, 'product')
    + `<script type="application/ld+json">${jsonld}</script>`;
  let page = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\/>)/, `$1${esc(desc)}$2`)
    .replace('<title>', head + '<title>');
  const dir = path.join(DIST, 'produto', p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), page);
  count++;
}

// Sitemap e robots
const today = new Date().toISOString().slice(0, 10);
const urls = [SITE, ...products.map((p) => `${SITE}produto/${p.slug}/`)];
writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    '\n</urlset>\n',
);
writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: ${BASE}admin\n\nSitemap: ${SITE}sitemap.xml\n`);
console.log(`SEO: ${count} páginas de produto, sitemap com ${urls.length} URLs, robots.txt (origem ${SITE})`);
