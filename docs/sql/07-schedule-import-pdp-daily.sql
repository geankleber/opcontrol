-- ===================================================
-- AGENDAMENTO: Importar PDP Automaticamente
-- ===================================================
--
-- DESCRIÇÃO:
-- Configura importação automática de PDP da API do ONS
-- todos os dias às 23:30 (horário do servidor)
-- Busca dados do DIA SEGUINTE
--
-- IMPORTANTE:
-- - Execute este script uma única vez
-- - Requer extensão pg_cron habilitada
-- - Horário é do servidor (UTC por padrão)
-- - Para horário de Brasília (UTC-3), ajustar horário
--
-- DATA: 2025-11-14
-- STATUS: Pronto para execução
-- ===================================================

-- ===================================================
-- PASSO 1: Habilitar extensão pg_cron (se necessário)
-- ===================================================

-- Verificar se a extensão já está habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Se não retornar nada, habilitar (somente administradores podem fazer isso)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===================================================
-- PASSO 2: Criar agendamento diário
-- ===================================================

-- ATENÇÃO: Ajustar ANON_KEY antes de executar!
-- Substitua [SEU_ANON_KEY] pela sua chave anon do Supabase
-- Encontre em: Dashboard > Settings > API > Project API keys > anon public

SELECT cron.schedule(
  'import-pdp-daily',           -- Nome do job
  '30 23 * * *',                 -- Cron expression: 23:30 todos os dias (horário UTC)
  $$
  SELECT
    net.http_post(
      url := 'https://shjbfriuqrwbnqochybz.supabase.co/functions/v1/import-pdp',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer [SEU_ANON_KEY]'
      ),
      body := jsonb_build_object(
        'date', (CURRENT_DATE + 1)::text
      )
    );
  $$
);

-- ===================================================
-- EXPLICAÇÃO DA CRON EXPRESSION
-- ===================================================
--
-- '30 23 * * *' significa:
--   - Minuto: 30
--   - Hora: 23 (11 PM)
--   - Dia do mês: * (todos)
--   - Mês: * (todos)
--   - Dia da semana: * (todos)
--
-- Horário do servidor (normalmente UTC):
-- - 23:30 UTC = 20:30 BRT (horário de Brasília)
--
-- Para executar às 23:30 BRT:
-- - Usar '30 2 * * *' (02:30 UTC do dia seguinte)
--
-- ===================================================

-- ===================================================
-- PASSO 3: Verificar agendamentos ativos
-- ===================================================

SELECT
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job
ORDER BY jobid DESC;

-- ===================================================
-- PASSO 4: Ver histórico de execuções
-- ===================================================

SELECT
  jobid,
  job_name,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE job_name = 'import-pdp-daily'
ORDER BY start_time DESC
LIMIT 10;

-- ===================================================
-- COMANDOS ÚTEIS
-- ===================================================

-- DESABILITAR agendamento (manter configuração)
-- UPDATE cron.job SET active = false WHERE jobname = 'import-pdp-daily';

-- REABILITAR agendamento
-- UPDATE cron.job SET active = true WHERE jobname = 'import-pdp-daily';

-- ALTERAR HORÁRIO do agendamento
-- SELECT cron.alter_job(
--   job_id := (SELECT jobid FROM cron.job WHERE jobname = 'import-pdp-daily'),
--   schedule := '30 2 * * *'  -- Novo horário: 02:30 UTC (23:30 BRT)
-- );

-- REMOVER COMPLETAMENTE o agendamento
-- SELECT cron.unschedule('import-pdp-daily');

-- ===================================================
-- MONITORAMENTO
-- ===================================================

-- Ver última execução
SELECT
  job_name,
  status,
  return_message,
  start_time,
  end_time,
  end_time - start_time as duracao
FROM cron.job_run_details
WHERE job_name = 'import-pdp-daily'
ORDER BY start_time DESC
LIMIT 1;

-- Ver estatísticas das últimas 30 execuções
SELECT
  status,
  COUNT(*) as total,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as duracao_media_segundos
FROM cron.job_run_details
WHERE job_name = 'import-pdp-daily'
  AND start_time > NOW() - INTERVAL '30 days'
GROUP BY status;

-- ===================================================
-- TESTE MANUAL
-- ===================================================

-- Para testar sem esperar o horário agendado:
/*
SELECT
  net.http_post(
    url := 'https://shjbfriuqrwbnqochybz.supabase.co/functions/v1/import-pdp',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer [SEU_ANON_KEY]'
    ),
    body := jsonb_build_object(
      'date', (CURRENT_DATE + 1)::text
    )
  );
*/

-- ===================================================
-- NOTAS IMPORTANTES
-- ===================================================

/*
1. ANON_KEY:
   - Substituir [SEU_ANON_KEY] pela chave real antes de executar
   - Encontrar em: Supabase Dashboard > Settings > API

2. HORÁRIO:
   - Servidores Supabase usam UTC por padrão
   - Brasil (BRT) = UTC-3
   - Para executar às 23:30 BRT, usar '30 2 * * *' (02:30 UTC)

3. DIA SEGUINTE:
   - CURRENT_DATE + 1 busca dados do próximo dia
   - Exemplo: se hoje é 14/11, busca PDP de 15/11

4. MONITORAMENTO:
   - Verificar cron.job_run_details regularmente
   - Configurar alertas se status = 'failed'

5. SEGURANÇA:
   - ANON_KEY é seguro para uso server-side
   - Edge Function valida credenciais ONS via secrets
   - Não expõe credenciais do ONS

6. FALHAS:
   - Se API do ONS estiver indisponível, cron tentará novamente no próximo dia
   - Verificar logs: supabase functions logs import-pdp

7. DADOS ZERADOS:
   - Se PDP do dia seguinte ainda não foi publicado (todos zeros)
   - Edge Function retorna erro "Ainda não existem dados a serem importados"
   - Não há problema, tentará novamente no dia seguinte
*/

-- ===================================================
-- RESULTADO
-- ===================================================

SELECT
  '✅ Agendamento configurado com sucesso!' AS status,
  'Importação automática: 23:30 UTC (20:30 BRT)' AS horario,
  'Busca dados do dia seguinte (CURRENT_DATE + 1)' AS observacao,
  'Verificar cron.job para confirmar' AS proximo_passo;
