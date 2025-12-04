-- Migração para adicionar tabela de sinais/features dos visitantes

-- Tabela de sinais coletados (raw signals)
CREATE TABLE IF NOT EXISTS visitor_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  fingerprint_id TEXT,
  timezone TEXT,
  language TEXT,
  languages TEXT,
  screen_resolution TEXT,
  color_depth INTEGER,
  hardware_concurrency INTEGER,
  device_memory INTEGER,
  platform TEXT,
  touch_support INTEGER,
  cookie_enabled INTEGER,
  do_not_track TEXT,
  hour_of_day INTEGER,
  day_of_week INTEGER,
  is_weekday INTEGER,
  is_business_hours INTEGER,
  referrer TEXT,
  landing_page TEXT,
  collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Tabela de inferências demográficas com confidence scores
CREATE TABLE IF NOT EXISTS inferred_demographics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  age_range TEXT,
  gender TEXT,
  occupation TEXT,
  education_level TEXT,
  interests TEXT,
  confidence_score REAL,
  algorithm_version TEXT,
  inferred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visitor_signals_visitor_id ON visitor_signals(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_signals_collected_at ON visitor_signals(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_inferred_demographics_visitor_id ON inferred_demographics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_inferred_demographics_confidence ON inferred_demographics(confidence_score DESC);
