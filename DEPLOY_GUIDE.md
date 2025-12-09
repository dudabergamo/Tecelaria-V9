# 📦 Guia Completo de Deploy - Tecelaria

**Versão:** d38136f9  
**Data:** 05/12/2025  
**Plataforma Recomendada:** Vercel, Railway ou VCL

---

## 🎯 Visão Geral

Este guia contém todas as instruções para fazer o deploy da plataforma Tecelaria em produção. O projeto está 100% funcional e testado, pronto para uso real.

---

## 📋 Pré-requisitos

Antes de começar o deploy, você precisará:

### 1. Banco de Dados MySQL/TiDB
- **Recomendado:** TiDB Cloud (gratuito até 5GB)
- **Alternativas:** PlanetScale, Railway MySQL, AWS RDS
- **Requisitos:** MySQL 8.0+ ou TiDB compatível

### 2. Conta na Plataforma de Deploy
- **Opção 1:** Vercel (mais fácil, recomendado)
- **Opção 2:** Railway (mais controle)
- **Opção 3:** VCL (conforme sua preferência)

### 3. Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@host:porta/database?ssl={"rejectUnauthorized":true}

# Autenticação (fornecidas pelo Manus)
JWT_SECRET=seu_jwt_secret_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu_app_id_aqui
OWNER_OPEN_ID=seu_owner_open_id
OWNER_NAME=seu_nome

# APIs Manus (fornecidas automaticamente)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua_api_key
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=seu_endpoint
VITE_ANALYTICS_WEBSITE_ID=seu_website_id

# Branding
VITE_APP_TITLE=Tecelaria - Histórias de Vida em Livros
VITE_APP_LOGO=/logo.svg
```

---

## 🚀 Passo a Passo: Deploy no Vercel (Recomendado)

### Passo 1: Preparar o Banco de Dados

#### Opção A: TiDB Cloud (Gratuito)

1. Acesse [https://tidbcloud.com](https://tidbcloud.com)
2. Crie uma conta gratuita
3. Crie um novo cluster "Serverless"
4. Anote a string de conexão fornecida
5. **Importante:** Habilite SSL/TLS na conexão

#### Opção B: PlanetScale

1. Acesse [https://planetscale.com](https://planetscale.com)
2. Crie uma conta
3. Crie um novo banco "tecelaria"
4. Anote a string de conexão

### Passo 2: Fazer Upload do Código

1. Extraia o arquivo ZIP fornecido
2. Acesse [https://vercel.com](https://vercel.com)
3. Faça login com GitHub, GitLab ou email
4. Clique em "Add New Project"
5. Escolha "Import Git Repository" OU faça upload direto do ZIP
6. Selecione a pasta extraída

### Passo 3: Configurar Variáveis de Ambiente

1. Na tela de configuração do projeto, clique em "Environment Variables"
2. Adicione **TODAS** as variáveis listadas acima
3. **Atenção:** `DATABASE_URL` deve incluir `?ssl={"rejectUnauthorized":true}`

### Passo 4: Configurar Build

Vercel detecta automaticamente, mas confirme:

```
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

### Passo 5: Deploy!

1. Clique em "Deploy"
2. Aguarde 2-5 minutos
3. Vercel fornecerá uma URL pública (ex: `tecelaria.vercel.app`)

### Passo 6: Executar Migrations

**IMPORTANTE:** Após o primeiro deploy, execute as migrations:

