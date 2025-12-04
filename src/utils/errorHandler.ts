import { ErrorDetails } from '../components/ErrorToast';

export class ErrorHandler {
  static async handleFetchError(
    error: any,
    location: string,
    requestInfo?: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: any;
    },
    response?: Response
  ): Promise<ErrorDetails> {
    const timestamp = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    let responseHeaders: Record<string, string> | undefined;
    let responseBody: any;
    let statusCode: number | undefined;

    // Capturar detalhes da resposta se disponível
    if (response) {
      statusCode = response.status;
      
      // Capturar headers da resposta
      responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders![key] = value;
      });

      // Tentar capturar o body da resposta
      try {
        const clonedResponse = response.clone();
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          responseBody = await clonedResponse.json();
        } else {
          responseBody = await clonedResponse.text();
        }
      } catch (e) {
        responseBody = '[Não foi possível ler o corpo da resposta]';
      }
    }

    // Detectar tipo de erro
    let networkError: string | undefined;
    let redirectError: string | undefined;
    let corsError = false;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      networkError = `Falha na conexão: ${error.message}`;
      
      // Detectar CORS
      if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
        corsError = true;
        networkError += '\n⚠️ Possível erro de CORS - O servidor está bloqueando a requisição.';
      }
    }

    if (error.message?.includes('redirect')) {
      redirectError = error.message;
    }

    // Capturar stack trace
    let stack = error.stack;
    if (!stack && error instanceof Error) {
      stack = new Error().stack;
    }

    const errorDetails: ErrorDetails = {
      message: error.message || 'Erro desconhecido',
      timestamp,
      location,
      stack,
      statusCode,
      url: requestInfo?.url,
      method: requestInfo?.method,
      requestHeaders: requestInfo?.headers,
      responseHeaders,
      requestBody: requestInfo?.body,
      responseBody,
      networkError,
      redirectError,
      corsError,
      additionalInfo: {
        errorName: error.name,
        errorType: error.constructor.name,
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        timestamp: Date.now(),
      },
    };

    return errorDetails;
  }

  static createErrorDetails(
    message: string,
    location: string,
    additionalInfo?: Partial<ErrorDetails>
  ): ErrorDetails {
    const timestamp = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return {
      message,
      timestamp,
      location,
      stack: new Error().stack,
      additionalInfo: {
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        timestamp: Date.now(),
      },
      ...additionalInfo,
    };
  }

  static async enhancedFetch(
    url: string,
    options: RequestInit = {},
    location: string
  ): Promise<Response> {
    // Preparar body para logging - só parsear se soubermos que é JSON
    let parsedBodyForLogging;
    if (options.body) {
      const contentType = (options.headers as Record<string, string>)?.['Content-Type'] || 
                         (options.headers as Record<string, string>)?.['content-type'];
      
      if (contentType?.includes('application/json') && typeof options.body === 'string') {
        try {
          parsedBodyForLogging = JSON.parse(options.body);
        } catch {
          parsedBodyForLogging = options.body;
        }
      } else {
        parsedBodyForLogging = options.body;
      }
    }

    const requestInfo = {
      url,
      method: options.method || 'GET',
      headers: options.headers as Record<string, string>,
      body: parsedBodyForLogging,
    };

    console.log(`%c🌐 REQUISIÇÃO: ${requestInfo.method} ${url}`, 'color: #3b82f6; font-weight: bold');
    console.log('Headers:', requestInfo.headers);
    if (requestInfo.body) {
      console.log('Body:', requestInfo.body);
    }

    try {
      const response = await fetch(url, options);

      console.log(`%c📥 RESPOSTA: ${response.status} ${response.statusText}`, 
        response.ok ? 'color: #10b981; font-weight: bold' : 'color: #ef4444; font-weight: bold'
      );

      if (!response.ok) {
        // Clonar a resposta ANTES de consumir para não estragar o original
        const clonedResponse = response.clone();
        const errorDetails = await ErrorHandler.handleFetchError(
          new Error(`HTTP ${response.status}: ${response.statusText}`),
          location,
          requestInfo,
          clonedResponse
        );
        // Não jogar a resposta original - apenas errorDetails
        throw { errorDetails };
      }

      return response;
    } catch (error: any) {
      // Se já temos errorDetails, re-throw como está
      if (error.errorDetails) {
        throw error;
      }

      // Criar errorDetails para outros tipos de erro (network, etc)
      const errorDetails = await ErrorHandler.handleFetchError(
        error,
        location,
        requestInfo
      );
      throw { errorDetails };
    }
  }
}
