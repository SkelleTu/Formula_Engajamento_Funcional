# 🚀 Guia Completo de Deploy - Replit + Vercel

## 📌 Arquitetura da Solução

```
┌─────────────────┐         ┌──────────────────┐
│   VERCEL        │         │   REPLIT         │
│  (Frontend)     │────────▶│  (Backend)       │
│  React + Vite   │  HTTPS  │  Node.js + SQLite│
└─────────────────┘         └──────────────────┘
```

O **frontend** fica no Vercel e o **backend** fica publicado aqui no Replit.

---

## 🎯 PASSO 1: Publicar o Backend no Replit

### 1.1 Configurar Variáveis de Ambiente

Antes de publicar, configure as variáveis de ambiente para produção:

1. Clique na aba **"Secrets"** (ícone de cadeado) aqui no Replit
2. Adicione as seguintes variáveis:

```bash
# OBRIGATÓRIAS
JWT_SECRET=cole-aqui-uma-chave-secreta-forte-gerada
ALLOWED_ORIGINS=https://seu-site.vercel.app
NODE_ENV=production

# OPCIONAIS (use os padrões se não quiser mudar)
PORT=3001
ALLOW_ADMIN_CREATION=false
```

**⚠️ IMPORTANTE: Gerar JWT_SECRET seguro**

Abra o terminal aqui no Replit e execute:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole no campo `JWT_SECRET`.

**📝 Sobre ALLOWED_ORIGINS:**
- Você vai preencher isso DEPOIS de fazer o deploy no Vercel
- Exemplo: `https://formula-engajamento.vercel.app`
- Se tiver múltiplos domínios, separe por vírgula: `https://site1.vercel.app,https://site2.com`

### 1.2 Publicar o Replit

1. Clique no botão **"Deploy"** (ou "Publish") no topo do Replit
2. Escolha o tipo de deployment: **"Reserved VM"**
3. Aguarde o deploy finalizar
4. Copie a **URL do deployment** (algo como `https://seu-projeto.username.replit.app`)
5. **GUARDE ESSA URL** - você vai precisar dela no Vercel!

### 1.3 Testar o Backend

Abra em uma nova aba: `https://seu-projeto.username.replit.app/api/admin/verify`

Você deve ver: `{"error":"Não autenticado"}` - isso significa que o backend está funcionando!

---

## 🎯 PASSO 2: Configurar e Fazer Deploy no Vercel

### 2.1 Fazer Deploy do Frontend

