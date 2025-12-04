/**
 * Sistema de logging detalhado para debugging de produção
 * Captura TODOS os detalhes de requisições HTTP para facilitar debugging
 */

interface LogData {
  timestamp: string;
  environment: string;
  apiBaseUrl: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data?: any;
  };
  error?: {
    message: string;
    type: string;
    stack?: string;
  };
  timing: {
    start: number;
    end?: number;
    duration?: number;
  };
}

export class HttpLogger {
  private static logs: LogData[] = [];

  /**
   * Fetch com logging detalhado
   */
  static async loggedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const startTime = Date.now();
    
    const logData: LogData = {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.PROD ? 'PRODUCTION (Vercel)' : 'DEVELOPMENT (Replit)',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '(usando proxy Vite)',
      url: url,
      method: options.method || 'GET',
      headers: this.sanitizeHeaders(options.headers),
      body: this.sanitizeBody(options.body),
      timing: {
        start: startTime
      }
    };

    console.log('%c🔍 [HTTP REQUEST] Iniciando requisição', 'color: #2563eb; font-weight: bold');
    console.log('┌─ Detalhes da Requisição ─────────────────────────────');
    console.log('│ Timestamp:', logData.timestamp);
    console.log('│ Ambiente:', logData.environment);
    console.log('│ API Base URL:', logData.apiBaseUrl);
    console.log('│ URL Completa:', logData.url);
    console.log('│ Método:', logData.method);
    console.log('│ Headers:', logData.headers);
    if (logData.body) {
      console.log('│ Body:', logData.body);
    }
    console.log('└───────────────────────────────────────────────────────');

