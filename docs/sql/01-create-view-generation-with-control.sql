-- ===================================================
-- VIEW: generation_with_control
-- Relaciona dados de geração com controles vigentes
-- ===================================================
--
-- DESCRIÇÃO:
-- Esta VIEW mostra qual set-point estava vigente em cada
-- momento da operação, relacionando generation_data com
-- generation_control através de data e hora.
--
-- USO:
-- SELECT * FROM generation_with_control
-- WHERE report_date = '2025-11-09';
--
-- DATA: 2025-11-12
-- STATUS: Pronto para execução
-- ===================================================

CREATE OR REPLACE VIEW generation_with_control AS
SELECT
    gd.id,
    gd.report_date,
    gd.hora,
    gd.pdp,
    gd.geracao,
    gd.geracao - gd.pdp AS desvio,
    gc.id AS control_id,
    gc.setpoint AS setpoint_vigente,
    gc.responsavel AS responsavel_vigente,
    gc.hora AS hora_mudanca_setpoint,
    gc.detalhe AS detalhe_controle,
    -- Tempo decorrido desde a mudança de set-point (em horas)
    EXTRACT(EPOCH FROM (gd.hora::time - gc.hora)) / 3600 AS horas_desde_mudanca
FROM generation_data gd
LEFT JOIN LATERAL (
    -- Busca o controle mais recente antes ou no momento do registro
    SELECT id, setpoint, responsavel, hora, detalhe
    FROM generation_control gc2
    WHERE gc2.report_date = gd.report_date
      AND gc2.hora <= gd.hora::time
    ORDER BY gc2.hora DESC
    LIMIT 1
) gc ON true
ORDER BY gd.report_date, gd.hora;

-- Adicionar comentário à VIEW
COMMENT ON VIEW generation_with_control IS 'Relaciona dados de geração com o controle de set-point vigente em cada momento. Útil para análise de efetividade das mudanças de controle.';

-- Verificação
SELECT
    'View criada com sucesso!' AS status,
    COUNT(*) AS total_registros
FROM generation_with_control
LIMIT 1;
