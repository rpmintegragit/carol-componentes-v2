# Deploy no Cloudflare Pages (plano grátis) + domínio próprio

Caminho preparado em 12/11/2026 para a evolução profissional do site. O GitHub
Pages continua funcionando em paralelo; nada aqui altera o fluxo atual.

## Por que Cloudflare Pages
- CDN com presença no Brasil (menor latência que o GitHub Pages).
- Aceita domínio próprio (`carolcomponentes.com.br`) com HTTPS automático.
- Remove o prefixo `/carol-componentes-v2/` da URL.
- Mesmo build estático já existente — nenhuma mudança de código necessária.
- O projeto já usa Cloudflare Worker + D1 para o /admin; Pages fica na mesma conta.

## Configuração do projeto no painel (uma vez)
1. Cloudflare Dashboard › Workers & Pages › Create › Pages › Connect to Git.
2. Repositório: `rpmintegragit/carol-componentes-v2`, branch `main`.
3. Build command:
   `CAROL_PAGES_BASE=/ CAROL_SITE_ORIGIN=https://carolcomponentes.com.br npm run install:ci && npm run build:pages`
4. Build output directory: `dist-pages`.
5. Variáveis de ambiente do build:
   - `CAROL_PAGES_BASE=/`
   - `CAROL_SITE_ORIGIN=https://carolcomponentes.com.br` (ou o subdomínio provisório `*.pages.dev` enquanto o domínio não chega)
   - `NODE_VERSION=24`

O `build:pages` já gera, com qualquer base: páginas estáticas por produto
(`produto/<slug>/index.html`), `sitemap.xml`, `robots.txt`, Open Graph e 404.html
(fallback de SPA, que o Pages respeita).

## Quando a Carol conseguir as senhas do domínio
1. Adicionar `carolcomponentes.com.br` como Custom Domain do projeto Pages
   (Cloudflare cria DNS e certificado sozinha se a zona estiver na conta;
   caso o registro esteja em outro provedor, apontar CNAME para `<projeto>.pages.dev`).
2. Rebuild com `CAROL_SITE_ORIGIN=https://carolcomponentes.com.br` (sitemap/canonical corretos).
3. Google Search Console: adicionar a propriedade e enviar `https://carolcomponentes.com.br/sitemap.xml`.
4. Manter o GitHub Pages no ar por 60–90 dias; depois, se desejado, publicar nele
   uma página de redirecionamento para o domínio novo.
5. E-mail `contato@`/`vendas@carolcomponentes.com.br`: Cloudflare Email Routing
   (grátis) encaminha para a caixa que a Carol escolher. Envio real pelo site
   continua dependendo de `RESEND_API_KEY` no Worker (ver AGENTS.md).

## Limites conhecidos
- Plano grátis do Pages: 500 builds/mês, arquivos de até 25 MB (o maior asset
  atual é o PDF de 60 páginas, abaixo disso), tráfego ilimitado.
- O /admin continua no Worker/D1 (projeto separado); o Pages é só a vitrine.
