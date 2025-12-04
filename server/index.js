import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel } from 'docx';
import mammoth from 'mammoth';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Banco de dados SQLite - arquivo local que será versionado no Git
const db = new Database('./database.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Executar migrações automaticamente na inicialização
function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', 'init-sqlite.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    db.exec(migrationSQL);
    console.log('✅ Migrações do banco de dados executadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Executar migrações antes de iniciar o servidor
runMigrations();

// Criar diretório de uploads se não existir
const uploadsDir = '/tmp/uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Criar diretório de vídeos se não existir
const videosDir = path.join(__dirname, '..', 'public', 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Criar diretório de dados se não existir
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Arquivo de configuração de vídeo (alternativa ao banco de dados)
const videoConfigPath = path.join(dataDir, 'videoConfig.json');

// Funções para gerenciar configuração de vídeo via JSON
function getVideoConfigFromFile() {
  try {
    if (fs.existsSync(videoConfigPath)) {
      const data = fs.readFileSync(videoConfigPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao ler videoConfig.json:', error);
  }
  return null;
}

function saveVideoConfigToFile(config) {
  try {
    fs.writeFileSync(videoConfigPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar videoConfig.json:', error);
    return false;
  }
}

// Configurar multer para upload de arquivos Word
const upload = multer({ 
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Validar tipo de arquivo - apenas .docx (mammoth não suporta .doc antigo)
    // Requer extensão .docx - validação de conteúdo será feita no handler
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Word moderno (.docx) são permitidos'));
    }
  }
});

// Configurar multer para upload de vídeos
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, videosDir);
    },
    filename: (req, file, cb) => {
      // Gerar nome único baseado em timestamp
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `video_${timestamp}${ext}`;
      cb(null, safeName);
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB limite para vídeos
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.mp4', '.webm', '.mov', '.m4v'];
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
    
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de vídeo (MP4, WebM, MOV) são permitidos'));
    }
  }
});

// Configurar CORS - permitir todas as origens em desenvolvimento
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  'http://localhost:5000',
  'https://localhost:5000',
  'http://127.0.0.1:5000',
  'https://127.0.0.1:5000'
];

// Adicionar domínio do Replit se disponível
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

// Adicionar origens customizadas do ambiente
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

