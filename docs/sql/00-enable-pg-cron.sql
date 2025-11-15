-- ===================================================
-- HABILITAR EXTENSÃO pg_cron
-- ===================================================
--
-- DESCRIÇÃO:
-- Este script habilita a extensão pg_cron necessária para
-- o agendamento automático de tarefas no PostgreSQL.
--
-- IMPORTANTE:
-- - Execute este script ANTES do script de agendamento
-- - Requer privilégios de administrador
-- - No Supabase, pg_cron está disponível em todos os planos
--
-- DATA: 2025-11-15
-- STATUS: Pronto para execução
-- ===================================================

-- ===================================================
-- PASSO 1: Verificar extensões disponíveis
-- ===================================================

-- Ver todas as extensões instaladas
SELECT
  extname AS "Extensão",
  extversion AS "Versão"
FROM pg_extension
ORDER BY extname;

-- ===================================================
-- PASSO 2: Habilitar pg_cron
-- ===================================================

-- Criar a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===================================================
-- PASSO 3: Verificar se foi habilitada
-- ===================================================

-- Confirmar que pg_cron está instalada
SELECT
  extname AS "Extensão",
  extversion AS "Versão",
  '✅ pg_cron habilitado com sucesso!' AS "Status"
FROM pg_extension
WHERE extname = 'pg_cron';

-- ===================================================
-- PASSO 4: Verificar schema cron
-- ===================================================

-- Listar objetos no schema cron
SELECT
  schemaname AS "Schema",
  tablename AS "Tabela",
  '✅ Schema cron disponível' AS "Status"
FROM pg_tables
WHERE schemaname = 'cron'
ORDER BY tablename;

-- ===================================================
-- RESULTADO ESPERADO
-- ===================================================

/*
Após executar este script, você deve ver:

1. pg_cron na lista de extensões instaladas
2. Schema "cron" disponível
3. Tabelas no schema cron: job, job_run_details

Se você vir esses resultados, pode prosseguir com o
script 07-schedule-import-pdp-daily.sql
*/

-- ===================================================
-- TROUBLESHOOTING
-- ===================================================

/*
ERRO: "permission denied to create extension"

CAUSA:
  Você não tem privilégios de administrador

SOLUÇÃO:
  No Supabase Dashboard:
  1. Vá para Database > Extensions
  2. Procure por "pg_cron"
  3. Clique no toggle para habilitar
  4. Aguarde alguns segundos
  5. Execute este script novamente para verificar

---

ERRO: "extension pg_cron is not available"

CAUSA:
  A extensão não está disponível no seu plano

SOLUÇÃO:
  pg_cron está disponível em todos os planos do Supabase.
  Se o erro persistir, contate o suporte do Supabase.

---

ALTERNATIVA SEM pg_cron:

Se pg_cron não estiver disponível, você pode usar:
- Cron jobs externos (GitHub Actions, cron no servidor)
- Supabase Edge Functions com triggers HTTP
- Serviços de agendamento (EasyCron, cron-job.org)

*/