1. Acesse o painel do Vercel
2. Vá em "Settings" → "Functions"
3. Ou use o Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel env pull
pnpm db:push
```

**Alternativa:** Execute as migrations localmente apontando para o banco de produção:

```bash
# No arquivo .env local, adicione a DATABASE_URL de produção
pnpm db:push
```

---

## 🚀 Passo a Passo: Deploy no Railway

### Passo 1: Criar Projeto

1. Acesse [https://railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Escolha "Deploy from GitHub repo" OU "Empty Project"

### Passo 2: Adicionar Banco de Dados

1. No projeto, clique em "+ New"
2. Escolha "Database" → "MySQL"
3. Railway criará automaticamente um banco
4. Copie a `DATABASE_URL` fornecida

### Passo 3: Adicionar Serviço Web

1. Clique em "+ New" → "GitHub Repo" (ou faça upload do ZIP)
2. Selecione o repositório/pasta
3. Railway detecta automaticamente Node.js

### Passo 4: Configurar Variáveis

1. Clique no serviço web
2. Vá em "Variables"
3. Adicione todas as variáveis de ambiente
4. **Importante:** Adicione `DATABASE_URL` apontando para o MySQL do Railway

### Passo 5: Configurar Build

Railway detecta automaticamente, mas confirme em "Settings":

```
Build Command: pnpm build
Start Command: pnpm start
```

### Passo 6: Deploy

1. Railway faz deploy automático
2. Acesse a URL fornecida (ex: `tecelaria-production.up.railway.app`)

### Passo 7: Executar Migrations

```bash
# Conecte ao Railway CLI
railway login
railway link
railway run pnpm db:push
```

---

## 🚀 Passo a Passo: Deploy no VCL

### Passo 1: Preparar Ambiente

1. Acesse o painel do VCL
2. Crie um novo projeto Node.js
3. Configure Node.js 22.x

### Passo 2: Upload do Código

1. Extraia o ZIP fornecido
2. Faça upload via FTP/SFTP ou painel do VCL
3. Certifique-se de que todos os arquivos estão na raiz

### Passo 3: Instalar Dependências

```bash
# Via SSH ou terminal do VCL
cd /caminho/do/projeto
npm install -g pnpm
pnpm install
```

### Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
OAUTH_SERVER_URL=...
# ... todas as outras variáveis
```

### Passo 5: Build

```bash
pnpm build
```

### Passo 6: Executar Migrations

```bash
pnpm db:push
```

### Passo 7: Iniciar Servidor

```bash
# Produção
pnpm start

# Ou com PM2 (recomendado)
npm install -g pm2
pm2 start "pnpm start" --name tecelaria
pm2 save
pm2 startup
```

### Passo 8: Configurar Proxy Reverso

Configure Nginx ou Apache para redirecionar para a porta do Node.js (geralmente 3000):

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Build para produção
pnpm build

# Executar migrations
pnpm db:push

# Iniciar servidor de produção
pnpm start

# Iniciar servidor de desenvolvimento (local)
pnpm dev

# Executar testes
pnpm test

# Verificar tipos TypeScript
pnpm typecheck
```

---

## 🗄️ Estrutura do Banco de Dados

O projeto usa Drizzle ORM com migrations automáticas. As tabelas criadas são:

- `users` - Usuários do sistema
- `kits` - Kits de histórias (3 meses + 1 ano)
- `kit_members` - Membros colaboradores de cada kit
- `categories` - Categorias de memórias
- `memories` - Memórias registradas
- `memory_records` - Registros individuais (áudio, texto, foto, documento)
- `questions` - 150 perguntas das 4 caixinhas
- `user_question_responses` - Vinculação pergunta → resposta

---

## ✅ Checklist Pós-Deploy

Após o deploy, verifique:

- [ ] Homepage carrega corretamente
- [ ] Login funciona (OAuth Manus)
- [ ] Dashboard exibe cronômetros
- [ ] Registrar memória funciona (todas as abas)
- [ ] Upload de áudio funciona
- [ ] Transcrição de áudio funciona (Whisper API)
- [ ] Análise de IA funciona (LLM)
- [ ] Página "Minhas Memórias" exibe memórias
- [ ] Filtros funcionam
- [ ] Página "Caixinhas" exibe 150 perguntas
- [ ] Sortear pergunta funciona
- [ ] Responder pergunta vincula corretamente
- [ ] Editar memória funciona
- [ ] Excluir memória funciona
- [ ] Página de Perfil funciona
- [ ] Gerenciar Kit funciona (convidar membros)

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"

**Causa:** String de conexão incorreta ou banco não acessível

**Solução:**
1. Verifique `DATABASE_URL` nas variáveis de ambiente
2. Certifique-se de que SSL está habilitado: `?ssl={"rejectUnauthorized":true}`
3. Teste a conexão localmente primeiro

### Erro: "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
rm -rf node_modules
pnpm install
```