1. Acesse [vercel.com](https://vercel.com)
2. Importe este projeto do GitHub (ou conecte o Replit ao GitHub primeiro)
3. Na configuração do projeto, certifique-se de:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Adicionar Variável de Ambiente

**ANTES** de fazer o primeiro deploy ou DEPOIS (para redeploy):

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://seu-projeto.username.replit.app` (a URL que você copiou do Replit)
   - **Environments**: Marque todos (Production, Preview, Development)
3. Clique em **Save**

### 2.3 Deploy ou Redeploy

- Se ainda não fez deploy, clique em **Deploy**
- Se já deployou, vá em **Deployments** → Último deployment → ⋮ → **Redeploy**

### 2.4 Pegar a URL do Vercel

Após o deploy, copie a URL do seu site no Vercel (algo como `https://seu-site.vercel.app`)

---

## 🎯 PASSO 3: Atualizar CORS no Backend

Agora que você tem a URL do Vercel, precisa permitir que ela acesse o backend:

### 3.1 Voltar ao Replit

1. Vá na aba **"Secrets"** novamente
2. Atualize a variável `ALLOWED_ORIGINS`:
   ```
   https://seu-site.vercel.app
   ```
   
   Se tiver vários domínios (ex: preview do Vercel):
   ```
   https://seu-site.vercel.app,https://seu-site-git-main.vercel.app
   ```

### 3.2 Redeploy do Backend

1. Vá na aba **"Deployments"** no Replit
2. Clique em **"Redeploy"** ou faça um novo deploy

Aguarde alguns segundos para propagar as mudanças.

---

## ✅ PASSO 4: Testar Tudo Funcionando

### 4.1 Acessar o Site no Vercel

1. Abra `https://seu-site.vercel.app`
2. Navegue até `/admin`
3. Tente fazer login com suas credenciais de admin

### 4.2 Verificar Logs (se houver erro)

**No Vercel:**
- Vá em **Deployments** → Último deployment → **View Function Logs**
- Procure por erros de CORS ou conexão

**No Replit:**
- Vá na aba **Logs** do deployment
- Procure por mensagens de "CORS blocked origin"

---

## 🔧 Solução de Problemas

### ❌ Erro: "Erro ao conectar com o servidor"

**Causa**: Frontend não consegue alcançar o backend.

**Soluções**:
1. Verifique se `VITE_API_BASE_URL` está configurada corretamente no Vercel
2. Confirme que a URL do Replit está correta (com `https://`)
3. Verifique se o backend do Replit está online (acesse a URL direto)

### ❌ Erro: "Not allowed by CORS"

**Causa**: Backend bloqueou a requisição do frontend.

**Soluções**:
1. Verifique se `ALLOWED_ORIGINS` no Replit inclui a URL do Vercel
2. Certifique-se de que `NODE_ENV=production` está configurado no Replit
3. Verifique se fez redeploy do backend após alterar ALLOWED_ORIGINS

### ❌ Erro: "Token inválido" ou "Não autenticado"

**Causa**: Problema com cookies cross-origin.

**Soluções**:
1. Confirme que `NODE_ENV=production` está configurado no Replit
2. Verifique se ambos os sites usam HTTPS (obrigatório para cookies secure)
3. Limpe os cookies do navegador e tente novamente

### ❌ Login funciona mas depois perde a sessão

**Causa**: Cookies não estão sendo salvos corretamente.

**Soluções**:
1. Abra o DevTools (F12) → Application → Cookies
2. Verifique se o cookie `adminToken` está lá com:
   - `Secure: true`
   - `SameSite: None`
   - `HttpOnly: true`
3. Se não estiver, verifique se `NODE_ENV=production` no backend

---

## 📋 Checklist Final

Antes de considerar que está tudo funcionando:

- [ ] Backend publicado no Replit e online
- [ ] `JWT_SECRET` gerado e configurado no Replit
- [ ] `ALLOWED_ORIGINS` configurado com URL do Vercel no Replit
- [ ] `NODE_ENV=production` configurado no Replit
- [ ] Frontend deployado no Vercel
- [ ] `VITE_API_BASE_URL` configurado com URL do Replit no Vercel
- [ ] Consegue fazer login no `/admin` do site do Vercel
- [ ] Dashboard carrega os dados corretamente
- [ ] Sem erros de CORS no console do navegador

---

## 💡 Dicas Importantes

1. **URLs sempre com HTTPS**: Tanto Replit quanto Vercel usam HTTPS automaticamente
2. **Não use barra final**: `https://site.com` e não `https://site.com/`
3. **Preview do Vercel**: Cada branch/PR gera uma URL diferente - adicione em ALLOWED_ORIGINS se precisar
4. **Custos**: Backend no Replit em Reserved VM tem custo mensal
5. **Banco de dados**: O SQLite fica no Replit - faça backups regulares

---

## 🆘 Ainda com Problemas?

Se seguiu todos os passos e ainda tem erros:

1. Abra o DevTools (F12) no navegador
2. Vá na aba **Console**
3. Vá na aba **Network**
4. Tente fazer login novamente
5. Veja qual requisição falhou e qual é o erro exato
6. Compartilhe a mensagem de erro completa

---

## 🎉 Está Funcionando?

Parabéns! Seu sistema está 100% funcional em produção com:
- ✅ Frontend ultra-rápido no Vercel
- ✅ Backend seguro e sempre online no Replit
- ✅ Banco de dados SQLite persistente
- ✅ Analytics funcionando
- ✅ Painel admin protegido
