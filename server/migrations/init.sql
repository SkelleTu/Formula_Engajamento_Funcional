-- Migração inicial do banco de dados
-- Este script cria todas as tabelas necessárias para o sistema

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de visitantes
CREATE TABLE IF NOT EXISTS visitors (
  id SERIAL PRIMARY KEY,
  visitor_id VARCHAR(255) UNIQUE NOT NULL,
  first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  region VARCHAR(100),
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  referrer TEXT,
  landing_page TEXT,
  total_visits INTEGER DEFAULT 1,
  total_time_spent INTEGER DEFAULT 0
);

-- Tabela de visualizações de página
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  visitor_id VARCHAR(255) NOT NULL,
  page_url TEXT,
  page_title VARCHAR(255),
  session_id VARCHAR(255),
  time_spent INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  visitor_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  page_url TEXT,
  session_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de cadastros/registros
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  visitor_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  registration_data JSONB,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de configuração de vídeo da landing page
CREATE TABLE IF NOT EXISTS video_config (
  id SERIAL PRIMARY KEY,
  video_url TEXT NOT NULL,
  video_type VARCHAR(50) NOT NULL DEFAULT 'youtube',
  button_delay_seconds INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
