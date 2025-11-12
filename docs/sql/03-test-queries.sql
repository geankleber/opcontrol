-- ===================================================
-- QUERIES DE TESTE E EXEMPLOS
-- Consultas úteis para análise de dados integrados
-- ===================================================
--
-- DATA: 2025-11-12
-- STATUS: Pronto para uso
-- ===================================================

-- ===================================================
-- TESTE 1: Verificar VIEW generation_with_control
-- ===================================================

-- Buscar todos os registros de um dia com controle vigente
SELECT
    hora,
    pdp,
    geracao,
    desvio,
    setpoint_vigente,
    responsavel_vigente,
    ROUND(horas_desde_mudanca::NUMERIC, 2) AS horas_desde_mudanca
FROM generation_with_control
WHERE report_date = '2025-11-09'
  AND responsavel_vigente IS NOT NULL
ORDER BY hora
LIMIT 20;

-- ===================================================
-- TESTE 2: Análise de desvios por responsável
-- ===================================================

-- Calcular desvio médio por responsável
SELECT
    responsavel_vigente AS responsavel,
    COUNT(*) AS total_registros,
    ROUND(AVG(ABS(desvio))::NUMERIC, 2) AS desvio_medio_mw,
    ROUND(MAX(ABS(desvio))::NUMERIC, 2) AS desvio_maximo_mw,
    ROUND(MIN(ABS(desvio))::NUMERIC, 2) AS desvio_minimo_mw,
    ROUND(STDDEV(ABS(desvio))::NUMERIC, 2) AS desvio_padrao_mw
FROM generation_with_control
WHERE report_date = '2025-11-09'
  AND responsavel_vigente IS NOT NULL
GROUP BY responsavel_vigente
ORDER BY desvio_medio_mw;

-- ===================================================
-- TESTE 3: Performance após mudanças de set-point
-- ===================================================

-- Analisar como o sistema se comporta nos primeiros 30min, 1h e 2h após mudança
SELECT
    control_id,
    hora_mudanca_setpoint,
    responsavel_vigente,
    setpoint_vigente,
    -- Desvio nos primeiros 30 minutos
    ROUND(AVG(CASE WHEN horas_desde_mudanca <= 0.5 THEN ABS(desvio) END)::NUMERIC, 2) AS desvio_30min,
    -- Desvio na primeira hora
    ROUND(AVG(CASE WHEN horas_desde_mudanca <= 1.0 THEN ABS(desvio) END)::NUMERIC, 2) AS desvio_1h,
    -- Desvio nas primeiras 2 horas
    ROUND(AVG(CASE WHEN horas_desde_mudanca <= 2.0 THEN ABS(desvio) END)::NUMERIC, 2) AS desvio_2h
FROM generation_with_control
WHERE report_date = '2025-11-09'
  AND control_id IS NOT NULL
GROUP BY control_id, hora_mudanca_setpoint, responsavel_vigente, setpoint_vigente
ORDER BY hora_mudanca_setpoint;

-- ===================================================
-- TESTE 4: Usar função analyze_control_effectiveness
-- ===================================================

-- Análise com janela de 1 hora
SELECT
    hora_controle,
    ROUND(setpoint::NUMERIC, 0) AS setpoint_mw,
    responsavel,
    ROUND(desvio_medio_antes::NUMERIC, 2) AS antes_mw,
    ROUND(desvio_medio_depois::NUMERIC, 2) AS depois_mw,
    ROUND(melhora_percentual::NUMERIC, 1) AS melhora_percent,
    tempo_estabilizacao_minutos AS estabilizacao_min
FROM analyze_control_effectiveness('2025-11-09', 1.0)
ORDER BY hora_controle;

-- Análise com janela de 30 minutos (mais precisa)
SELECT
    hora_controle,
    ROUND(setpoint::NUMERIC, 0) AS setpoint_mw,
    responsavel,
    ROUND(desvio_medio_antes::NUMERIC, 2) AS antes_mw,
    ROUND(desvio_medio_depois::NUMERIC, 2) AS depois_mw,
    ROUND(melhora_percentual::NUMERIC, 1) AS melhora_percent,
    tempo_estabilizacao_minutos AS estabilizacao_min
FROM analyze_control_effectiveness('2025-11-09', 0.5)
ORDER BY hora_controle;

-- ===================================================
-- TESTE 5: Comparativo de efetividade ONS vs Axia
-- ===================================================

