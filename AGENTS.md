# Continuidade por IA — Carol Componentes

Leia primeiro README.md, docs/HANDOFF-IA.md, DEPLOY_MANUAL.md, CHANGELOG.md e docs/DATA.md e docs/ADMINISTRACAO.md. Este é o projeto Carol; não altere o projeto RFK.

A história é a linha do tempo de QUATRO marcos em app/movement.tsx. Nunca restaurar os três passos comerciais Encontre/Converse/Coloque. **12/11/2026: os textos e datas (1984, 1994, 2007, 2026) são os OFICIAIS fornecidos pelo cliente — não reescrever sem ordem de Ramon.**

Decisões do cliente em 12/11/2026 (não reverter sem ordem): slogan do hero "Conectando peças, soluções e indústrias."; menu "Produtos" (não "Componentes") com mega menu de famílias no hover; filtro de fornecedor removido da barra lateral; carrossel de marcas movido para o fim da página (sem Quimatic); seção "Todas as famílias" no fim (app/families-index.tsx + lib/family-groups.ts); seções de redes sociais e de cartões/pagamentos REMOVIDAS do site; horário: seg–qui 08h–12h/13h–18h, sex 08h–12h/13h–17h; o texto pré-preenchido do WhatsApp NÃO leva dados do cliente (CNPJ/telefone/nome — ficam só no registro interno de leads).

Preservar único WhatsApp 5547996180088. Não introduzir contatos de Curitiba. Contatos exibidos: vendas@carolcomponentes.com.br e lojavirtual@carolcomponentes.com.br; exibição não significa caixas provisionadas. Envio real requer RESEND_API_KEY e EMAIL_FROM no servidor; sem eles, registrar como pendente. Nunca afirmar entrega sem confirmação do provedor.

O site tem dois alvos de build: Worker/D1/Sites e GitHub Pages estático. Nenhum segredo, token, conversa privada, dados reais de leads ou banco local deve entrar no Git. A área /admin usa autenticação própria no Worker/D1, com política de senha definida por segredo no servidor e token de sessão. O frontend Pages consome essa API via CORS. Não transportar senhas/segredos para o frontend. Não publicar .wrangler, work, outputs, .env, node_modules ou dist.

Preservar package-lock.json e dependências. Instalar npm run install:ci. Construir npm run build:pages para GitHub Pages ou npm run build para Worker. Não confundir pastas dist-pages e dist. Rodar TypeScript e testes relevantes antes de publicar. Documentar mudança, motivo, validação e limites. Não editar dados ausentes como se confirmados.

GitHub Pages usa base /carol-componentes/. Domínio próprio usa CAROL_PAGES_BASE=/. Atualizar o transform de caminhos se criar novas famílias de assets. Revisar celular 320/390/768 px, redução de movimento, foco, comparativo vertical, fechamento de produto sem salto. Não remover animações solicitadas para esconder um defeito de layout.

A assinatura autorizada do autor no rodapé usa WhatsApp 5541999751171, separado do atendimento comercial. Preservar galeria, endereço automático, seletor de categorias e metadados de tela inicial com nome curto Carol. Rodar scripts/verify-v24-browser.mjs no build Pages para detectar regressão de caminhos de imagens da API.

Atualização autorizada: conta admin e troca inicial não obrigatória. ADMIN_BOOTSTRAP e hashes são exclusivos do servidor. Preservar logo oficial e paletas. O usuário autorizou atualizar ambos os projetos, mantendo recursos independentes.
