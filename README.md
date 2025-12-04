# 🎯 Fórmula Engajamento - Sistema de Analytics e Landing Page

Sistema completo de landing page com analytics avançado, painel administrativo e rastreamento de conversões.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy no Replit](#deploy-no-replit)
- [Migração entre Contas Replit](#migração-entre-contas-replit)

## 🎯 Sobre o Projeto

Sistema desenvolvido para capturar leads e analisar o comportamento de visitantes em uma landing page. Inclui:
- Landing page com vídeo integrado
- Sistema de analytics completo
- Painel administrativo para visualização de dados
- Exportação/importação de dados em Word
- Rastreamento de eventos e conversões

## 🚀 Tecnologias

### Frontend
- React 18 com TypeScript
- Vite (build tool)
- React Router DOM (navegação)
- Tailwind CSS (estilização)
- Lucide React (ícones)

### Backend
- Node.js com Express
- **SQLite** (banco de dados em arquivo - 100% portável via Git)
- JWT (autenticação)
- bcryptjs (criptografia de senhas)
- Multer (upload de arquivos)
- Mammoth (leitura de Word)
- docx (geração de Word)

## ✨ Funcionalidades

### Landing Page
- Vídeo integrado (YouTube ou outros)
- Botão de CTA com delay configurável
- Rastreamento de visualizações
- Formulário de registro de leads
- Analytics em tempo real

### Painel Administrativo
- Dashboard com métricas gerais
- Listagem de visitantes e registros
- Detalhes completos de cada visitante
- Visualização de eventos e pageviews
- Exportação de dados para Word
- Importação de dados de Word
- Configuração de vídeo da landing page

### Sistema de Analytics
- Rastreamento de visitantes únicos
- Detecção de dispositivo, navegador e OS
- Geolocalização (país, cidade, região)
- Eventos personalizados
- Tempo de permanência nas páginas
- Profundidade de scroll

## 📦 Pré-requisitos

- Node.js 18+ (incluído no Replit)
- **Apenas isso!** O banco de dados SQLite é um arquivo local (database.db)
- npm ou yarn

## ⚙️ Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd <nome-do-projeto>
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente (Opcional)

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis necessárias:

```env
# OBRIGATÓRIO: Chave secreta para JWT (gere uma aleatória)
JWT_SECRET=sua-chave-secreta-aqui

# OBRIGATÓRIO: Origens permitidas para CORS
ALLOWED_ORIGINS=http://localhost:5000,https://seu-dominio.com

# OPCIONAL: Porta do servidor backend (padrão: 3001)
PORT=3001

# OPCIONAL: Ambiente (development ou production)
NODE_ENV=development

# SEGURANÇA: Mantenha como false em produção
ALLOW_ADMIN_CREATION=false
```

**Nota:** Não é necessário configurar banco de dados! O arquivo `database.db` é criado automaticamente.

### 4. Crie um Usuário Admin

Execute o script para criar um admin:

```bash
npm run create-admin
```

Siga as instruções no terminal para definir username e senha.

### 5. Inicie o Projeto

```bash
npm run dev
```

O projeto iniciará:
- Frontend: http://localhost:5000
- Backend: http://localhost:3001

## 🎮 Como Usar

### Acessar a Landing Page
Abra o navegador em `http://localhost:5000` (ou o domínio do Replit)

### Acessar o Painel Admin
1. Acesse `http://localhost:5000/admin`
2. Faça login com as credenciais criadas
3. Explore as funcionalidades do dashboard

### Configurar o Vídeo
1. Acesse o painel admin
2. Vá em "Configurações de Vídeo"
3. Cole a URL do vídeo do YouTube
4. Configure o delay do botão
5. Salve

## 📁 Estrutura do Projeto

```
├── public/                 # Arquivos públicos estáticos
├── server/                 # Backend (Express)
│   ├── migrations/        # Migrações do banco de dados
│   │   └── init-sqlite.sql  # Schema inicial SQLite
│   └── index.js          # Servidor principal
├── database.db            # Banco de dados SQLite (versionado no Git)
├── src/                   # Frontend (React)
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilitários
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Entry point
├── scripts/              # Scripts utilitários
│   └── create-admin.js  # Script para criar admin
├── .env.example          # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── package.json         # Dependências e scripts
├── vite.config.ts       # Configuração do Vite
├── tailwind.config.js   # Configuração do Tailwind
└── README.md            # Este arquivo
```

## 🚀 Deploy no Replit

### Primeira Vez

1. **Crie um Repl no Replit**
   - Acesse replit.com
   - Clique em "Create Repl"
   - Escolha "Import from GitHub"
   - Cole a URL do seu repositório

2. **Configure as Variáveis de Ambiente (Secrets)**
   - Vá em "Tools" > "Secrets"
   - Adicione as seguintes secrets:
     - `JWT_SECRET`: Gere uma chave aleatória
     - `ALLOWED_ORIGINS`: URL do seu Repl (ex: `https://seu-projeto.username.repl.co`)
     - `NODE_ENV`: `production`

3. **Instale as Dependências**
   ```bash
   npm install
   ```

4. **Crie um Admin**
   ```bash
   npm run create-admin
   ```

5. **Inicie o Projeto**
   - Clique em "Run" ou execute `npm run dev`
   - O banco de dados `database.db` será criado automaticamente

### Publicar (Deploy)

1. Clique no botão "Publish" no topo
2. Configure o domínio customizado (opcional)
3. Seu projeto estará online!

## 🔄 Migração entre Contas Replit

Este projeto foi estruturado para ser **100% portável** entre contas Replit. Siga este guia:

### O que está versionado no Git:
✅ Todo o código fonte (frontend e backend)  
✅ **Banco de dados completo (database.db)** - TODOS os dados vêm junto!  
✅ Schema do banco de dados (migrations)  
✅ Configurações do projeto  
✅ Dependências (package.json)  
✅ Arquivos de exemplo (.env.example, CREDENCIAIS_ADMIN_EXEMPLO.txt)

### O que NÃO está versionado (por segurança):
❌ Variáveis de ambiente (.env)  
❌ Credenciais de admin (CREDENCIAIS_ADMIN.txt)  
❌ node_modules

### Passos para Migrar:

1. **Faça Fork ou Clone do Repositório**
   - No Replit: "Import from GitHub"
   - Localmente: `git clone <url>`

2. **Instale as Dependências**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**
   - Copie `.env.example` para `.env`
   - Preencha as variáveis necessárias
   - No Replit: Use o painel "Secrets" para variáveis sensíveis

4. **Crie um Usuário Admin (se necessário)**
   ```bash
   npm run create-admin
   ```
   **Nota:** Se o banco de dados já veio com admins cadastrados, pule este passo!

5. **Inicie o Projeto**
   ```bash
   npm run dev
   ```

**Pronto!** O projeto está 100% funcional na nova conta **com TODOS os dados** (clientes, analytics, configurações)!

## 📝 Scripts Disponíveis

```bash
# Iniciar servidor em desenvolvimento (frontend + backend)
npm run dev

# Iniciar apenas o backend
npm run server

# Iniciar apenas o frontend
npm run frontend

# Build de produção
npm run build

# Criar usuário admin
npm run create-admin

# Lint do código
npm run lint
```

## 🔐 Segurança

- **NUNCA** commite o arquivo `.env` ou `CREDENCIAIS_ADMIN.txt` no Git
- Use senhas fortes para admins
- Em produção, mantenha `ALLOW_ADMIN_CREATION=false`
- Mantenha `JWT_SECRET` sempre secreto e único
- Use HTTPS em produção

## 🐛 Troubleshooting

### Problemas com Banco de Dados
- O arquivo `database.db` é criado automaticamente na raiz do projeto
- Verifique se o arquivo `database.db` existe e tem permissão de escrita
- Se necessário, delete o arquivo e reinicie o servidor para recriar

### Servidor não Inicia
- Execute `npm install` novamente
- Verifique se todas as variáveis de ambiente estão configuradas
- Veja os logs para identificar o erro

### Frontend não Atualiza
- Limpe o cache do navegador (Ctrl + Shift + R)
- Verifique se o Vite está rodando na porta 5000
- Verifique os logs do workflow

## 📄 Licença

Este projeto é privado e de uso exclusivo.

## 👥 Suporte

Em caso de dúvidas ou problemas:
1. Verifique este README
2. Consulte os logs do servidor
3. Revise as configurações de ambiente

---

**Desenvolvido com ❤️ para Fórmula Engajamento**
