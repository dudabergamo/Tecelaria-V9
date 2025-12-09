# 🚀 Guia de Deploy no Vercel - Tecelaria

## ⚠️ IMPORTANTE: Limitações do Vercel para este Projeto

Este projeto é **fullstack** (Express + React + tRPC + MySQL) e possui **dependências específicas do Manus**. O deploy no Vercel requer configurações adicionais e **NÃO** terá todas as funcionalidades do Manus.

### O que NÃO funcionará no Vercel:
- ❌ **APIs internas do Manus** (LLM, Storage S3, Notificações, Transcrição de áudio, Geração de imagens)
- ❌ **Autenticação OAuth do Manus** (você precisará implementar outro provedor)
- ❌ **Banco de dados MySQL do Manus** (você precisará de um banco externo)

### Alternativa Recomendada:
✅ **Use o botão "Publish" do Manus** - Deploy com 1 clique, tudo funciona automaticamente, domínio customizado incluído.

---

## 📋 Pré-requisitos

Antes de fazer deploy no Vercel, você precisa:

### 1. **Banco de Dados MySQL Externo**

Escolha uma das opções:

#### Opção A: PlanetScale (Recomendado - Free tier generoso)
1. Acesse [planetscale.com](https://planetscale.com)
2. Crie uma conta e um novo database
3. Copie a **connection string** (formato: `mysql://user:pass@host/database`)

#### Opção B: Railway Database
1. Acesse [railway.app](https://railway.app)
2. Crie um projeto e adicione MySQL
3. Copie a **connection string**

#### Opção C: Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um projeto
3. Vá em Database Settings e copie a **connection string** (modo direto, não pooler)

### 2. **Migrar Dados do Banco Atual (Opcional)**

Se você já tem dados no banco do Manus e quer migrar:

```bash
# 1. Exportar dados do Manus (use a UI do Manus Database ou MySQL Workbench)
# 2. Importar no novo banco usando a connection string

# Ou use drizzle-kit para recriar as tabelas:
DATABASE_URL="sua-connection-string-aqui" pnpm db:push
```

### 3. **Substituir Funcionalidades do Manus**

Você precisará substituir as APIs internas:

#### a) **Autenticação OAuth**
- Substitua `server/_core/oauth.ts` por NextAuth.js, Auth0, ou Clerk
- Ou implemente autenticação JWT manual

#### b) **Storage S3**
- Substitua `server/storage.ts` por AWS S3 direto, Cloudinary, ou UploadThing
- Configure credenciais AWS (ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME)

#### c) **LLM (Geração de texto com IA)**
- Substitua `server/_core/llm.ts` por chamada direta à OpenAI API
- Configure `OPENAI_API_KEY`

#### d) **Transcrição de Áudio**
- Substitua `server/_core/voiceTranscription.ts` por Whisper API da OpenAI
- Use a mesma `OPENAI_API_KEY`

#### e) **Geração de Imagens**
- Substitua `server/_core/imageGeneration.ts` por DALL-E API ou Replicate
- Configure API key correspondente

#### f) **Notificações**
- Substitua `server/_core/notification.ts` por SendGrid, Resend, ou Twilio
- Configure API key do serviço escolhido

---

## 🔧 Configuração do Vercel

### Passo 1: Preparar Repositório Git

```bash
# Se ainda não tem Git configurado:
git init
git add .
git commit -m "Preparar para deploy no Vercel"

# Criar repositório no GitHub e fazer push:
git remote add origin https://github.com/seu-usuario/tecelaria.git
git branch -M main
git push -u origin main
```

### Passo 2: Importar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione seu repositório do GitHub
4. Configure as seguintes opções:

**Framework Preset:** `Other` (não selecione Vite/React)

**Build Command:**
```
pnpm vercel-build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

#### Variáveis Obrigatórias:

```env
# Banco de Dados
DATABASE_URL=mysql://user:pass@host/database

# JWT para sessões
JWT_SECRET=gere-uma-string-aleatoria-segura-aqui

# Node Environment
NODE_ENV=production
```

#### Variáveis Opcionais (dependendo das funcionalidades):

```env
# Se usar AWS S3 para storage
AWS_ACCESS_KEY_ID=sua-key-aqui
AWS_SECRET_ACCESS_KEY=sua-secret-aqui
AWS_BUCKET_NAME=seu-bucket
AWS_REGION=us-east-1

# Se usar OpenAI para LLM e transcrição
OPENAI_API_KEY=sk-...

# Se usar autenticação OAuth externa
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OAUTH_CALLBACK_URL=https://seu-dominio.vercel.app/api/oauth/callback

# URL base da aplicação
VITE_APP_URL=https://seu-dominio.vercel.app
```

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (5-10 minutos)
3. Se der erro, verifique os logs e ajuste as variáveis de ambiente

---

## 🐛 Troubleshooting

### Erro: "Module not found" ou "Cannot find package"

**Solução:** Certifique-se de que todas as dependências estão em `dependencies` (não `devDependencies`):

```bash
# Mover dependências necessárias para production:
pnpm add -P esbuild tsx drizzle-kit
```

### Erro: "Database connection failed"

**Solução:** Verifique se:
1. A `DATABASE_URL` está correta
2. O banco de dados está acessível publicamente
3. As tabelas foram criadas (`pnpm db:push`)

### Erro: "Port already in use" ou "EADDRINUSE"

**Solução:** O Vercel usa porta dinâmica. Certifique-se de que o servidor usa `process.env.PORT`:

```typescript
// server/_core/index.ts
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Site mostra código ao invés de renderizar

**Solução:** Isso acontece quando o Vercel não reconhece que é uma aplicação Node. Verifique:
1. `vercel.json` está na raiz do projeto
2. Build command está correto: `pnpm vercel-build`
3. Output directory está correto: `dist`

### Funcionalidades do Manus não funcionam

**Solução:** Você precisa substituir as APIs internas do Manus por serviços externos (veja seção "Substituir Funcionalidades do Manus").

---

## 📊 Comparação: Vercel vs Manus Hosting

| Recurso | Vercel | Manus Hosting |
|---------|--------|---------------|
| **Deploy** | Manual, requer configuração | 1 clique, zero config |
| **Banco de Dados** | Externo (pago) | Incluído (MySQL/TiDB) |
| **Domínio Customizado** | Sim (grátis) | Sim (grátis) |
| **Storage S3** | Configurar AWS | Incluído |
| **LLM/IA** | Configurar OpenAI | Incluído |
| **OAuth** | Implementar manualmente | Incluído |
| **Custo Mensal** | $20-50+ (banco + APIs) | Incluído no plano |
| **Manutenção** | Alta | Zero |

---

## ✅ Checklist Final

Antes de fazer deploy, confirme:

- [ ] Banco de dados MySQL externo configurado
- [ ] Dados migrados (se necessário)
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] APIs do Manus substituídas por alternativas
- [ ] Código commitado no Git e pushed para GitHub
- [ ] `vercel.json` na raiz do projeto
- [ ] Script `vercel-build` no `package.json`
- [ ] Testado localmente com variáveis de ambiente de produção

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. **Verifique os logs de build** no painel do Vercel
2. **Teste localmente** com as mesmas variáveis de ambiente
3. **Considere usar Manus Hosting** - muito mais simples para este projeto

---

**Última atualização:** Dezembro 2025
