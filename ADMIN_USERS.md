# Usuários Administrativos

Este documento contém informações sobre os usuários administrativos configurados no sistema.

## Usuários Criados

### 1. Victor (Permanente)
- **Username:** Victor
- **Senha:** Victor.!.1999
- **Status:** Ativo e configurado
- **Acesso:** Pode fazer login diretamente no painel admin

### 2. Julio (Senha Temporária)
- **Username:** Julio
- **Senha Temporária:** JulioTemp2024!
- **Status:** Requer troca de senha no primeiro acesso
- **Acesso:** No primeiro login, será solicitado que defina uma senha permanente

## Como Acessar o Painel Admin

1. Navegue até `/admin` na aplicação
2. Insira seu username e senha
3. Se for o primeiro acesso do Julio, defina uma nova senha permanente

## Trocar Senha (Para Victor ou Julio após primeiro acesso)

Caso queira trocar a senha após já ter acesso:
1. Faça logout do painel admin
2. Entre novamente com as credenciais atuais
3. Um endpoint `/api/admin/change-password` está disponível para troca de senha

## Segurança

- As senhas são armazenadas com hash bcrypt (10 rounds)
- Tokens JWT com validade de 7 dias
- Cookies HTTP-only para maior segurança
- Senha mínima de 6 caracteres

## Modificar Usuários

Para adicionar ou modificar usuários admin, utilize o script:
```bash
node scripts/setup-admin-users.js
```

Este script permite criar ou atualizar usuários admin de forma segura.
