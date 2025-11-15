# ⏰ Agendamento Automático - Importação de PDP

Este documento explica como configurar a importação automática de dados de PDP da API do ONS **todos os dias às 23h30**, buscando dados do **dia seguinte**.

---

## 📋 Visão Geral

- **Horário**: 23:30 (horário de Brasília)
- **Frequência**: Todos os dias
- **Dados**: PDP do dia seguinte (CURRENT_DATE + 1)
- **Método**: Cron job usando pg_cron no Supabase
- **Ação**: Chama Edge Function `import-pdp`

---

## 🎯 Por que 23h30?

- ONS geralmente publica PDP do dia seguinte no final do dia
- 23h30 garante que dados já foram publicados
- Se dados ainda estiverem zerados, tentará novamente no próximo dia

---

## ⚙️ Configuração Passo a Passo

### 0. **Habilitar Extensão pg_cron** ⚠️ PASSO OBRIGATÓRIO

A extensão `pg_cron` precisa estar habilitada antes de criar o agendamento.

**Opção 1: Via Supabase Dashboard (RECOMENDADO)**

1. Acesse o Supabase Dashboard
2. Vá para **Database** > **Extensions**
3. Procure por **pg_cron** na lista
4. Clique no toggle para **ENABLE**
5. Aguarde alguns segundos até aparecer "✓ Enabled"

**Opção 2: Via SQL Editor**

Execute o script `docs/sql/00-enable-pg-cron.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**Verificar se foi habilitada:**

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'pg_cron';
```

Se retornar uma linha com `pg_cron`, a extensão está habilitada! ✅

---

### 1. **Obter ANON_KEY**

Acesse o Supabase Dashboard:
1. Vá para **Settings** > **API**
2. Copie a chave **anon public**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2. **Abrir SQL Editor**

No Supabase Dashboard:
- Vá para **SQL Editor**
- Clique em **+ New query**

### 3. **Executar Script de Agendamento**

Abra o arquivo `docs/sql/07-schedule-import-pdp-daily.sql` e:

1. **Substitua `[SEU_ANON_KEY]`** pela chave copiada no passo 1

2. **Execute o script** (ou só a parte do agendamento):

```sql
SELECT cron.schedule(
  'import-pdp-daily',
  '30 2 * * *',  -- 02:30 UTC = 23:30 BRT (horário de Brasília)
  $$
  SELECT
    net.http_post(
      url := 'https://shjbfriuqrwbnqochybz.supabase.co/functions/v1/import-pdp',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer SUA_ANON_KEY_AQUI'
      ),
      body := jsonb_build_object(
        'date', (CURRENT_DATE + 1)::text
      )
    );
  $$
);
```

**⚠️ IMPORTANTE**: O horário `'30 2 * * *'` significa:
- **02:30 UTC** = **23:30 BRT** (horário de Brasília)
- Servidores Supabase usam UTC por padrão
- Brasil tem UTC-3, então subtraímos 3 horas

### 4. **Verificar se foi criado**

Execute esta query:

```sql
SELECT
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname = 'import-pdp-daily';
```

Deve retornar:

```
| jobid | jobname           | schedule    | active |
|-------|-------------------|-------------|--------|
| 1     | import-pdp-daily  | 30 2 * * *  | true   |
```

---

## 📊 Monitoramento

### Ver última execução

```sql
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
```

### Ver histórico das últimas 10 execuções

```sql
SELECT
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE job_name = 'import-pdp-daily'
ORDER BY start_time DESC
LIMIT 10;
```

### Ver estatísticas

```sql
SELECT
  status,
  COUNT(*) as total,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as duracao_media_segundos
FROM cron.job_run_details
WHERE job_name = 'import-pdp-daily'
  AND start_time > NOW() - INTERVAL '30 days'
GROUP BY status;
```

---

## 🔧 Gerenciamento

### Desabilitar temporariamente

```sql
UPDATE cron.job
SET active = false
WHERE jobname = 'import-pdp-daily';
```

### Reabilitar

```sql
UPDATE cron.job
SET active = true
WHERE jobname = 'import-pdp-daily';
```

### Alterar horário

```sql
-- Exemplo: mudar para 22:00 BRT (01:00 UTC)
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'import-pdp-daily'),
  schedule := '0 1 * * *'
);
```

### Remover completamente

```sql
SELECT cron.unschedule('import-pdp-daily');
```

---

## 🧪 Teste Manual

Para testar sem esperar o horário agendado:

```sql
SELECT
  net.http_post(
    url := 'https://shjbfriuqrwbnqochybz.supabase.co/functions/v1/import-pdp',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer SUA_ANON_KEY_AQUI'
    ),
    body := jsonb_build_object(
      'date', (CURRENT_DATE + 1)::text
    )
  );
```

Ou via terminal:

```bash
curl -X POST \
  https://shjbfriuqrwbnqochybz.supabase.co/functions/v1/import-pdp \
  -H 'Authorization: Bearer eyJhbGc...' \
  -H 'Content-Type: application/json' \
  -d "{\"date\": \"$(date -d '+1 day' +%Y-%m-%d)\"}"
```

---

## 📝 Cron Expression - Referência

A expressão `'30 2 * * *'` significa:

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── dia do mês (1 - 31)
│ │ │ ┌───────────── mês (1 - 12)
│ │ │ │ ┌───────────── dia da semana (0 - 6) (Domingo = 0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Exemplos:**

| Expressão      | Significado                          | Horário BRT |
|----------------|--------------------------------------|-------------|
| `0 0 * * *`    | Todo dia à meia-noite (UTC)          | 21:00       |
| `30 2 * * *`   | Todo dia às 02:30 (UTC)              | 23:30       |
| `0 6 * * *`    | Todo dia às 06:00 (UTC)              | 03:00       |
| `0 12 * * *`   | Todo dia ao meio-dia (UTC)           | 09:00       |
| `0 0 * * 1`    | Toda segunda-feira à meia-noite      | 21:00 Dom   |
| `*/30 * * * *` | A cada 30 minutos                    | -           |

---

## ⚠️ Observações Importantes

### 1. **Horário do Servidor**
- Servidores Supabase usam **UTC** por padrão
- Brasil (BRT) = **UTC-3**
- Para executar às **23:30 BRT**, use `'30 2 * * *'` (02:30 UTC)

### 2. **Dia Seguinte**
- `CURRENT_DATE + 1` sempre busca PDP do próximo dia
- Exemplo: se hoje é 14/11, busca PDP de 15/11

### 3. **Dados Zerados**
- Se PDP ainda não foi publicado (todos zeros), Edge Function retorna:
  - `"Ainda não existem dados a serem importados"`
- Não há problema, tentará novamente no dia seguinte

### 4. **Falhas**
- Se API do ONS estiver indisponível, cron registra falha
- Tentará novamente no próximo dia (não há retry automático)
- Monitorar `cron.job_run_details` para identificar falhas

### 5. **Segurança**
- ANON_KEY é seguro para uso server-side
- Edge Function valida credenciais ONS via secrets (não expostos)
- Cron executa no contexto do banco de dados

### 6. **Performance**
- Importação leva ~3-5 segundos
- Não impacta performance do sistema
- pg_cron executa em processo separado

---

## 🐛 Troubleshooting

### Problema: Erro "schema cron does not exist"

**Erro completo:**
```
ERROR: 3F000: schema "cron" does not exist
LINE 1: SELECT cron.schedule(
```

**Causa:**
A extensão `pg_cron` não está habilitada.

**Solução:**
Volte ao **Passo 0** e habilite a extensão `pg_cron`:

1. Via Dashboard: **Database** > **Extensions** > Habilitar **pg_cron**
2. Ou execute: `CREATE EXTENSION IF NOT EXISTS pg_cron;`

Depois de habilitar, execute o script de agendamento novamente.

---

### Problema: Job não está executando

**Verificar:**
```sql
SELECT * FROM cron.job WHERE jobname = 'import-pdp-daily';
```

**Soluções:**
- Verificar se `active = true`
- Verificar se o horário está correto
- Verificar logs: `SELECT * FROM cron.job_run_details`

### Problema: Execuções sempre com status 'failed'

**Verificar:**
```sql
SELECT
  return_message
FROM cron.job_run_details
WHERE job_name = 'import-pdp-daily'
  AND status = 'failed'
ORDER BY start_time DESC
LIMIT 5;
```

**Causas comuns:**
- ANON_KEY incorreta
- URL da Edge Function incorreta
- Edge Function não deployada
- Secrets do ONS não configurados

### Problema: Dados não aparecem no sistema

**Verificar:**
1. Se job executou com sucesso:
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE job_name = 'import-pdp-daily'
   ORDER BY start_time DESC LIMIT 1;
   ```

2. Se dados foram importados:
   ```sql
   SELECT COUNT(*) FROM pdp_data
   WHERE import_source = 'ONS_API'
     AND report_date = CURRENT_DATE + 1;
   ```

3. Ver logs da Edge Function:
   ```bash
   supabase functions logs import-pdp
   ```

---

## 📈 Próximos Passos

Após configurar o agendamento:

1. ✅ **Monitorar primeira execução** (23:30 BRT)
2. ✅ **Verificar dados importados** no dia seguinte
3. ✅ **Configurar alertas** para falhas (opcional)
4. ✅ **Documentar** em runbook operacional

---

## 📚 Referências

- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [Cron Expression Generator](https://crontab.guru/)

---

**Última atualização:** 2025-11-14
**Status:** Pronto para configuração
