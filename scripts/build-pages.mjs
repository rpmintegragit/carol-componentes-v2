import {spawnSync} from 'node:child_process';
import {copyFileSync,writeFileSync,mkdirSync} from 'node:fs';
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.pages.config.ts'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
copyFileSync('dist-pages/index.html','dist-pages/404.html');
writeFileSync('dist-pages/.nojekyll','');

mkdirSync('dist-pages/admin',{recursive:true});copyFileSync('dist-pages/index.html','dist-pages/admin/index.html');

// SEO: paginas estaticas por produto (HTTP 200), sitemap, robots e OG da home.
const seo=spawnSync(process.execPath,['scripts/generate-seo.mjs'],{stdio:'inherit'});
if(seo.status!==0)process.exit(seo.status||1);
