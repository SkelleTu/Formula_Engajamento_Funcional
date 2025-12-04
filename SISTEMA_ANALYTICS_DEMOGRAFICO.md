# Sistema de Analytics Demográfico - Coleta Passiva e Invisível

## 🎯 Visão Geral

Implementamos um **sistema robusto de inferência demográfica** que coleta dados de forma **totalmente passiva e invisível**, sem questionários ou modals.

## 🔧 Arquitetura do Sistema

### 1. Coleta de Sinais (Client-Side)

**Device Fingerprinting** usando FingerprintJS:
- Fingerprint único do dispositivo
- Timezone e linguagem
- Resolução de tela e profundidade de cor
- Hardware (CPU cores, memória)
- Plataforma e suporte a touch
- Cookies e DoNotTrack

**Sinais Comportamentais**:
- Horário de acesso (hora do dia, dia da semana)
- Horário comercial vs não-comercial
- Dia útil vs fim de semana
- Referrer e landing page
- Duração de sessão e scroll depth (coletado continuamente)

### 2. Processamento no Servidor

**Motor de Inferência Heurística** (v1.0):

**Idade**:
- Acesso madrugada (0h-6h) → Mais jovem (18-24)
- Acesso noite (22h+) → Jovem (25-34)
- Acesso manhã cedo (6h-9h) → Adulto trabalhador (35+)
- Hardware high-end → Adulto com renda (35-54)
- Mobile de tela pequena → Mais jovem

**Ocupação**:
- Desktop + horário comercial + dia útil → Profissional/Empregado
- Hardware avançado → Profissional qualificado
- Outros padrões → Employee/Freelancer

**Educação**:
- Hardware high-end (8+ cores CPU, 8+ GB RAM) → Graduate/Postgraduate
- Desktop profissional → Undergraduate+
- Outros → Inferência baseada em ocupação

**Interesses**:
- Landing page "/" → Marketing, Entrepreneurship, Social Media
- Tempo gasto em páginas específicas → Interesses correlacionados

**Confiança**:
- Score de confiança baseado em múltiplos sinais
- Apenas inferências com confiança > 30% são salvas
- Máximo de 70% de confiança para heurísticas (vs 90%+ para ML futuro)

### 3. Armazenamento em Banco de Dados

**Tabelas SQLite**:

1. `visitor_signals` - Sinais brutos coletados
2. `inferred_demographics` - Inferências com score de confiança
3. `visitors` - Dados consolidados com melhor inferência

**Vantagens**:
- Rastreabilidade completa (sinais → inferência)
- Versionamento de algoritmos
- Histórico de evoluções das inferências
- Possibilidade de treinar ML no futuro

## 📊 Integração com Google Analytics 4

**Tracking Automático**:
- Inicialização automática no App.tsx
- Page view tracking com React Router
- Eventos customizados de demografia enviados ao GA4
- User properties configuradas para segmentação

**Eventos Rastreados**:
- `user_demographics` - Quando inferência é concluída
- `video_progress` - Progresso do vídeo
- `conversion` - Registros/cadastros
- Page views automáticos em mudanças de rota

## 🔐 Privacidade e LGPD

**Medidas Implementadas**:
- ✅ Coleta passiva sem questionários invasivos
- ✅ Fingerprint hash antes de armazenar
- ✅ Anonimização de IPs
- ✅ Gênero não é inferido (privacidade)
- ✅ Dados agregados para reporting
- ✅ Opt-out através de DoNotTrack header

**Próximos Passos de Compliance**:
- [ ] Banner de consentimento de cookies
- [ ] Política de privacidade clara
- [ ] DPIA (Data Protection Impact Assessment)
- [ ] Documentação de legal basis (legítimo interesse)

## 🚀 Como Funciona (Fluxo Completo)

1. **Visitante acessa o site**
2. **FingerprintJS coleta sinais do dispositivo** (invisível)
3. **Sistema coleta sinais comportamentais** (horário, navegação)
4. **Envia dados para `/api/analytics/signals`**
5. **Servidor executa motor de inferência heurística**
6. **Salva sinais brutos + inferências no SQLite**
7. **Se confiança > 30%: atualiza dados do visitante**
8. **Envia eventos para Google Analytics 4**
9. **Dashboard admin mostra métricas demográficas**

## 📈 Métricas Disponíveis

**Dashboard Interno (SQLite)**:
- Total de visitantes
- Distribuição por faixa etária
- Ocupação predominante
- Nível de educação
- Interesses principais
- Score de confiança médio

**Google Analytics 4**:
- Audiência segmentada por demographics
- User properties customizadas
- Funil de conversão por perfil
- Engajamento por segmento

## 🔮 Evolução Futura

**Fase 2 - Machine Learning**:
- Treinar modelo com dados coletados
- Logistic Regression ou XGBoost
- Aumentar confiança para 85-95%
- Adicionar mais features comportamentais

**Fase 3 - Enriquecimento de Dados**:
- Integrar APIs pagas (IPinfo, Clearbit)
- Dados de empresa/indústria por IP
- Enriquecimento de email (após cadastro)

**Fase 4 - Análise Preditiva**:
- Prever probabilidade de conversão
- Lifetime value estimado
- Melhor horário de contato
- Segmentação automática para campanhas

## 📝 Variáveis de Ambiente

**Opcional** - Google Analytics 4:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Se não configurado, o sistema funciona normalmente sem GA4, usando apenas analytics interno.

## ✅ Status Atual

- ✅ FingerprintJS instalado e configurado
- ✅ Coleta de sinais implementada
- ✅ Motor de inferência heurística funcionando
- ✅ Banco de dados estruturado
- ✅ Integração com Google Analytics 4
- ✅ Vercel Analytics ativo
- ✅ Sistema totalmente invisível (sem modals)
- ✅ Tracking automático de page views
- ✅ LGPD-aware (DoNotTrack respeitado)

## 🎉 Resultado Final

Você agora tem **3 sistemas de analytics** trabalhando juntos:

1. **Analytics Interno** - Coleta detalhada + inferência demográfica
2. **Google Analytics 4** - Audiência + eventos + user properties
3. **Vercel Analytics** - Page views em produção

Tudo funcionando de forma **totalmente invisível** para o usuário! 🚀
