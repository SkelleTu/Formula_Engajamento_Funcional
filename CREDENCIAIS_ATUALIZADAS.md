# ✅ Credenciais de Login - Sistema Analytics

**Data de atualização:** 14 de Novembro de 2025

## 👥 Contas Administrativas Ativas

### Conta 1 - Victor
- **Usuário:** `Victor`
- **Senha:** `Victor.!.1999`
- **Status:** ✅ Funcionando
- **Criado em:** 2025-11-07

### Conta 2 - Julio Calori
- **Usuário:** `JULIAOCALORI` ⚠️ (com IA, não JULIOCALORI)
- **Senha:** `FOCO20K`
- **Status:** ✅ Funcionando
- **Criado em:** 2025-11-14
- **Última atualização:** 2025-11-14 (senha resetada)

## 🔐 Acesso ao Painel

**URL de Login:** `/admin/login`

## ⚠️ Importante

1. **Nome de usuário case-sensitive:** Digite exatamente como está acima
2. **Senha case-sensitive:** Maiúsculas e minúsculas importam
3. **JULIAOCALORI** tem "IA" no meio (não é JULIOCALORI)

## 🛠️ Scripts Disponíveis

### Testar Credenciais
```bash
node scripts/test-login.js <usuario> <senha>
```

### Resetar Senha
```bash
node scripts/reset-password-sqlite.js <usuario> <nova_senha>
```

### Ver Documentação Completa
Consulte `scripts/README.md` para mais detalhes sobre os scripts de administração.

## 🔒 Segurança

**NUNCA:**
- Compartilhe este arquivo publicamente
- Commite senhas no Git
- Envie credenciais por email/chat não criptografado

**SEMPRE:**
- Mantenha backups do database.db
- Use senhas fortes
- Troque senhas periodicamente
- Restrinja acesso apenas a administradores autorizados
