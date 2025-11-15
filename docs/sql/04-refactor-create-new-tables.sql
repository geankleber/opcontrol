-- ===================================================
-- REFATORAÇÃO: Criar Novas Tabelas para Separar PDP
-- ===================================================
--
-- DESCRIÇÃO:
-- Este script cria duas novas tabelas separadas:
-- - pdp_data: Dados de PDP importados do ONS
-- - generation_realizada: Dados de geração efetivamente realizada
--
-- IMPORTANTE: Não deleta generation_data ainda!
-- A tabela antiga será convertida em VIEW depois.
--
-- DATA: 2025-11-12
-- STATUS: Pronto para execução
-- ===================================================

-- ===================================================
-- TABELA 1: pdp_data
-- Armazena dados de PDP importados do ONS
-- ===================================================

CREATE TABLE IF NOT EXISTS pdp_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hora TEXT NOT NULL,
  pdp NUMERIC NOT NULL,
  report_date DATE NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  import_source VARCHAR(50) DEFAULT 'ONS_API',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pdp_data_report_date ON pdp_data(report_date);
CREATE INDEX IF NOT EXISTS idx_pdp_data_hora ON pdp_data(hora);
CREATE INDEX IF NOT EXISTS idx_pdp_data_imported_at ON pdp_data(imported_at DESC);

-- Constraint de unicidade
DO $$
BEGIN
    ALTER TABLE pdp_data ADD CONSTRAINT unique_pdp_hora_date
      UNIQUE(hora, report_date);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Comentários
COMMENT ON TABLE pdp_data IS 'Dados de Programa Diário de Produção (PDP) importados do ONS';
COMMENT ON COLUMN pdp_data.hora IS 'Horário no formato HH:MM ou HH:MM:SS';
COMMENT ON COLUMN pdp_data.pdp IS 'Valor programado em MW';
COMMENT ON COLUMN pdp_data.report_date IS 'Data do relatório';
COMMENT ON COLUMN pdp_data.import_source IS 'Fonte da importação: ONS_API, MANUAL, etc';
COMMENT ON COLUMN pdp_data.imported_at IS 'Timestamp de quando foi importado do ONS';

-- ===================================================
-- TABELA 2: generation_realizada
-- Armazena dados de geração efetivamente realizada
-- ===================================================

CREATE TABLE IF NOT EXISTS generation_realizada (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hora TEXT NOT NULL,
  geracao NUMERIC NOT NULL,
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_generation_realizada_report_date ON generation_realizada(report_date);
CREATE INDEX IF NOT EXISTS idx_generation_realizada_hora ON generation_realizada(hora);
CREATE INDEX IF NOT EXISTS idx_generation_realizada_updated_at ON generation_realizada(updated_at DESC);

-- Constraint de unicidade
DO $$
BEGIN
    ALTER TABLE generation_realizada ADD CONSTRAINT unique_geracao_hora_date
      UNIQUE(hora, report_date);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Comentários
COMMENT ON TABLE generation_realizada IS 'Dados de geração efetivamente realizada (MW)';
COMMENT ON COLUMN generation_realizada.hora IS 'Horário no formato HH:MM ou HH:MM:SS';
COMMENT ON COLUMN generation_realizada.geracao IS 'Valor realizado em MW';
COMMENT ON COLUMN generation_realizada.report_date IS 'Data do relatório';

-- ===================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ===================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_generation_realizada_updated_at ON generation_realizada;
CREATE TRIGGER update_generation_realizada_updated_at
BEFORE UPDATE ON generation_realizada
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- RLS (Row Level Security)
-- ===================================================

ALTER TABLE pdp_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_realizada ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para pdp_data
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública pdp_data" ON pdp_data;
    CREATE POLICY "Permitir leitura pública pdp_data"
    ON pdp_data FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir inserção pública pdp_data" ON pdp_data;
    CREATE POLICY "Permitir inserção pública pdp_data"
    ON pdp_data FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir atualização pública pdp_data" ON pdp_data;
    CREATE POLICY "Permitir atualização pública pdp_data"
    ON pdp_data FOR UPDATE USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir deleção pública pdp_data" ON pdp_data;
    CREATE POLICY "Permitir deleção pública pdp_data"
    ON pdp_data FOR DELETE USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Políticas de acesso público para generation_realizada
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública generation_realizada" ON generation_realizada;
    CREATE POLICY "Permitir leitura pública generation_realizada"
    ON generation_realizada FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir inserção pública generation_realizada" ON generation_realizada;
    CREATE POLICY "Permitir inserção pública generation_realizada"
    ON generation_realizada FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir atualização pública generation_realizada" ON generation_realizada;
    CREATE POLICY "Permitir atualização pública generation_realizada"
    ON generation_realizada FOR UPDATE USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir deleção pública generation_realizada" ON generation_realizada;
    CREATE POLICY "Permitir deleção pública generation_realizada"
    ON generation_realizada FOR DELETE USING (true);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===================================================
-- Verificação
-- ===================================================

SELECT
    'Tabelas criadas com sucesso!' AS status,
    (SELECT COUNT(*) FROM pdp_data) AS pdp_count,
    (SELECT COUNT(*) FROM generation_realizada) AS geracao_count;
