-- ===================================================
-- FUNÇÃO: analyze_control_effectiveness
-- Analisa efetividade das mudanças de set-point
-- ===================================================
--
-- DESCRIÇÃO:
-- Esta função compara desvios antes e depois de cada
-- mudança de set-point, calculando métricas de efetividade.
--
-- PARÂMETROS:
-- - p_report_date: Data para análise
-- - p_window_hours: Janela de tempo (padrão: 1 hora)
--
-- USO:
-- SELECT * FROM analyze_control_effectiveness('2025-11-09', 1.0);
-- SELECT * FROM analyze_control_effectiveness('2025-11-09', 0.5);
--
-- DATA: 2025-11-12
-- STATUS: Pronto para execução
-- ===================================================

CREATE OR REPLACE FUNCTION analyze_control_effectiveness(
    p_report_date DATE,
    p_window_hours NUMERIC DEFAULT 1.0
)
RETURNS TABLE (
    control_id BIGINT,
    hora_controle TIME,
    setpoint DECIMAL,
    responsavel VARCHAR,
    detalhe TEXT,
    -- Métricas antes da mudança
    desvio_medio_antes DECIMAL,
    desvio_max_antes DECIMAL,
    registros_antes INTEGER,
    -- Métricas depois da mudança
    desvio_medio_depois DECIMAL,
    desvio_max_depois DECIMAL,
    registros_depois INTEGER,
    -- Análise de efetividade
    melhora_percentual DECIMAL,
    tempo_estabilizacao_minutos INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        gc.id,
        gc.hora,
        gc.setpoint,
        gc.responsavel,
        gc.detalhe,

        -- ========================================
        -- MÉTRICAS ANTES DA MUDANÇA
        -- ========================================

        -- Desvio médio antes
        (SELECT COALESCE(AVG(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
           AND gd.hora::time < gc.hora
        )::DECIMAL AS desvio_medio_antes,

        -- Desvio máximo antes
        (SELECT COALESCE(MAX(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
           AND gd.hora::time < gc.hora
        )::DECIMAL AS desvio_max_antes,

        -- Quantidade de registros antes
        (SELECT COUNT(*)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
           AND gd.hora::time < gc.hora
        )::INTEGER AS registros_antes,

        -- ========================================
        -- MÉTRICAS DEPOIS DA MUDANÇA
        -- ========================================

        -- Desvio médio depois
        (SELECT COALESCE(AVG(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        )::DECIMAL AS desvio_medio_depois,

        -- Desvio máximo depois
        (SELECT COALESCE(MAX(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        )::DECIMAL AS desvio_max_depois,

        -- Quantidade de registros depois
        (SELECT COUNT(*)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        )::INTEGER AS registros_depois,

        -- ========================================
        -- ANÁLISE DE EFETIVIDADE
        -- ========================================

        -- Melhora percentual (positivo = melhorou, negativo = piorou)
        (100.0 * (1.0 - (
            SELECT COALESCE(AVG(ABS(gd.geracao - gd.pdp)), 0)
            FROM generation_data gd
            WHERE gd.report_date = p_report_date
              AND gd.hora::time >= gc.hora
              AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        ) / NULLIF((
            SELECT AVG(ABS(gd.geracao - gd.pdp))
            FROM generation_data gd
            WHERE gd.report_date = p_report_date
              AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
              AND gd.hora::time < gc.hora
        ), 0)))::DECIMAL AS melhora_percentual,

        -- Tempo até estabilização (quando desvio fica < 10 MW do setpoint)
        (SELECT MIN(EXTRACT(EPOCH FROM (gd.hora::time - gc.hora)) / 60)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND ABS(gd.geracao - gc.setpoint) < 10
        )::INTEGER AS tempo_estabilizacao_minutos

    FROM generation_control gc
    WHERE gc.report_date = p_report_date
    ORDER BY gc.hora;
END;
$$ LANGUAGE plpgsql;

-- Adicionar comentário à função
COMMENT ON FUNCTION analyze_control_effectiveness IS 'Analisa a efetividade das mudanças de set-point comparando desvios antes e depois em uma janela de tempo configurável.';

-- Verificação
SELECT
    'Função criada com sucesso!' AS status,
    'Use: SELECT * FROM analyze_control_effectiveness(''2025-11-09'', 1.0);' AS exemplo;
