-- ============================================
-- EXEMPLOS DE CONTROLES DA GERAÇÃO
-- ============================================
-- Execute este SQL no Supabase SQL Editor para inserir 10 exemplos
-- Data: 09/11/2025

INSERT INTO generation_control (report_date, hora, setpoint, responsavel, detalhe) VALUES
-- Exemplo 1: Carga base madrugada
('2025-11-09', '00:30', 1790, 'Axia Energia', 'Set-point padrão para operação de carga base na madrugada'),

-- Exemplo 2: Aumento de carga matinal
('2025-11-09', '06:30', 1850, 'ONS', 'Aumento de carga devido ao início da operação das indústrias na região'),

-- Exemplo 3: Ajuste técnico interno
('2025-11-09', '08:15', 1820, 'Axia Energia', 'Ajuste técnico para otimização da eficiência operacional'),

-- Exemplo 4: Pico de demanda
('2025-11-09', '10:45', 1900, 'ONS', 'Atendimento ao pico de demanda do sistema interligado nacional'),

-- Exemplo 5: Redução para manutenção
('2025-11-09', '12:00', 1650, 'Axia Energia', 'Redução programada para manutenção preventiva na unidade geradora 2'),

-- Exemplo 6: Retorno pós-manutenção
('2025-11-09', '14:30', 1790, 'Axia Energia', 'Retorno ao set-point normal após conclusão da manutenção preventiva'),

-- Exemplo 7: Aumento solicitado pelo ONS
('2025-11-09', '16:00', 1875, 'ONS', 'Aumento solicitado devido à indisponibilidade de outra usina no sistema'),

-- Exemplo 8: Ajuste para horário de ponta
('2025-11-09', '17:30', 1920, 'ONS', 'Máxima geração durante horário de ponta - alta demanda residencial'),

-- Exemplo 9: Redução pós-ponta
('2025-11-09', '20:00', 1780, 'ONS', 'Redução após horário de ponta - normalização da demanda'),

-- Exemplo 10: Operação noturna
('2025-11-09', '22:15', 1750, 'ONS', 'Ajuste para operação de base durante período noturno');

-- Verificar os registros inseridos
SELECT
    to_char(hora, 'HH24:MI') as hora,
    setpoint,
    responsavel,
    detalhe,
    to_char(created_at, 'DD/MM/YYYY HH24:MI:SS') as registrado_em
FROM generation_control
WHERE report_date = '2025-11-09'
ORDER BY hora;
