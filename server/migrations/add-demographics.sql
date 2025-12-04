-- Migração para adicionar campos demográficos

-- Adicionar campos demográficos na tabela de visitantes
ALTER TABLE visitors ADD COLUMN age_range TEXT;
ALTER TABLE visitors ADD COLUMN gender TEXT;
ALTER TABLE visitors ADD COLUMN interests TEXT;
ALTER TABLE visitors ADD COLUMN occupation TEXT;
ALTER TABLE visitors ADD COLUMN education_level TEXT;

-- Criar índices para melhor performance nas consultas demográficas
CREATE INDEX IF NOT EXISTS idx_visitors_age_range ON visitors(age_range);
CREATE INDEX IF NOT EXISTS idx_visitors_gender ON visitors(gender);
CREATE INDEX IF NOT EXISTS idx_visitors_occupation ON visitors(occupation);