app.use(cors({
  origin: (origin, callback) => {
    // Em desenvolvimento, permitir todas as origens
    if (!isProduction) {
      return callback(null, true);
    }
    
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================
// MIDDLEWARE DE LOGGING DETALHADO PARA DEBUG
// ============================================
app.use('/api/admin', (req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'NO-ORIGIN';
  const host = req.headers.host;
  const cookies = req.cookies;
  const method = req.method;
  const path = req.path;
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🔍 [${timestamp}] REQUISIÇÃO ADMIN RECEBIDA`);
  console.log('───────────────────────────────────────────────────────────');
  console.log('📍 Método:', method);
  console.log('📍 Path:', path);
  console.log('📍 Host:', host);
  console.log('📍 Origin:', origin);
  console.log('📍 User-Agent:', req.headers['user-agent']);
  console.log('───────────────────────────────────────────────────────────');
  console.log('🍪 Cookies Recebidos:', Object.keys(cookies).length > 0 ? cookies : 'NENHUM COOKIE');
  console.log('───────────────────────────────────────────────────────────');
  console.log('🔒 Headers de Autenticação:');
  console.log('  - Authorization:', req.headers.authorization || 'não enviado');
  console.log('  - Cookie (raw):', req.headers.cookie || 'não enviado');
  console.log('───────────────────────────────────────────────────────────');
  
  // Verificar CORS
  console.log('🌐 Verificação CORS:');
  console.log('  - Ambiente:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('  - Origens Permitidas:', allowedOrigins.join(', '));
  console.log('  - Origin da Requisição:', origin);
  
  if (isProduction) {
    if (allowedOrigins.includes(origin)) {
      console.log('  - Status: ✅ ORIGIN PERMITIDA');
    } else {
      console.log('  - Status: ❌ ORIGIN BLOQUEADA (CORS)');
    }
  } else {
    console.log('  - Status: ✅ DESENVOLVIMENTO - TODAS AS ORIGENS PERMITIDAS');
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  
  next();
});

// Helper: Verificar DNT (bloquear apenas se explicitamente ativado)
const isDNTEnabled = (req) => {
  const headerDNT = req.headers.dnt || req.headers['dnt'];
  // Bloquear APENAS se DNT está explicitamente ATIVADO ('1')
  // Se DNT é '0', null, undefined ou ausente = PERMITIR tracking
  return headerDNT === '1';
};

// Middleware para verificar autenticação de admin
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUsername = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Rota de login admin
app.post('/api/admin/login', async (req, res) => {
  const requestId = Date.now();
  console.log(`\n🔐 [LOGIN-${requestId}] ============ INICIANDO PROCESSO DE LOGIN ============`);
  
  try {
    const { username, password } = req.body;
    console.log(`🔐 [LOGIN-${requestId}] Username recebido:`, username);
    console.log(`🔐 [LOGIN-${requestId}] Password recebido:`, password ? '***REDACTED***' : 'VAZIO');

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    
    if (!admin) {
      console.log(`🔐 [LOGIN-${requestId}] ❌ FALHA: Admin não encontrado`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    console.log(`🔐 [LOGIN-${requestId}] ✅ Admin encontrado no banco:`, admin.username);

    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      console.log(`🔐 [LOGIN-${requestId}] ❌ FALHA: Senha incorreta`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    console.log(`🔐 [LOGIN-${requestId}] ✅ Senha validada com sucesso`);

    const token = jwt.sign({ username: admin.username, id: admin.id }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`🔐 [LOGIN-${requestId}] ✅ Token JWT gerado`);

    // Configuração de cookie que funciona em produção cross-origin (Vercel → Replit)
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // true em produção (HTTPS)
      sameSite: isProduction ? 'none' : 'lax', // 'none' necessário para cross-origin em produção
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    console.log(`🔐 [LOGIN-${requestId}] 🍪 Configuração do Cookie:`);
    console.log(`🔐 [LOGIN-${requestId}]   - httpOnly:`, cookieOptions.httpOnly);
    console.log(`🔐 [LOGIN-${requestId}]   - secure:`, cookieOptions.secure);
    console.log(`🔐 [LOGIN-${requestId}]   - sameSite:`, cookieOptions.sameSite);
    console.log(`🔐 [LOGIN-${requestId}]   - maxAge:`, cookieOptions.maxAge);

    res.cookie('adminToken', token, cookieOptions);
    console.log(`🔐 [LOGIN-${requestId}] ✅ Cookie definido na resposta`);

    const response = { 
      success: true, 
      username: admin.username,
      requiresPasswordChange: admin.requires_password_change === 1
    };

    console.log(`🔐 [LOGIN-${requestId}] 📤 Enviando resposta de sucesso:`, response);
    console.log(`🔐 [LOGIN-${requestId}] ============ LOGIN CONCLUÍDO COM SUCESSO ============\n`);

    res.json(response);
  } catch (error) {
    console.log(`🔐 [LOGIN-${requestId}] 💥 ERRO CRÍTICO NO LOGIN:`);
    console.error(error);
    console.log(`🔐 [LOGIN-${requestId}] ============ LOGIN FALHOU COM ERRO ============\n`);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Criar admin (PROTEGIDO - apenas com flag de ambiente ALLOW_ADMIN_CREATION=true)
app.post('/api/admin/create', async (req, res) => {
  try {
    // Proteção: só permite criação se a variável de ambiente estiver configurada
    if (process.env.ALLOW_ADMIN_CREATION !== 'true') {
      return res.status(403).json({ 
        error: 'Endpoint desabilitado. Use o script npm run create-admin para criar administradores.' 
      });
    }

    const { username, password } = req.body;

    // Verificar se já existe admin
    const existing = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: 'Admin já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hashedPassword);

    res.json({ success: true, message: 'Admin criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Verificar autenticação
app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ authenticated: true, email: req.adminEmail });
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

// Endpoint público para exclusão de dados (LGPD - Art. 18, IV)
app.post('/api/analytics/delete-my-data', async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!visitorId || !visitorId.startsWith('visitor_')) {
      return res.status(400).json({ error: 'Visitor ID inválido' });
    }

    // Deletar todos os dados associados ao visitante
    db.prepare('DELETE FROM visitor_signals WHERE visitor_id = ?').run(visitorId);
    db.prepare('DELETE FROM inferred_demographics WHERE visitor_id = ?').run(visitorId);
    db.prepare('DELETE FROM page_views WHERE visitor_id = ?').run(visitorId);
    db.prepare('DELETE FROM events WHERE visitor_id = ?').run(visitorId);
    db.prepare('DELETE FROM registrations WHERE visitor_id = ?').run(visitorId);
    db.prepare('DELETE FROM visitors WHERE visitor_id = ?').run(visitorId);

    res.json({ 
      success: true, 
      message: 'Todos os seus dados foram removidos permanentemente do nosso sistema'
    });
  } catch (error) {
    console.error('Erro ao deletar dados do usuário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Trocar senha (protegido - requer autenticação)
app.post('/api/admin/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const username = req.adminUsername;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    
    if (!admin) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    db.prepare('UPDATE admins SET password_hash = ?, requires_password_change = 0 WHERE username = ?')
      .run(newPasswordHash, username);

    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Registrar visitante
app.post('/api/analytics/visitor', async (req, res) => {
  try {
    // DENY-BY-DEFAULT: Verificar DNT via headers
    if (isDNTEnabled(req)) {
      return res.json({ success: true, message: 'DNT respeitado' });
    }

    const { visitorId, userData } = req.body;
    
    const existing = db.prepare('SELECT * FROM visitors WHERE visitor_id = ?').get(visitorId);

    if (existing) {
      // Atualizar visitante existente
      db.prepare(
        `UPDATE visitors SET 
          last_visit = datetime('now'),
          total_visits = total_visits + 1,
          ip_address = COALESCE(?, ip_address),
          user_agent = COALESCE(?, user_agent)
        WHERE visitor_id = ?`
      ).run(userData.ip, userData.userAgent, visitorId);
    } else {
      // Criar novo visitante
      db.prepare(
        `INSERT INTO visitors 
        (visitor_id, ip_address, country, city, region, user_agent, device_type, browser, os, referrer, landing_page)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        visitorId,
        userData.ip || null,
        userData.country || null,
        userData.city || null,
        userData.region || null,
        userData.userAgent || null,
        userData.deviceType || null,
        userData.browser || null,
        userData.os || null,
        userData.referrer || null,
        userData.landingPage || null
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar visitante:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Registrar evento
app.post('/api/analytics/event', async (req, res) => {
  try {
    // DENY-BY-DEFAULT: Verificar DNT via headers
    if (isDNTEnabled(req)) {
      return res.json({ success: true, message: 'DNT respeitado' });
    }

    const { visitorId, eventType, eventData, pageUrl, sessionId } = req.body;

    db.prepare(
      `INSERT INTO events (visitor_id, event_type, event_data, page_url, session_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(visitorId, eventType, JSON.stringify(eventData), pageUrl, sessionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Registrar visualização de página
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    // DENY-BY-DEFAULT: Verificar DNT via headers
    if (isDNTEnabled(req)) {
      return res.json({ success: true, message: 'DNT respeitado' });
    }

    const { visitorId, pageUrl, pageTitle, sessionId, timeSpent, scrollDepth } = req.body;

    db.prepare(
      `INSERT INTO page_views (visitor_id, page_url, page_title, session_id, time_spent, scroll_depth)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(visitorId, pageUrl, pageTitle, sessionId, timeSpent || 0, scrollDepth || 0);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar page view:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Coletar sinais do visitante (device fingerprint + behavioral)
app.post('/api/analytics/signals', async (req, res) => {
  try {
    const { visitorId, deviceSignals, behavioralSignals } = req.body;

    // Validar dados recebidos
    if (!visitorId || !deviceSignals || !behavioralSignals) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Validar que o visitorId corresponde ao padrão esperado
    if (!visitorId.startsWith('visitor_')) {
      return res.status(400).json({ error: 'Visitor ID inválido' });
    }

    // Respeitar Do Not Track - verificar múltiplas fontes (payload + headers HTTP)
    const payloadDNT = deviceSignals.doNotTrack;
    const headerDNT = req.headers.dnt || req.headers['dnt'];
    
    // Bloquear APENAS se DNT está explicitamente ATIVADO ('1' ou 'yes')
    // Se DNT é '0', 'no', null, undefined ou ausente = PERMITIR tracking
    const isDNTEnabledSignals = 
      payloadDNT === '1' || 
      payloadDNT === 'yes' || 
      headerDNT === '1';

    if (isDNTEnabledSignals) {
      // Limpar dados existentes se houver
      try {
        db.prepare('DELETE FROM visitor_signals WHERE visitor_id = ?').run(visitorId);
        db.prepare('DELETE FROM inferred_demographics WHERE visitor_id = ?').run(visitorId);
        db.prepare('UPDATE visitors SET age_range = NULL, gender = NULL, interests = NULL, occupation = NULL, education_level = NULL WHERE visitor_id = ?').run(visitorId);
      } catch (cleanupError) {
        console.error('Erro ao limpar dados após DNT:', cleanupError);
      }
      
      return res.json({ 
        success: true, 
        message: 'Do Not Track respeitado - dados não salvos e registros anteriores removidos',
        inference: null 
      });
    }

    // Salvar sinais brutos
    db.prepare(
      `INSERT INTO visitor_signals (
        visitor_id, fingerprint_id, timezone, language, languages,
        screen_resolution, color_depth, hardware_concurrency, device_memory,
        platform, touch_support, cookie_enabled, do_not_track,
        hour_of_day, day_of_week, is_weekday, is_business_hours,
        referrer, landing_page
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      visitorId,
      deviceSignals.fingerprintId,
      deviceSignals.timezone,
      deviceSignals.language,
      JSON.stringify(deviceSignals.languages),
      deviceSignals.screenResolution,
      deviceSignals.colorDepth,
      deviceSignals.hardwareConcurrency,
      deviceSignals.deviceMemory || null,
      deviceSignals.platform,
      deviceSignals.touchSupport ? 1 : 0,
      deviceSignals.cookieEnabled ? 1 : 0,
      deviceSignals.doNotTrack,
      behavioralSignals.hourOfDay,
      behavioralSignals.dayOfWeek,
      behavioralSignals.isWeekday ? 1 : 0,
      behavioralSignals.isBusinessHours ? 1 : 0,
      behavioralSignals.referrer,
      behavioralSignals.landingPage
    );

    // Executar motor de inferência
    const inference = inferDemographics(deviceSignals, behavioralSignals, visitorId);

    // Salvar inferências se confiança > threshold
    if (inference.confidence > 0.3) {
      db.prepare(
        `INSERT INTO inferred_demographics (
          visitor_id, age_range, gender, occupation, education_level, interests,
          confidence_score, algorithm_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        visitorId,
        inference.ageRange,
        inference.gender,
        inference.occupation,
        inference.educationLevel,
        inference.interests,
        inference.confidence,
        'heuristic_v1.0'
      );

      // Atualizar tabela de visitantes com a melhor inferência
      db.prepare(
        `UPDATE visitors SET 
          age_range = ?,
          gender = ?,
          interests = ?,
          occupation = ?,
          education_level = ?
        WHERE visitor_id = ?`
      ).run(
        inference.ageRange,
        inference.gender,
        inference.interests,
        inference.occupation,
        inference.educationLevel,
        visitorId
      );
    }

    res.json({ success: true, inference });
  } catch (error) {
    console.error('Erro ao processar sinais:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Motor de inferência demográfica (heurístico)
function inferDemographics(deviceSignals, behavioralSignals, visitorId) {
  let ageScore = 0;
  let genderScore = 0; // -1 = female, +1 = male, 0 = neutral
  let occupationHints = [];
  let educationHints = [];
  let interestHints = [];
  let confidence = 0.5;

  // === INFERÊNCIA DE IDADE ===
  // Horário de acesso
  if (behavioralSignals.hourOfDay >= 0 && behavioralSignals.hourOfDay < 6) {
    ageScore -= 2; // Mais jovem
  } else if (behavioralSignals.hourOfDay >= 22) {
    ageScore -= 1; // Jovem
  } else if (behavioralSignals.hourOfDay >= 6 && behavioralSignals.hourOfDay < 9) {
    ageScore += 1; // Adulto trabalhador
  }

  // Hardware specs (dispositivo high-end = poder aquisitivo)
  if (deviceSignals.hardwareConcurrency >= 8 || (deviceSignals.deviceMemory && deviceSignals.deviceMemory >= 8)) {
    ageScore += 1; // Adulto com renda
    educationHints.push('graduate');
    occupationHints.push('professional');
  }

  // Mobile vs Desktop
  const isMobile = deviceSignals.touchSupport && parseInt(deviceSignals.screenResolution.split('x')[0]) < 800;
  if (isMobile) {
    ageScore -= 0.5; // Mais jovem
  }

  // === INFERÊNCIA DE OCUPAÇÃO ===
  // Acesso em horário comercial + dia de semana
  if (behavioralSignals.isWeekday && behavioralSignals.isBusinessHours) {
    occupationHints.push('employee');
    educationHints.push('undergraduate');
  }

  // Desktop durante horário comercial = profissional
  if (!isMobile && behavioralSignals.isBusinessHours && behavioralSignals.isWeekday) {
    occupationHints.push('professional');
    educationHints.push('graduate');
    confidence += 0.1;
  }

  // === INFERÊNCIA DE INTERESSES ===
  // Navegação de engajamento/marketing (baseado na landing page)
  if (behavioralSignals.landingPage === '/') {
    interestHints.push('marketing', 'entrepreneurship', 'social-media');
  }

  // === CONVERSÃO DE SCORES EM CATEGORIAS ===
  let ageRange;
  if (ageScore < -2) ageRange = '18-24';
  else if (ageScore < 0) ageRange = '25-34';
  else if (ageScore < 2) ageRange = '35-44';
  else if (ageScore < 4) ageRange = '45-54';
  else ageRange = '55+';

  const occupation = occupationHints[0] || null;
  const educationLevel = educationHints[0] || null;
  const interests = interestHints.length > 0 ? interestHints.join(',') : null;

  // Gênero: não inferimos sem dados explícitos (privacidade)
  const gender = null;

  return {
    ageRange,
    gender,
    occupation,
    educationLevel,
    interests,
    confidence: Math.min(confidence, 0.7) // Cap at 70% for heuristics
  };
}

// Registrar dados de cadastro
app.post('/api/analytics/registration', async (req, res) => {
  try {
    // DENY-BY-DEFAULT: Verificar DNT via headers
    if (isDNTEnabled(req)) {
      return res.json({ success: true, message: 'DNT respeitado' });
    }

    const { visitorId, email, name, phone, registrationData } = req.body;

    db.prepare(
      `INSERT INTO registrations (visitor_id, email, name, phone, registration_data)
       VALUES (?, ?, ?, ?, ?)`
    ).run(visitorId, email, name, phone, JSON.stringify(registrationData));

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar dados:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Obter estatísticas gerais
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const visitors = db.prepare('SELECT COUNT(*) as count FROM visitors').get();
    const events = db.prepare('SELECT COUNT(*) as count FROM events').get();
    const registrations = db.prepare('SELECT COUNT(*) as count FROM registrations').get();
    const pageViews = db.prepare('SELECT COUNT(*) as count FROM page_views').get();

    const recentVisitors = db.prepare(
      "SELECT COUNT(*) as count FROM visitors WHERE last_visit > datetime('now', '-24 hours')"
    ).get();

    res.json({
      totalVisitors: parseInt(visitors.count),
      totalEvents: parseInt(events.count),
      totalRegistrations: parseInt(registrations.count),
      totalPageViews: parseInt(pageViews.count),
      visitorsLast24h: parseInt(recentVisitors.count)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Listar visitantes
app.get('/api/admin/visitors', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const visitors = db.prepare(
      `SELECT * FROM visitors 
       ORDER BY last_visit DESC 
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const countResult = db.prepare('SELECT COUNT(*) as count FROM visitors').get();

    res.json({
      visitors: visitors,
      total: parseInt(countResult.count),
      page,
      totalPages: Math.ceil(countResult.count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar visitantes:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Detalhes de um visitante específico
app.get('/api/admin/visitor/:visitorId', authMiddleware, async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = db.prepare('SELECT * FROM visitors WHERE visitor_id = ?').get(visitorId);
    const events = db.prepare('SELECT * FROM events WHERE visitor_id = ? ORDER BY timestamp DESC').all(visitorId);
    const pageViews = db.prepare('SELECT * FROM page_views WHERE visitor_id = ? ORDER BY viewed_at DESC').all(visitorId);
    const registration = db.prepare('SELECT * FROM registrations WHERE visitor_id = ? ORDER BY registered_at DESC LIMIT 1').get(visitorId);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    res.json({
      visitor: visitor,
      events: events,
      pageViews: pageViews,
      registration: registration || null
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do visitante:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Listar eventos recentes
app.get('/api/admin/events', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const events = db.prepare(
      `SELECT e.*, v.ip_address, v.city, v.country 
       FROM events e 
       LEFT JOIN visitors v ON e.visitor_id = v.visitor_id 
       ORDER BY e.timestamp DESC 
       LIMIT ?`
    ).all(limit);

    res.json({ events: events });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Obter dados demográficos agregados
app.get('/api/admin/demographics', authMiddleware, async (req, res) => {
  try {
    // Buscar todos os visitantes com dados demográficos (colunas individuais)
    const visitors = db.prepare('SELECT age_range, gender, occupation, education_level, interests FROM visitors').all();
    
    if (!visitors || visitors.length === 0) {
      return res.json({
        ageDistribution: [],
        genderDistribution: [],
        occupationDistribution: [],
        educationDistribution: [],
        topInterests: [],
        averageConfidence: {
          age_range: 0,
          gender: 0,
          occupation: 0,
          education_level: 0,
          interests: 0
        },
        totalProfiles: 0
      });
    }

    // Contadores para agregação
    const ageCount = {};
    const genderCount = {};
    const occupationCount = {};
    const educationCount = {};
    const interestsCount = {};

    // Processar cada visitante
    visitors.forEach(v => {
      try {
        // Idade
        if (v.age_range) {
          ageCount[v.age_range] = (ageCount[v.age_range] || 0) + 1;
        }

        // Gênero
        if (v.gender) {
          genderCount[v.gender] = (genderCount[v.gender] || 0) + 1;
        }

        // Ocupação
        if (v.occupation) {
          occupationCount[v.occupation] = (occupationCount[v.occupation] || 0) + 1;
        }

        // Educação
        if (v.education_level) {
          educationCount[v.education_level] = (educationCount[v.education_level] || 0) + 1;
        }

        // Interesses
        if (v.interests) {
          const interests = typeof v.interests === 'string' ? JSON.parse(v.interests) : v.interests;
          if (Array.isArray(interests)) {
            interests.forEach(interest => {
              interestsCount[interest] = (interestsCount[interest] || 0) + 1;
            });
          }
        }
      } catch (parseError) {
        console.error('Erro ao processar demografia:', parseError);
      }
    });

    // Converter para arrays ordenados
    const ageDistribution = Object.entries(ageCount)
      .map(([age, count]) => ({ age, count }))
      .sort((a, b) => b.count - a.count);

    const genderDistribution = Object.entries(genderCount)
      .map(([gender, count]) => ({ gender, count }))
      .sort((a, b) => b.count - a.count);

    const occupationDistribution = Object.entries(occupationCount)
      .map(([occupation, count]) => ({ occupation, count }))
      .sort((a, b) => b.count - a.count);

    const educationDistribution = Object.entries(educationCount)
      .map(([education, count]) => ({ education, count }))
      .sort((a, b) => b.count - a.count);

    const topInterests = Object.entries(interestsCount)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Confidence não está disponível nos dados atuais
    const averageConfidence = {
      age_range: 0,
      gender: 0,
      occupation: 0,
      education_level: 0,
      interests: 0
    };

    res.json({
      ageDistribution,
      genderDistribution,
      occupationDistribution,
      educationDistribution,
      topInterests,
      averageConfidence,
      totalProfiles: visitors.length
    });
  } catch (error) {
    console.error('Erro ao buscar dados demográficos:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Dashboard: Listar registros
app.get('/api/admin/registrations', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const registrations = db.prepare(
      `SELECT r.*, v.ip_address, v.city, v.country, v.device_type 
       FROM registrations r 
       LEFT JOIN visitors v ON r.visitor_id = v.visitor_id 
       ORDER BY r.registered_at DESC 
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const countResult = db.prepare('SELECT COUNT(*) as count FROM registrations').get();

    res.json({
      registrations: registrations,
      total: parseInt(countResult.count),
      page,
      totalPages: Math.ceil(countResult.count / limit)
    });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Endpoint público: Obter vídeo ativo (prioriza arquivo JSON sobre banco de dados)
app.get('/api/video/current', async (req, res) => {
  try {
    // Primeiro, tentar obter do arquivo JSON (mais confiável para deploy estático)
    const fileConfig = getVideoConfigFromFile();
    if (fileConfig && fileConfig.is_active) {
      return res.json({ video: fileConfig });
    }

    // Fallback para banco de dados (compatibilidade)
    const video = db.prepare(
      'SELECT * FROM video_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    ).get();

    if (!video) {
      return res.json({ video: null });
    }

    res.json({ video: video });
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Admin: Obter configuração de vídeo
app.get('/api/admin/video', authMiddleware, async (req, res) => {
  try {
    // Primeiro, tentar obter do arquivo JSON
    const fileConfig = getVideoConfigFromFile();
    if (fileConfig) {
      return res.json({ video: fileConfig });
    }

    // Fallback para banco de dados
    const video = db.prepare(
      'SELECT * FROM video_config ORDER BY created_at DESC LIMIT 1'
    ).get();

    if (!video) {
      return res.json({ video: null });
    }

    res.json({ video: video });
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Admin: Criar ou atualizar vídeo (URL do YouTube)
app.post('/api/admin/video', authMiddleware, async (req, res) => {
  try {
    const { video_url, video_type, button_delay_seconds } = req.body;

    if (!video_url) {
      return res.status(400).json({ error: 'URL do vídeo é obrigatória' });
    }

    // Remover vídeo local anterior se existir
    const oldConfig = getVideoConfigFromFile();
    if (oldConfig && oldConfig.video_type === 'local' && oldConfig.video_path) {
      const videoRelativePath = oldConfig.video_path.startsWith('/') 
        ? oldConfig.video_path.slice(1) 
        : oldConfig.video_path;
      const oldVideoPath = path.join(__dirname, '..', 'public', videoRelativePath);
      if (fs.existsSync(oldVideoPath)) {
        try {
          fs.unlinkSync(oldVideoPath);
          console.log('✅ Vídeo local anterior removido (trocando para YouTube):', oldVideoPath);
        } catch (err) {
          console.error('❌ Erro ao remover vídeo anterior:', err);
        }
      }
    }

    // Salvar configuração no arquivo JSON
    const videoConfig = {
      id: Date.now(),
      video_url: video_url,
      video_type: video_type || 'youtube',
      video_path: null,
      button_delay_seconds: button_delay_seconds || 90,
      is_active: true,
      created_at: new Date().toISOString()
    };

    saveVideoConfigToFile(videoConfig);

    // Também salvar no banco de dados para compatibilidade
    try {
      db.prepare('UPDATE video_config SET is_active = 0').run();
      db.prepare(
        `INSERT INTO video_config (video_url, video_type, button_delay_seconds, is_active)
         VALUES (?, ?, ?, 1)`
      ).run(video_url, video_type || 'youtube', button_delay_seconds || 90);
    } catch (dbError) {
      console.log('Aviso: Não foi possível salvar no banco de dados:', dbError.message);
    }

    res.json({ success: true, video: videoConfig });
  } catch (error) {
    console.error('Erro ao salvar vídeo:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Admin: Upload de vídeo local
app.post('/api/admin/video/upload', authMiddleware, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de vídeo enviado' });
    }

    const button_delay_seconds = parseInt(req.body.button_delay_seconds) || 90;

    // Remover vídeo anterior se existir
    const oldConfig = getVideoConfigFromFile();
    if (oldConfig && oldConfig.video_type === 'local' && oldConfig.video_path) {
      const videoRelativePath = oldConfig.video_path.startsWith('/') 
        ? oldConfig.video_path.slice(1) 
        : oldConfig.video_path;
      const oldVideoPath = path.join(__dirname, '..', 'public', videoRelativePath);
      const newVideoPath = path.join(videosDir, req.file.filename);
      
      if (fs.existsSync(oldVideoPath) && path.resolve(oldVideoPath) !== path.resolve(newVideoPath)) {
        try {
          fs.unlinkSync(oldVideoPath);
          console.log('✅ Vídeo local anterior removido:', oldVideoPath);
        } catch (err) {
          console.error('❌ Erro ao remover vídeo anterior:', err);
        }
      }
    }

    // Caminho relativo do vídeo (para usar no frontend)
    const videoPath = `/videos/${req.file.filename}`;

    // Salvar configuração no arquivo JSON
    const videoConfig = {
      id: Date.now(),
      video_url: videoPath,
      video_type: 'local',
      video_path: videoPath,
      button_delay_seconds: button_delay_seconds,
      is_active: true,
      created_at: new Date().toISOString(),
      original_filename: req.file.originalname,
      file_size: req.file.size
    };

    saveVideoConfigToFile(videoConfig);

    console.log('✅ Vídeo uploaded com sucesso:', {
      filename: req.file.filename,
      path: videoPath,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
    });

    res.json({ 
      success: true, 
      video: videoConfig,
      message: 'Vídeo enviado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao fazer upload do vídeo:', error);
    res.status(500).json({ error: error.message || 'Erro ao fazer upload do vídeo' });
  }
});

// Admin: Deletar vídeo local
app.delete('/api/admin/video/local', authMiddleware, async (req, res) => {
  try {
    const config = getVideoConfigFromFile();
    
    if (config && config.video_type === 'local' && config.video_path) {
      const videoRelativePath = config.video_path.startsWith('/') 
        ? config.video_path.slice(1) 
        : config.video_path;
      const videoPath = path.join(__dirname, '..', 'public', videoRelativePath);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log('✅ Vídeo local removido:', videoPath);
      }
    }

    // Limpar configuração
    if (fs.existsSync(videoConfigPath)) {
      fs.unlinkSync(videoConfigPath);
    }

    res.json({ success: true, message: 'Vídeo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({ error: 'Erro ao deletar vídeo' });
  }
});

// Admin: Deletar vídeo
app.delete('/api/admin/video/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM video_config WHERE id = ?').run(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Admin: Exportar dados para Word
app.get('/api/admin/export/word', authMiddleware, async (req, res) => {
  try {
    // Buscar todos os dados
    const visitors = db.prepare('SELECT * FROM visitors ORDER BY last_visit DESC LIMIT 100').all();
    const registrations = db.prepare(`
      SELECT r.*, v.ip_address, v.city, v.country, v.device_type 
      FROM registrations r 
      LEFT JOIN visitors v ON r.visitor_id = v.visitor_id 
      ORDER BY r.registered_at DESC LIMIT 100
    `).all();
    const events = db.prepare('SELECT COUNT(*) as count FROM events').get();
    const pageViews = db.prepare('SELECT COUNT(*) as count FROM page_views').get();

    // Criar documento Word
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'Relatório de Analytics - Fórmula Engajamento',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          
          new Paragraph({
            text: 'Estatísticas Gerais',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Total de Visitantes: `, bold: true }),
              new TextRun({ text: `${visitors.length}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Total de Registros: `, bold: true }),
              new TextRun({ text: `${registrations.length}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Total de Eventos: `, bold: true }),
              new TextRun({ text: `${events.count}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Total de Visualizações: `, bold: true }),
              new TextRun({ text: `${pageViews.count}` }),
            ],
          }),
          new Paragraph({ text: '' }),
          
          new Paragraph({
            text: 'Registros (últimos 100)',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: '' }),
        ],
      }],
    });

    // Adicionar dados de registros
    const registrationRows = [];
    registrations.forEach((reg, index) => {
      registrationRows.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${reg.name || 'Sem nome'}`, bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Email: ' }),
            new TextRun({ text: reg.email || 'N/A' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Telefone: ' }),
            new TextRun({ text: reg.phone || 'N/A' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Data: ' }),
            new TextRun({ text: new Date(reg.registered_at).toLocaleString('pt-BR') }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Localização: ' }),
            new TextRun({ text: `${reg.city || '?'}, ${reg.country || '?'}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Dispositivo: ' }),
            new TextRun({ text: reg.device_type || 'Desconhecido' }),
          ],
        })
      );
    });

    // Adicionar ao documento
    doc.sections[0].children.push(...registrationRows);

    // Gerar buffer
    const buffer = await Packer.toBuffer(doc);

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-analytics-${Date.now()}.docx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao exportar para Word:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

// Admin: Importar dados de Word
app.post('/api/admin/import/word', authMiddleware, upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    filePath = req.file.path;

    // Validar extensão do arquivo
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.docx') {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Apenas arquivos Word moderno (.docx) são permitidos' });
    }

    // Validar assinatura do arquivo (arquivos DOCX são arquivos ZIP)
    // Verificar os primeiros bytes para garantir que é um arquivo ZIP válido
    const buffer = fs.readFileSync(filePath);
    const isProbablyDocx = buffer.length >= 4 && 
                           buffer[0] === 0x50 && buffer[1] === 0x4B && 
                           (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) && 
                           (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

    if (!isProbablyDocx) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Arquivo inválido. O arquivo não parece ser um documento Word válido.' });
    }

    // Ler o arquivo Word
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Arquivo vazio ou não pôde ser lido' });
    }

    // Extrair emails usando regex
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emails = text.match(emailRegex) || [];

    // Extrair telefones usando regex (formatos brasileiros)
    const phoneRegex = /(?:\+55\s?)?(?:\(?[0-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}-?[0-9]{4}/gi;
    const phones = text.match(phoneRegex) || [];

    // Limpar arquivo temporário
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ 
      success: true, 
      message: `${emails.length} emails e ${phones.length} telefones encontrados`,
      data: {
        emails: [...new Set(emails)],
        phones: [...new Set(phones)],
        preview: text.substring(0, 500)
      }
    });
  } catch (error) {
    console.error('Erro ao importar Word:', error);
    
    // Limpar arquivo em caso de erro
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Erro ao deletar arquivo temporário:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: error.message || 'Erro ao processar arquivo',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Endpoint para salvar configurações de gráficos
app.post('/api/admin/chart-config', authMiddleware, async (req, res) => {
  try {
    const { configs } = req.body;
    const username = req.adminUsername;

    // Criar tabela se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS chart_configs (
        username TEXT PRIMARY KEY,
        configs TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir ou atualizar configurações
    const stmt = db.prepare(`
      INSERT INTO chart_configs (username, configs, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(username) DO UPDATE SET 
        configs = excluded.configs,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(username, JSON.stringify(configs));

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// Endpoint para carregar configurações de gráficos
app.get('/api/admin/chart-config', authMiddleware, async (req, res) => {
  try {
    const username = req.adminUsername;

    // Criar tabela se não existir
    db.exec(`
      CREATE TABLE IF NOT EXISTS chart_configs (
        username TEXT PRIMARY KEY,
        configs TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = db.prepare('SELECT configs FROM chart_configs WHERE username = ?').get(username);

    if (result) {
      res.json({ configs: JSON.parse(result.configs) });
    } else {
      res.json({ configs: null });
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    res.status(500).json({ error: 'Erro ao carregar configurações' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de Analytics rodando na porta ${PORT}`);
});