-- Calcular efetividade média por responsável
SELECT
    responsavel,
    COUNT(*) AS total_controles,
    ROUND(AVG(melhora_percentual)::NUMERIC, 1) AS melhora_media_percent,
    ROUND(AVG(tempo_estabilizacao_minutos)::NUMERIC, 0) AS tempo_medio_estabilizacao_min,
    ROUND(AVG(desvio_medio_antes)::NUMERIC, 2) AS desvio_antes_mw,
    ROUND(AVG(desvio_medio_depois)::NUMERIC, 2) AS desvio_depois_mw
FROM analyze_control_effectiveness('2025-11-09', 1.0)
GROUP BY responsavel
ORDER BY melhora_media_percent DESC;

-- ===================================================
-- TESTE 6: Identificar controles mais efetivos
-- ===================================================

-- Top 5 controles com melhor resultado
SELECT
    hora_controle,
    ROUND(setpoint::NUMERIC, 0) AS setpoint_mw,
    responsavel,
    ROUND(melhora_percentual::NUMERIC, 1) AS melhora_percent,
    detalhe
FROM analyze_control_effectiveness('2025-11-09', 1.0)
WHERE melhora_percentual IS NOT NULL
ORDER BY melhora_percentual DESC
LIMIT 5;

-- ===================================================
-- TESTE 7: Identificar controles que pioraram situação
-- ===================================================

-- Controles com melhora negativa (pioraram)
SELECT
    hora_controle,
    ROUND(setpoint::NUMERIC, 0) AS setpoint_mw,
    responsavel,
    ROUND(desvio_medio_antes::NUMERIC, 2) AS antes_mw,
    ROUND(desvio_medio_depois::NUMERIC, 2) AS depois_mw,
    ROUND(melhora_percentual::NUMERIC, 1) AS melhora_percent,
    detalhe
FROM analyze_control_effectiveness('2025-11-09', 1.0)
WHERE melhora_percentual < 0
ORDER BY melhora_percentual;

-- ===================================================
-- TESTE 8: Distribuição temporal dos controles
-- ===================================================

-- Contar controles por período do dia
SELECT
    CASE
        WHEN EXTRACT(HOUR FROM hora_controle) BETWEEN 0 AND 5 THEN '00h-06h (Madrugada)'
        WHEN EXTRACT(HOUR FROM hora_controle) BETWEEN 6 AND 11 THEN '06h-12h (Manhã)'
        WHEN EXTRACT(HOUR FROM hora_controle) BETWEEN 12 AND 17 THEN '12h-18h (Tarde)'
        ELSE '18h-24h (Noite)'
    END AS periodo,
    responsavel,
    COUNT(*) AS total_controles,
    ROUND(AVG(melhora_percentual)::NUMERIC, 1) AS melhora_media
FROM analyze_control_effectiveness('2025-11-09', 1.0)
GROUP BY periodo, responsavel
ORDER BY periodo, responsavel;

-- ===================================================
-- TESTE 9: Timeline completa de um dia
-- ===================================================

-- Visão unificada de dados + controles
SELECT
    hora,
    ROUND(pdp::NUMERIC, 0) AS pdp_mw,
    ROUND(geracao::NUMERIC, 0) AS geracao_mw,
    ROUND(desvio::NUMERIC, 0) AS desvio_mw,
    ROUND(setpoint_vigente::NUMERIC, 0) AS setpoint_vigente_mw,
    responsavel_vigente,
    CASE
        WHEN hora::time = hora_mudanca_setpoint THEN '🔄 MUDANÇA'
        ELSE ''
    END AS evento
FROM generation_with_control
WHERE report_date = '2025-11-09'
ORDER BY hora;

-- ===================================================
-- TESTE 10: Estatísticas gerais do dia
-- ===================================================

SELECT
    COUNT(DISTINCT control_id) AS total_mudancas_controle,
    COUNT(*) AS total_registros_geracao,
    ROUND(AVG(ABS(desvio))::NUMERIC, 2) AS desvio_medio_dia_mw,
    ROUND(MAX(ABS(desvio))::NUMERIC, 2) AS desvio_maximo_dia_mw,
    COUNT(DISTINCT responsavel_vigente) AS responsaveis_diferentes
FROM generation_with_control
WHERE report_date = '2025-11-09';

-- ===================================================
-- FIM DOS TESTES
-- ===================================================
