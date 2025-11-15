-- ===================================================
-- REFATORAÇÃO: Migrar Dados Existentes
-- ===================================================
--
-- DESCRIÇÃO:
-- Migra dados da tabela generation_data para as novas
-- tabelas pdp_data e generation_realizada
--
-- IMPORTANTE: Execute DEPOIS de 04-refactor-create-new-tables.sql
--
-- DATA: 2025-11-12
-- STATUS: Pronto para execução
-- ===================================================

-- ===================================================
-- BACKUP: Contar registros antes da migração
-- ===================================================

SELECT
    'ANTES DA MIGRAÇÃO' AS momento,
    COUNT(*) AS total_generation_data,
    COUNT(*) FILTER (WHERE pdp IS NOT NULL) AS com_pdp,
    COUNT(*) FILTER (WHERE geracao IS NOT NULL) AS com_geracao
FROM generation_data;

-- ===================================================
-- MIGRAÇÃO: PDP
-- ===================================================

INSERT INTO pdp_data (hora, pdp, report_date, created_at, import_source)
SELECT
    hora,
    pdp,
    report_date,
    created_at,
    'MIGRATED' -- Marca como migrado da tabela antiga
FROM generation_data
WHERE pdp IS NOT NULL
ON CONFLICT (hora, report_date) DO NOTHING;

-- ===================================================
-- MIGRAÇÃO: Geração Realizada
-- ===================================================

INSERT INTO generation_realizada (hora, geracao, report_date, created_at, updated_at)
SELECT
    hora,
    geracao,
    report_date,
    created_at,
    updated_at
FROM generation_data
WHERE geracao IS NOT NULL
ON CONFLICT (hora, report_date) DO NOTHING;

-- ===================================================
-- VERIFICAÇÃO: Comparar contagens
-- ===================================================

SELECT
    'APÓS MIGRAÇÃO' AS momento,
    (SELECT COUNT(*) FROM generation_data) AS total_generation_data_old,
    (SELECT COUNT(*) FROM pdp_data) AS total_pdp_data,
    (SELECT COUNT(*) FROM generation_realizada) AS total_generation_realizada;

-- ===================================================
-- VERIFICAÇÃO: Dados migrados corretamente
-- ===================================================

-- Verificar PDP
SELECT
    'Verificação PDP' AS tipo,
    COUNT(*) FILTER (WHERE pdp IS NOT NULL) AS na_tabela_antiga,
    (SELECT COUNT(*) FROM pdp_data WHERE import_source = 'MIGRATED') AS na_tabela_nova,
    CASE
        WHEN COUNT(*) FILTER (WHERE pdp IS NOT NULL) = (SELECT COUNT(*) FROM pdp_data WHERE import_source = 'MIGRATED')
        THEN '✅ OK'
        ELSE '❌ DIVERGÊNCIA'
    END AS status
FROM generation_data;

-- Verificar Geração
SELECT
    'Verificação Geração' AS tipo,
    COUNT(*) FILTER (WHERE geracao IS NOT NULL) AS na_tabela_antiga,
    (SELECT COUNT(*) FROM generation_realizada) AS na_tabela_nova,
    CASE
        WHEN COUNT(*) FILTER (WHERE geracao IS NOT NULL) = (SELECT COUNT(*) FROM generation_realizada)
        THEN '✅ OK'
        ELSE '❌ DIVERGÊNCIA'
    END AS status
FROM generation_data;

-- ===================================================
-- VERIFICAÇÃO: Dados por data
-- ===================================================

SELECT
    report_date,
    COUNT(*) AS total_registros,
    COUNT(*) FILTER (WHERE pdp IS NOT NULL) AS com_pdp,
    COUNT(*) FILTER (WHERE geracao IS NOT NULL) AS com_geracao
FROM generation_data
GROUP BY report_date
ORDER BY report_date DESC
LIMIT 10;

-- ===================================================
-- RESULTADO
-- ===================================================

SELECT
    CASE
        WHEN (
            SELECT COUNT(*) FILTER (WHERE pdp IS NOT NULL) FROM generation_data
        ) = (
            SELECT COUNT(*) FROM pdp_data WHERE import_source = 'MIGRATED'
        )
        AND (
            SELECT COUNT(*) FILTER (WHERE geracao IS NOT NULL) FROM generation_data
        ) = (
            SELECT COUNT(*) FROM generation_realizada
        )
        THEN '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!'
        ELSE '⚠️ ATENÇÃO: Verificar divergências acima'
    END AS resultado;
