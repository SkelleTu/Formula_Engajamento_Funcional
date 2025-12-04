# Sistema de Captura e Exibição de Erros Detalhados

## 📋 Visão Geral

Sistema completo de captura, análise e exibição de erros técnicos detalhados para facilitar o debug e resolução de problemas.

## 🎯 Funcionalidades

### 1. **ErrorToast Component** (`src/components/ErrorToast.tsx`)
Componente visual que exibe erros em um balão no canto superior direito da tela.

**Recursos:**
- ✅ Exibição detalhada de erros com todas as informações técnicas
- ✅ Stack traces completos
- ✅ Headers de requisição e resposta
- ✅ Body da requisição e resposta
- ✅ Detecção automática de tipo de erro (CORS, Network, Redirect, etc)
- ✅ Sugestões inteligentes de solução baseadas no erro
- ✅ Botão para copiar todos os detalhes do erro
- ✅ Interface expansível/colapsável para economizar espaço
- ✅ Animações suaves e design responsivo

### 2. **ErrorContext** (`src/contexts/ErrorContext.tsx`)
Contexto React global para gerenciamento de erros em toda a aplicação.

**API:**
```typescript
const { showError, clearError } = useError();

// Mostrar erro
showError(errorDetails);

// Limpar erro
clearError();
```

### 3. **ErrorHandler Utility** (`src/utils/errorHandler.ts`)
Utilitário para captura e processamento avançado de erros.

**Métodos principais:**

#### `ErrorHandler.enhancedFetch(url, options, location)`
Substitui o `fetch` padrão com captura automática de erros detalhados.

```typescript
const response = await ErrorHandler.enhancedFetch(
  apiUrl('/api/endpoint'),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  },
  'ComponentName.methodName'
);
```

**Captura automaticamente:**
- Status HTTP e códigos de erro
- Headers de requisição e resposta
- Body completo de requisição e resposta
- Erros de rede (Network errors)
- Erros de CORS
- Erros de redirecionamento
- Stack traces completos

#### `ErrorHandler.handleFetchError(error, location, requestInfo, response)`
Processa erros de fetch e cria objetos `ErrorDetails` estruturados.

#### `ErrorHandler.createErrorDetails(message, location, additionalInfo)`
Cria objetos `ErrorDetails` para erros customizados.

## 🚀 Como Usar

### Passo 1: Wrap sua aplicação com ErrorProvider

Já está implementado no `App.tsx`:

```typescript
import { ErrorProvider } from './contexts/ErrorContext';

function App() {
  return (
    <ErrorProvider>
      {/* Sua aplicação aqui */}
    </ErrorProvider>
  );
}
```

### Passo 2: Use em componentes

```typescript
import { useError } from '../contexts/ErrorContext';
import { ErrorHandler } from '../utils/errorHandler';

function MyComponent() {
  const { showError } = useError();

  const handleAction = async () => {
    try {
      const response = await ErrorHandler.enhancedFetch(
        apiUrl('/api/action'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: 'example' })
        },
        'MyComponent.handleAction'
      );
      
      const data = await response.json();
      // Processar resposta...
    } catch (err: any) {
      if (err.errorDetails) {
        showError(err.errorDetails);
      } else {
        const errorDetails = ErrorHandler.createErrorDetails(
          err.message || 'Erro desconhecido',
          'MyComponent.handleAction',
          { additionalContext: 'informação extra' }
        );
        showError(errorDetails);
      }
    }
  };

  return <button onClick={handleAction}>Fazer Ação</button>;
}
```

## 📊 Estrutura de ErrorDetails

```typescript
interface ErrorDetails {
  message: string;                        // Mensagem do erro
  timestamp: string;                      // Data/hora do erro
  location: string;                       // Local onde ocorreu
  stack?: string;                         // Stack trace
  statusCode?: number;                    // Código HTTP (se aplicável)
  url?: string;                           // URL da requisição
  method?: string;                        // Método HTTP
  requestHeaders?: Record<string, string>; // Headers da requisição
  responseHeaders?: Record<string, string>; // Headers da resposta
  requestBody?: any;                      // Body da requisição
  responseBody?: any;                     // Body da resposta
  networkError?: string;                  // Descrição de erro de rede
  redirectError?: string;                 // Descrição de erro de redirect
  corsError?: boolean;                    // Flag de erro CORS
  additionalInfo?: Record<string, any>;   // Info adicional
}
```

## 🎨 Interface do ErrorToast

Quando um erro é exibido, o usuário vê:

1. **Header**: Título com ícone de alerta pulsante e timestamp
2. **Mensagem Principal**: Descrição do erro
3. **Localização**: Onde o erro ocorreu no código
4. **Detalhes da Requisição**: URL, método, status code
5. **Erros Específicos**: Network, CORS, Redirect (se aplicável)
6. **Detalhes Técnicos Expandíveis**:
   - Request/Response Headers
   - Request/Response Body
   - Stack Trace completo
   - Informações adicionais
7. **Solução Sugerida**: Análise inteligente com passos para resolver
8. **Botão Copiar**: Copia todos os detalhes formatados para a área de transferência

## 🔍 Análise Inteligente de Erros

O sistema analisa automaticamente os erros e sugere soluções:

- **401**: Credenciais inválidas ou sessão expirada
- **403**: Acesso negado
- **404**: Endpoint não encontrado
- **500+**: Erro no servidor
- **Network Error**: Problemas de conexão
- **CORS Error**: Configuração de CORS necessária
- **Redirect Error**: Problemas com redirecionamentos

## 🧪 Testando o Sistema

Para testar, tente fazer login com credenciais inválidas ou force um erro de rede. O sistema automaticamente:

1. Captura o erro
2. Processa todos os detalhes técnicos
3. Exibe o balão de erro com todas as informações
4. Permite copiar para colar aqui no chat

## 📝 Exemplo de Erro Copiado

Quando o usuário clicar em "Copiar Tudo", será copiado algo assim:

```
═══════════════════════════════════════════════════════════
🔴 ERRO DETALHADO - FÓRMULA ENGAJAMENTO ANALYTICS
═══════════════════════════════════════════════════════════

📅 TIMESTAMP: 25/11/2025, 16:45:32
📍 LOCALIZAÇÃO: AdminLoginPage.handleSubmit
💬 MENSAGEM: HTTP 401: Unauthorized

📊 STATUS HTTP: 401
🌐 URL: http://localhost:3001/api/admin/login
📤 MÉTODO: POST

📤 REQUEST HEADERS:
{
  "Content-Type": "application/json"
}

📥 RESPONSE BODY:
{
  "error": "Credenciais inválidas"
}

═══════════════════════════════════════════════════════════
🔧 O QUE FAZER:
═══════════════════════════════════════════════════════════

✓ Credenciais inválidas - Verifique usuário e senha
✓ Sessão expirada - Faça login novamente
```

## ✅ Status da Implementação

- ✅ Componente ErrorToast criado
- ✅ ErrorContext implementado
- ✅ ErrorHandler utility criado
- ✅ Integrado no AdminLoginPage
- ✅ Integrado no App.tsx
- ✅ CSS de animações adicionado
- ✅ Captura de erros de login
- ✅ Captura de erros de mudança de senha
- ✅ Análise inteligente de erros
- ✅ Sugestões de solução automáticas

## 🎯 Próximos Passos (Opcional)

Você pode expandir o sistema para:
- Adicionar captura de erros no AdminDashboard
- Integrar com sistema de logging remoto
- Adicionar notificações de erro por email
- Criar histórico de erros
- Adicionar filtros e busca de erros