    try {
      const response = await fetch(url, options);
      const endTime = Date.now();
      
      logData.timing.end = endTime;
      logData.timing.duration = endTime - startTime;

      // Tentar ler o corpo da resposta
      const contentType = response.headers.get('content-type');
      let responseData;
      
      try {
        if (contentType?.includes('application/json')) {
          responseData = await response.clone().json();
        } else {
          responseData = await response.clone().text();
        }
      } catch (e) {
        responseData = '(não foi possível ler corpo da resposta)';
      }

      logData.response = {
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(response.headers),
        data: responseData
      };

      const isError = response.status >= 400;
      const color = isError ? '#dc2626' : '#16a34a';
      const icon = isError ? '❌' : '✅';

      console.log(`%c${icon} [HTTP RESPONSE] ${response.status} ${response.statusText}`, `color: ${color}; font-weight: bold`);
      console.log('┌─ Detalhes da Resposta ────────────────────────────────');
      console.log('│ Status:', response.status, response.statusText);
      console.log('│ Duração:', logData.timing.duration + 'ms');
      console.log('│ Headers da Resposta:', logData.response.headers);
      console.log('│ Corpo da Resposta:', responseData);
      console.log('└───────────────────────────────────────────────────────');

      // Verificações específicas para CORS e Cookies
      if (isError) {
        this.diagnoseCORSAndCookies(logData);
      }

      this.logs.push(logData);
      this.checkLogLimit();

      return response;

    } catch (error: any) {
      const endTime = Date.now();
      logData.timing.end = endTime;
      logData.timing.duration = endTime - startTime;

      logData.error = {
        message: error.message,
        type: error.name,
        stack: error.stack
      };

      console.log('%c💥 [HTTP ERROR] Falha na requisição', 'color: #dc2626; font-weight: bold; font-size: 14px');
      console.log('┌─ Detalhes do Erro ────────────────────────────────────');
      console.log('│ Tipo:', error.name);
      console.log('│ Mensagem:', error.message);
      console.log('│ Duração até falha:', logData.timing.duration + 'ms');
      console.log('└───────────────────────────────────────────────────────');

      // Diagnóstico específico de erros de rede
      this.diagnoseNetworkError(error, logData);

      this.logs.push(logData);
      this.checkLogLimit();

      throw error;
    }
  }

  /**
   * Diagnóstico de problemas CORS e Cookies
   */
  private static diagnoseCORSAndCookies(logData: LogData) {
    console.log('%c🔬 [DIAGNÓSTICO] Analisando possíveis problemas...', 'color: #f59e0b; font-weight: bold');
    
    // Verificar CORS headers
    const corsHeaders = logData.response?.headers;
    if (corsHeaders) {
      console.log('┌─ Análise CORS ────────────────────────────────────────');
      console.log('│ Access-Control-Allow-Origin:', corsHeaders['access-control-allow-origin'] || '❌ AUSENTE');
      console.log('│ Access-Control-Allow-Credentials:', corsHeaders['access-control-allow-credentials'] || '❌ AUSENTE');
      console.log('│ Access-Control-Allow-Methods:', corsHeaders['access-control-allow-methods'] || '❌ AUSENTE');
      console.log('└───────────────────────────────────────────────────────');
    }

    // Verificar cookies
    console.log('┌─ Análise de Cookies ──────────────────────────────────');
    const cookies = document.cookie;
    console.log('│ Cookies atuais:', cookies || '❌ NENHUM COOKIE');
    console.log('│ Set-Cookie na resposta:', corsHeaders?.['set-cookie'] || '❌ NÃO DEFINIDO');
    console.log('└───────────────────────────────────────────────────────');

    // Verificar se é cross-origin
    const isCrossOrigin = logData.apiBaseUrl && logData.apiBaseUrl !== '(usando proxy Vite)';
    if (isCrossOrigin) {
      console.log('┌─ Configuração Cross-Origin ───────────────────────────');
      console.log('│ ⚠️  REQUISIÇÃO CROSS-ORIGIN DETECTADA');
      console.log('│ Frontend URL:', window.location.origin);
      console.log('│ Backend URL:', logData.apiBaseUrl);
      console.log('│');
      console.log('│ Para funcionar, o backend precisa:');
      console.log('│ 1. ALLOWED_ORIGINS incluir:', window.location.origin);
      console.log('│ 2. Cookies com sameSite: "none" e secure: true');
      console.log('│ 3. CORS headers corretos (Access-Control-Allow-*)');
      console.log('└───────────────────────────────────────────────────────');
    }
  }

  /**
   * Diagnóstico de erros de rede
   */
  private static diagnoseNetworkError(error: any, logData: LogData) {
    console.log('┌─ Análise do Erro de Rede ─────────────────────────────');
    
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.log('│ 🔴 ERRO DE CONEXÃO');
      console.log('│');
      console.log('│ Possíveis causas:');
      console.log('│ 1. Backend offline ou inacessível');
      console.log('│ 2. CORS bloqueando a requisição');
      console.log('│ 3. URL incorreta ou inválida');
      console.log('│ 4. Firewall ou rede bloqueando');
      console.log('│');
      console.log('│ Verifique:');
      console.log('│ - Backend está rodando?', logData.apiBaseUrl);
      console.log('│ - VITE_API_BASE_URL está correto?');
      console.log('│ - CORS configurado no backend?');
    } else if (error.message.includes('NetworkError')) {
      console.log('│ 🔴 ERRO DE REDE');
      console.log('│ A requisição foi bloqueada antes de chegar ao servidor');
    }
    
    console.log('└───────────────────────────────────────────────────────');
  }

  /**
   * Sanitiza headers removendo informações sensíveis
   */
  private static sanitizeHeaders(headers: any): Record<string, string> {
    if (!headers) return {};
    
    const sanitized: Record<string, string> = {};
    const headersObj = headers instanceof Headers ? 
      Object.fromEntries(headers.entries()) : headers;
    
    for (const [key, value] of Object.entries(headersObj)) {
      if (key.toLowerCase() === 'authorization') {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = String(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitiza body removendo senhas
   */
  private static sanitizeBody(body: any): any {
    if (!body) return undefined;
    
    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      const sanitized = { ...parsed };
      
      if (sanitized.password) sanitized.password = '***REDACTED***';
      if (sanitized.currentPassword) sanitized.currentPassword = '***REDACTED***';
      if (sanitized.newPassword) sanitized.newPassword = '***REDACTED***';
      
      return sanitized;
    } catch (e) {
      return '(não foi possível sanitizar)';
    }
  }

  /**
   * Extrai headers de uma resposta
   */
  private static extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Limita o número de logs armazenados
   */
  private static checkLogLimit() {
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }

  /**
   * Obtém todos os logs
   */
  static getLogs(): LogData[] {
    return [...this.logs];
  }

  /**
   * Exporta logs como JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Limpa todos os logs
   */
  static clearLogs() {
    this.logs = [];
    console.log('🗑️  Logs limpos');
  }
}

// Exportar para uso global no console
if (typeof window !== 'undefined') {
  (window as any).httpLogger = HttpLogger;
  console.log('%c📊 HttpLogger disponível', 'color: #10b981; font-weight: bold');
  console.log('Use window.httpLogger.getLogs() para ver todos os logs');
  console.log('Use window.httpLogger.exportLogs() para exportar como JSON');
}
