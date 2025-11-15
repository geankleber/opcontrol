-- ===================================================
-- REFATORAÇÃO: Criar VIEW e Triggers de Compatibilidade
-- ===================================================
--
-- DESCRIÇÃO:
-- 1. Renomeia generation_data para generation_data_old
-- 2. Cria VIEW generation_data que une as novas tabelas
-- 3. Cria triggers INSTEAD OF para manter compatibilidade
--
-- IMPORTANTE: Execute DEPOIS de migrar os dados
--
-- DATA: 2025-11-12
-- STATUS: Pronto para execução
-- ===================================================

-- ===================================================
-- PASSO 1: Criar Funções dos Triggers (antes da VIEW)
-- ===================================================

-- ==================
-- Função: INSERT
-- ==================

CREATE OR REPLACE FUNCTION generation_data_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir PDP se fornecido
    IF NEW.pdp IS NOT NULL THEN
        INSERT INTO pdp_data (hora, pdp, report_date, import_source)
        VALUES (NEW.hora, NEW.pdp, NEW.report_date, COALESCE(NEW.import_source, 'MANUAL'))
        ON CONFLICT (hora, report_date)
        DO UPDATE SET
            pdp = EXCLUDED.pdp,
            import_source = EXCLUDED.import_source,
            imported_at = NOW();
    END IF;

    -- Inserir Geração se fornecido
    IF NEW.geracao IS NOT NULL THEN
        INSERT INTO generation_realizada (hora, geracao, report_date)
        VALUES (NEW.hora, NEW.geracao, NEW.report_date)
        ON CONFLICT (hora, report_date)
        DO UPDATE SET
            geracao = EXCLUDED.geracao,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================
-- Função: UPDATE
-- ==================

CREATE OR REPLACE FUNCTION generation_data_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar PDP se mudou
    IF NEW.pdp IS DISTINCT FROM OLD.pdp THEN
        IF NEW.pdp IS NULL THEN
            -- Remover PDP
            DELETE FROM pdp_data
            WHERE hora = OLD.hora AND report_date = OLD.report_date;
        ELSE
            -- Inserir ou atualizar PDP
            INSERT INTO pdp_data (hora, pdp, report_date, import_source)
            VALUES (NEW.hora, NEW.pdp, NEW.report_date, COALESCE(NEW.import_source, 'MANUAL'))
            ON CONFLICT (hora, report_date)
            DO UPDATE SET
                pdp = EXCLUDED.pdp,
                import_source = EXCLUDED.import_source,
                imported_at = NOW();
        END IF;
    END IF;

    -- Atualizar Geração se mudou
    IF NEW.geracao IS DISTINCT FROM OLD.geracao THEN
        IF NEW.geracao IS NULL THEN
            -- Remover Geração
            DELETE FROM generation_realizada
            WHERE hora = OLD.hora AND report_date = OLD.report_date;
        ELSE
            -- Inserir ou atualizar Geração
            INSERT INTO generation_realizada (hora, geracao, report_date)
            VALUES (NEW.hora, NEW.geracao, NEW.report_date)
            ON CONFLICT (hora, report_date)
            DO UPDATE SET
                geracao = EXCLUDED.geracao,
                updated_at = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================
-- Função: DELETE
-- ==================

CREATE OR REPLACE FUNCTION generation_data_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Deletar de ambas as tabelas
    DELETE FROM pdp_data
    WHERE hora = OLD.hora AND report_date = OLD.report_date;

    DELETE FROM generation_realizada
    WHERE hora = OLD.hora AND report_date = OLD.report_date;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- PASSO 2: Renomear tabela antiga (backup)
-- ===================================================

ALTER TABLE generation_data RENAME TO generation_data_old;

COMMENT ON TABLE generation_data_old IS 'Tabela antiga - mantida como backup. Será removida após validação.';

-- ===================================================
-- PASSO 3: Criar VIEW generation_data
-- ===================================================

CREATE OR REPLACE VIEW generation_data AS
SELECT
    -- ID: preferir ID da geração, senão do PDP
    COALESCE(g.id, p.id) AS id,

    -- Hora e data
    COALESCE(g.hora, p.hora) AS hora,
    COALESCE(g.report_date, p.report_date) AS report_date,

    -- Dados principais
    p.pdp,
    g.geracao,

    -- Metadados
    COALESCE(g.created_at, p.created_at) AS created_at,
    g.updated_at,

    -- Informações adicionais (para debug e auditoria)
    p.import_source,
    p.imported_at

FROM pdp_data p
FULL OUTER JOIN generation_realizada g
    ON p.hora = g.hora
    AND p.report_date = g.report_date
ORDER BY report_date, hora;

COMMENT ON VIEW generation_data IS 'VIEW de compatibilidade que une pdp_data e generation_realizada. Mantém interface idêntica à tabela antiga para não quebrar código frontend.';

-- ===================================================
-- PASSO 4: Criar INSTEAD OF Triggers
-- ===================================================

-- Trigger: INSERT
DROP TRIGGER IF EXISTS generation_data_insert_trigger ON generation_data;
CREATE TRIGGER generation_data_insert_trigger
INSTEAD OF INSERT ON generation_data
FOR EACH ROW
EXECUTE FUNCTION generation_data_insert();

-- Trigger: UPDATE
DROP TRIGGER IF EXISTS generation_data_update_trigger ON generation_data;
CREATE TRIGGER generation_data_update_trigger
INSTEAD OF UPDATE ON generation_data
FOR EACH ROW
EXECUTE FUNCTION generation_data_update();

-- Trigger: DELETE
DROP TRIGGER IF EXISTS generation_data_delete_trigger ON generation_data;
CREATE TRIGGER generation_data_delete_trigger
INSTEAD OF DELETE ON generation_data
FOR EACH ROW
EXECUTE FUNCTION generation_data_delete();

-- ===================================================
-- PASSO 5: Verificação
-- ===================================================

-- Testar SELECT
SELECT
    'Teste SELECT' AS teste,
    COUNT(*) AS total_registros
FROM generation_data;

-- Verificar estrutura da VIEW
SELECT
    'Estrutura da VIEW' AS info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'generation_data'
ORDER BY ordinal_position;

-- ===================================================
-- RESULTADO
-- ===================================================

SELECT
    '✅ VIEW e Triggers criados com sucesso!' AS status,
    'Tabela generation_data agora é uma VIEW' AS observacao,
    'Código frontend continua funcionando sem mudanças' AS compatibilidade;
