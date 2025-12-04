-- Migração inicial do banco de dados SQLite
-- Este script cria todas as tabelas necessárias para o sistema

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de visitantes
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT UNIQUE NOT NULL,
  first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  landing_page TEXT,
  total_visits INTEGER DEFAULT 1,
  total_time_spent INTEGER DEFAULT 0
);

-- Tabela de visualizações de página
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  page_url TEXT,
  page_title TEXT,
  session_id TEXT,
  time_spent INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,
  page_url TEXT,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de cadastros/registros
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  phone TEXT,
  registration_data TEXT,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de configuração de vídeo da landing page
CREATE TABLE IF NOT EXISTS video_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube',
  button_delay_seconds INTEGER DEFAULT 90,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_visitor_id ON registrations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations(registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_video_config_active ON video_config(is_active);