### Erro: "Port already in use"

**Causa:** Porta 3000 já está sendo usada

**Solução:**
```bash
# Encontre o processo
lsof -i :3000
# Mate o processo
kill -9 <PID>
```

### Erro: "Whisper API failed"

**Causa:** API key inválida ou arquivo muito grande

**Solução:**
1. Verifique `BUILT_IN_FORGE_API_KEY`
2. Limite de 16MB por arquivo
3. Formatos suportados: MP3, WAV, M4A, WEBM

### Erro: "OAuth redirect failed"

**Causa:** URL de callback incorreta

**Solução:**
1. Verifique `VITE_OAUTH_PORTAL_URL`
2. Configure callback URL no painel Manus: `https://seudominio.com/api/oauth/callback`

---

## 🔄 Como Atualizar Após Deploy

### Cenário 1: Correções de Bug

1. Volte ao chat do Manus
2. Descreva o bug encontrado
3. IA corrige e gera novo ZIP
4. Faça re-deploy seguindo os mesmos passos

### Cenário 2: Novas Funcionalidades

1. Volte ao chat do Manus
2. Descreva a funcionalidade desejada
3. IA implementa, testa e gera novo ZIP
4. Faça re-deploy

### Cenário 3: Mudanças de Texto/Layout

1. Volte ao chat do Manus
2. Descreva as mudanças
3. IA atualiza e gera novo ZIP
4. Faça re-deploy

**IMPORTANTE:** Sempre mantenha backups do banco de dados antes de fazer re-deploy com mudanças no schema.

---

## 📊 Monitoramento e Logs

### Vercel

- Acesse "Deployments" → Clique no deploy → "Logs"
- Logs em tempo real disponíveis

### Railway

- Acesse o serviço → "Deployments" → "Logs"
- Logs persistem por 7 dias

### VCL

- Acesse via SSH: `tail -f /var/log/nodejs/tecelaria.log`
- Ou use PM2: `pm2 logs tecelaria`

---

## 🔐 Segurança

### Recomendações

1. **HTTPS obrigatório** - Configure SSL/TLS
2. **Variáveis de ambiente** - Nunca commite `.env` no Git
3. **Backup do banco** - Configure backups automáticos diários
4. **Rate limiting** - Configure limite de requisições (já implementado no código)
5. **CORS** - Configure domínios permitidos (já implementado)

### Variáveis Sensíveis

**NUNCA** exponha publicamente:
- `DATABASE_URL`
- `JWT_SECRET`
- `BUILT_IN_FORGE_API_KEY`

---

## 📞 Suporte

### Problemas Técnicos

1. Volte ao chat do Manus
2. Descreva o problema com detalhes:
   - O que você estava tentando fazer?
   - O que aconteceu?
   - Mensagem de erro (se houver)
   - Screenshots (se aplicável)

### Dúvidas sobre Funcionalidades

- Consulte o arquivo `FUNCIONALIDADES.md` (incluído no ZIP)
- Volte ao chat do Manus para esclarecimentos

---

## 📝 Notas Finais

- **Versão do Node.js:** 22.13.0 (recomendado)
- **Gerenciador de pacotes:** pnpm (obrigatório)
- **Banco de dados:** MySQL 8.0+ ou TiDB
- **Ambiente:** Production-ready, testado e funcional

**Boa sorte com o deploy! 🚀**
