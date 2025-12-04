import { X, Copy, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface ErrorDetails {
  message: string;
  timestamp: string;
  location: string;
  stack?: string;
  statusCode?: number;
  url?: string;
  method?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  networkError?: string;
  redirectError?: string;
  corsError?: boolean;
  additionalInfo?: Record<string, any>;
}

interface ErrorToastProps {
  error: ErrorDetails;
  onClose: () => void;
}

export default function ErrorToast({ error, onClose }: ErrorToastProps) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const errorText = `
═══════════════════════════════════════════════════════════
🔴 ERRO DETALHADO - FÓRMULA ENGAJAMENTO ANALYTICS
═══════════════════════════════════════════════════════════

📅 TIMESTAMP: ${error.timestamp}
📍 LOCALIZAÇÃO: ${error.location}
💬 MENSAGEM: ${error.message}

${error.statusCode ? `📊 STATUS HTTP: ${error.statusCode}` : ''}
${error.url ? `🌐 URL: ${error.url}` : ''}
${error.method ? `📤 MÉTODO: ${error.method}` : ''}

${error.networkError ? `
🌐 ERRO DE REDE:
${error.networkError}
` : ''}

${error.redirectError ? `
↪️ ERRO DE REDIRECIONAMENTO:
${error.redirectError}
` : ''}

${error.corsError ? `
🚫 ERRO DE CORS DETECTADO!
O servidor está bloqueando requisições cross-origin.
Verifique as configurações de CORS no backend.
` : ''}

${error.requestHeaders ? `
📤 REQUEST HEADERS:
${JSON.stringify(error.requestHeaders, null, 2)}
` : ''}

${error.responseHeaders ? `
📥 RESPONSE HEADERS:
${JSON.stringify(error.responseHeaders, null, 2)}
` : ''}

${error.requestBody ? `
📤 REQUEST BODY:
${JSON.stringify(error.requestBody, null, 2)}
` : ''}

${error.responseBody ? `
📥 RESPONSE BODY:
${JSON.stringify(error.responseBody, null, 2)}
` : ''}

${error.stack ? `
📚 STACK TRACE:
${error.stack}
` : ''}

${error.additionalInfo ? `
ℹ️ INFORMAÇÕES ADICIONAIS:
${JSON.stringify(error.additionalInfo, null, 2)}
` : ''}

═══════════════════════════════════════════════════════════
🔧 O QUE FAZER:
═══════════════════════════════════════════════════════════

${getErrorSolution(error)}

═══════════════════════════════════════════════════════════
`;
    
    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-2xl animate-slide-in">
      <div className="bg-red-900/95 backdrop-blur-lg border-2 border-red-500 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-300 animate-pulse" />
            <div>
              <h3 className="text-white font-bold text-lg">Erro Detectado!</h3>
              <p className="text-red-200 text-xs">{error.timestamp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors p-1 hover:bg-red-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-4 text-white max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            {/* Mensagem Principal */}
            <div className="bg-red-800/50 rounded-lg p-3 border border-red-600">
              <p className="font-semibold text-yellow-300 mb-1">💬 Mensagem:</p>
              <p className="text-white">{error.message}</p>
            </div>

            {/* Localização */}
            <div className="bg-red-800/50 rounded-lg p-3 border border-red-600">
              <p className="font-semibold text-yellow-300 mb-1">📍 Local do Erro:</p>
              <p className="text-white font-mono text-sm">{error.location}</p>
            </div>

            {/* Detalhes HTTP */}
            {(error.statusCode || error.url || error.method) && (
              <div className="bg-red-800/50 rounded-lg p-3 border border-red-600">
                <p className="font-semibold text-yellow-300 mb-2">🌐 Detalhes da Requisição:</p>
                <div className="space-y-1 text-sm font-mono">
                  {error.method && <p><span className="text-red-300">Método:</span> {error.method}</p>}
                  {error.statusCode && <p><span className="text-red-300">Status:</span> {error.statusCode}</p>}
                  {error.url && <p className="break-all"><span className="text-red-300">URL:</span> {error.url}</p>}
                </div>
              </div>
            )}

            {/* Erros Específicos */}
            {error.networkError && (
              <div className="bg-orange-900/50 rounded-lg p-3 border border-orange-600">
                <p className="font-semibold text-orange-300 mb-1">🌐 Erro de Rede:</p>
                <p className="text-white text-sm">{error.networkError}</p>
              </div>
            )}

            {error.redirectError && (
              <div className="bg-orange-900/50 rounded-lg p-3 border border-orange-600">
                <p className="font-semibold text-orange-300 mb-1">↪️ Erro de Redirecionamento:</p>
                <p className="text-white text-sm">{error.redirectError}</p>
              </div>
            )}

            {error.corsError && (
              <div className="bg-purple-900/50 rounded-lg p-3 border border-purple-600">
                <p className="font-semibold text-purple-300 mb-1">🚫 Erro de CORS:</p>
                <p className="text-white text-sm">O servidor está bloqueando requisições cross-origin.</p>
              </div>
            )}

            {/* Detalhes Técnicos Expandíveis */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full bg-red-800/50 rounded-lg p-3 border border-red-600 flex items-center justify-between hover:bg-red-800/70 transition-colors"
            >
              <p className="font-semibold text-yellow-300">🔧 Detalhes Técnicos Completos</p>
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {expanded && (
              <div className="space-y-2">
                {error.requestHeaders && (
                  <div className="bg-gray-900/50 rounded p-2 border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Request Headers:</p>
                    <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(error.requestHeaders, null, 2)}</pre>
                  </div>
                )}

                {error.responseHeaders && (
                  <div className="bg-gray-900/50 rounded p-2 border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Response Headers:</p>
                    <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(error.responseHeaders, null, 2)}</pre>
                  </div>
                )}

                {error.requestBody && (
                  <div className="bg-gray-900/50 rounded p-2 border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Request Body:</p>
                    <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(error.requestBody, null, 2)}</pre>
                  </div>
                )}

                {error.responseBody && (
                  <div className="bg-gray-900/50 rounded p-2 border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Response Body:</p>
                    <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(error.responseBody, null, 2)}</pre>
                  </div>
                )}

                {error.stack && (
                  <div className="bg-gray-900/50 rounded p-2 border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Stack Trace:</p>
                    <pre className="text-xs text-white overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}

                {error.additionalInfo && (
                  <div className="bg-gray-900/50 rounded p-2 border border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Informações Adicionais:</p>
                    <pre className="text-xs text-white overflow-x-auto">{JSON.stringify(error.additionalInfo, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Solução Sugerida */}
            <div className="bg-green-900/30 rounded-lg p-3 border border-green-600">
              <p className="font-semibold text-green-300 mb-2">💡 O que fazer:</p>
              <div className="text-white text-sm space-y-1">
                {getErrorSolution(error).split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botão de copiar */}
        <div className="bg-red-800 px-4 py-3 flex items-center justify-between">
          <p className="text-red-200 text-sm">Copie este erro e envie para o desenvolvedor</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copiado!' : 'Copiar Tudo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getErrorSolution(error: ErrorDetails): string {
  // Análise inteligente do erro para sugerir soluções
  const solutions: string[] = [];

  if (error.statusCode === 401) {
    solutions.push('✓ Credenciais inválidas - Verifique usuário e senha');
    solutions.push('✓ Sessão expirada - Faça login novamente');
  } else if (error.statusCode === 403) {
    solutions.push('✓ Acesso negado - Você não tem permissão');
  } else if (error.statusCode === 404) {
    solutions.push('✓ Endpoint não encontrado - Verifique a URL da API');
    solutions.push('✓ Backend pode estar offline');
  } else if (error.statusCode === 500) {
    solutions.push('✓ Erro interno do servidor - Problema no backend');
    solutions.push('✓ Verifique os logs do servidor');
  } else if (error.statusCode && error.statusCode >= 500) {
    solutions.push('✓ Servidor com problemas - Tente novamente mais tarde');
  }

  if (error.networkError) {
    solutions.push('✓ Problema de conexão - Verifique sua internet');
    solutions.push('✓ Servidor pode estar offline ou inacessível');
    solutions.push('✓ Verifique se o backend está rodando');
  }

  if (error.corsError) {
    solutions.push('✓ Configure CORS no backend para aceitar requisições');
    solutions.push('✓ Adicione o domínio às origens permitidas');
  }

  if (error.redirectError) {
    solutions.push('✓ Problema com redirecionamento - Verifique as rotas');
    solutions.push('✓ Certifique-se que o endpoint de redirect existe');
  }

  if (error.message?.includes('fetch')) {
    solutions.push('✓ Verifique se a URL da API está correta');
    solutions.push('✓ Confirme que o servidor backend está rodando');
  }

  if (solutions.length === 0) {
    solutions.push('✓ Copie este erro completo e envie para análise');
    solutions.push('✓ Verifique os logs do servidor e do navegador');
    solutions.push('✓ Tente limpar cache e cookies');
  }

  return solutions.join('\n');
}
