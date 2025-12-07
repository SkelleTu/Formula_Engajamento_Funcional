-- Schema para Supabase (PostgreSQL)
-- Execute este script no SQL Editor do Supabase

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  requires_password_change BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de visitantes
CREATE TABLE IF NOT EXISTS visitors (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT UNIQUE NOT NULL,
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
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
  total_time_spent INTEGER DEFAULT 0,
  age_range TEXT,
  gender TEXT,
  interests TEXT,
  occupation TEXT,
  education_level TEXT
);

-- Tabela de visualizações de página
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  page_url TEXT,
  page_title TEXT,
  session_id TEXT,
  time_spent INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cadastros/registros
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  registration_data JSONB,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configuração de vídeo da landing page
CREATE TABLE IF NOT EXISTS video_config (
  id SERIAL PRIMARY KEY,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube',
  button_delay_seconds INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sinais do visitante (fingerprint + behavioral)
CREATE TABLE IF NOT EXISTS visitor_signals (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  fingerprint_id TEXT,
  timezone TEXT,
  language TEXT,
  languages JSONB,
  screen_resolution TEXT,
  color_depth INTEGER,
  hardware_concurrency INTEGER,
  device_memory REAL,
  platform TEXT,
  touch_support BOOLEAN DEFAULT false,
  cookie_enabled BOOLEAN DEFAULT true,
  do_not_track TEXT,
  hour_of_day INTEGER,
  day_of_week INTEGER,
  is_weekday BOOLEAN DEFAULT true,
  is_business_hours BOOLEAN DEFAULT false,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de inferências demográficas
CREATE TABLE IF NOT EXISTS inferred_demographics (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  age_range TEXT,
  gender TEXT,
  occupation TEXT,
  education_level TEXT,
  interests TEXT,
  confidence_score REAL,
  algorithm_version TEXT,
  inferred_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_visitor_signals_visitor_id ON visitor_signals(visitor_id);
CREATE INDEX IF NOT EXISTS idx_inferred_demographics_visitor_id ON inferred_demographics(visitor_id);

-- Habilitar Row Level Security (RLS) para segurança
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inferred_demographics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - permitir acesso anônimo para analytics (inserção)
CREATE POLICY "Allow anonymous insert" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON visitors FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON visitor_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON inferred_demographics FOR INSERT WITH CHECK (true);

-- Políticas para leitura (apenas autenticados podem ler dados sensíveis)
CREATE POLICY "Allow authenticated read" ON visitors FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON page_views FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON video_config FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON visitor_signals FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON inferred_demographics FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read" ON admins FOR SELECT USING (true);

-- Política para video_config (todos podem ler, apenas admin pode modificar)
CREATE POLICY "Allow anonymous read video_config" ON video_config FOR SELECT USING (true);
CREATE POLICY "Allow insert video_config" ON video_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update video_config" ON video_config FOR UPDATE USING (true);

-- Políticas para admins
CREATE POLICY "Allow insert admins" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update admins" ON admins FOR UPDATE USING (true);

-- Permitir delete para LGPD
CREATE POLICY "Allow delete visitors" ON visitors FOR DELETE USING (true);
CREATE POLICY "Allow delete page_views" ON page_views FOR DELETE USING (true);
CREATE POLICY "Allow delete events" ON events FOR DELETE USING (true);
CREATE POLICY "Allow delete registrations" ON registrations FOR DELETE USING (true);
CREATE POLICY "Allow delete visitor_signals" ON visitor_signals FOR DELETE USING (true);
CREATE POLICY "Allow delete inferred_demographics" ON inferred_demographics FOR DELETE USING (true);
