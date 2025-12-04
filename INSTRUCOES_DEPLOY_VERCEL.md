# 🚀 Instruções de Deploy no Vercel

## ⚠️ IMPORTANTE: Configuração da API Backend

Para que o painel admin funcione corretamente no Vercel, você precisa configurar a URL da API backend.

## 📋 Passo a Passo

### 1. Hospede o Backend

Primeiro, você precisa hospedar o servidor backend (Node.js/Express) em algum lugar. Opções recomendadas:

- **Railway** (https://railway.app)
- **Render** (https://render.com)
- **Heroku** (https://heroku.com)
- **Backend no próprio Replit** (https://replit.com)

### 2. Configure a Variável de Ambiente no Vercel

Depois de ter a URL do backend, configure no Vercel:

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione uma nova variável:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** URL completa do seu backend (exemplo: `https://seu-backend.railway.app`)
   - **Environments:** Marque **Production**, **Preview** e **Development**
4. Clique em **Save**

### 3. Redeploy do Projeto

Após adicionar a variável de ambiente:

1. Vá na aba **Deployments**
2. Clique nos 3 pontinhos do último deployment
3. Escolha **Redeploy**

## 🔧 Estrutura do Projeto

Este projeto tem duas partes:

### Frontend (React + Vite)
- Hospedado no Vercel
- Precisa da variável `VITE_API_BASE_URL` apontando para o backend

### Backend (Node.js + Express)
- Servidor que precisa estar rodando em produção
- Porta padrão: 3001
- Banco de dados SQLite (database.db)

## 📝 Exemplo de Configuração

### Desenvolvimento (Replit)
```bash
# Não precisa configurar VITE_API_BASE_URL
# O proxy do Vite redireciona /api para http://localhost:3001
```

### Produção (Vercel)
```bash
# Configure no Vercel:
VITE_API_BASE_URL=https://seu-backend.railway.app

# Exemplo com Railway:
VITE_API_BASE_URL=https://formula-engajamento-backend.up.railway.app

# Exemplo com Render:
VITE_API_BASE_URL=https://formula-engajamento.onrender.com

# Exemplo com backend no Replit:
VITE_API_BASE_URL=https://seu-projeto.replit.app
```

## 🎯 Como Funciona

- **No Replit (desenvolvimento):** O Vite usa o proxy configurado, então `/api/admin/login` vai para `http://localhost:3001/api/admin/login`

- **No Vercel (produção):** Se `VITE_API_BASE_URL` estiver configurado, `/api/admin/login` vai para `https://seu-backend.railway.app/api/admin/login`

## ⚡ Opção Rápida: Backend no Replit

Se você quer uma solução rápida:

1. Faça o deploy do backend aqui no Replit (botão "Publish")
2. Copie a URL do Replit (exemplo: `https://seu-projeto.username.replit.app`)
3. Configure no Vercel: `VITE_API_BASE_URL=https://seu-projeto.username.replit.app`

## 🔐 Outras Variáveis de Ambiente Importantes

Lembre-se de configurar também no backend (Railway, Render, etc.):

- `JWT_SECRET` - Chave secreta para autenticação
- `ALLOWED_ORIGINS` - URL do Vercel (para CORS)
- `NODE_ENV=production`
- `PORT` (se necessário)

## 💡 Verificando se Está Funcionando

Após configurar:

1. Acesse seu site no Vercel
2. Vá para `/admin`
3. Tente fazer login
4. Se funcionar, está tudo OK! ✅

## ❓ Problemas Comuns

### "Erro ao conectar com o servidor"
- Verifique se o backend está online
- Confirme que `VITE_API_BASE_URL` está correta
- Verifique se há `https://` no início da URL

### "CORS error"
- Configure `ALLOWED_ORIGINS` no backend com a URL do Vercel
- Exemplo: `ALLOWED_ORIGINS=https://seu-site.vercel.app`

### "401 Unauthorized"
- Verifique se o `JWT_SECRET` é o mesmo no backend e no .env
