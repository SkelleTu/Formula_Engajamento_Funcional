# Scripts de Administração - Sistema Analytics

Este diretório contém scripts para gerenciamento de administradores no sistema.

## ⚠️ AVISO DE SEGURANÇA

**IMPORTANTE:** Estes scripts devem ser executados apenas por operadores autorizados. Nunca compartilhe senhas ou credenciais em repositórios públicos ou logs.

## Scripts Disponíveis

### 1. `test-login.js` - Diagnóstico de Login

Testa credenciais de administrador sem expor informações sensíveis.

**Uso:**
```bash
# Listar usuários existentes
node scripts/test-login.js

# Testar credenciais específicas
node scripts/test-login.js <username> <senha>
```

**Exemplo:**
```bash
node scripts/test-login.js Victor minha_senha_secreta
```

**O que faz:**
- Lista todos os usuários administradores cadastrados
- Valida se um username existe no banco de dados
- Verifica se a senha fornecida está correta (usando bcrypt)
- NÃO expõe senhas ou hashes no output

---

### 2. `reset-password-sqlite.js` - Reset de Senha

Reseta a senha de um administrador existente.

**Uso:**
```bash
node scripts/reset-password-sqlite.js <username> <nova_senha>
```

**Exemplo:**
```bash
node scripts/reset-password-sqlite.js Victor nova_senha_123
```

**O que faz:**
- Verifica se o usuário existe
- Gera um novo hash bcrypt da senha
- Atualiza o banco de dados SQLite
- Remove a flag de "requer troca de senha"

---

### 3. `create-admin.js` - Criar Admin (PostgreSQL - DEPRECATED)

⚠️ Este script é para PostgreSQL e está desatualizado. O projeto atual usa SQLite.

---

## Banco de Dados

O sistema usa **SQLite** armazenado em `./database.db`.

**Tabela admins:**
- `id` - ID único do administrador
- `username` - Nome de usuário (único)
- `password_hash` - Hash bcrypt da senha
- `requires_password_change` - Flag se precisa trocar senha (0 ou 1)
- `created_at` - Data de criação

## Contas Ativas

Atualmente existem 2 administradores:
1. **Victor** (criado em 2025-11-07)
2. **JULIAOCALORI** (criado em 2025-11-14)

## Segurança

### ✅ Boas Práticas:
- Sempre use senhas fortes (mínimo 8 caracteres, mistura de letras, números e símbolos)
- Nunca compartilhe credenciais via chat, email ou repositórios
- Execute scripts apenas em ambientes seguros
- Mantenha backups regulares do database.db

### ❌ NUNCA faça:
- Commitar senhas em código
- Compartilhar credenciais em texto plano
- Executar scripts em ambientes não confiáveis
- Logar senhas ou hashes em arquivos

## Acesso ao Painel

Após configurar as credenciais, acesse:
- **Desenvolvimento:** `/admin/login`
- **Produção:** `https://seu-dominio.com/admin/login`
