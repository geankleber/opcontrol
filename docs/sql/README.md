# Scripts SQL - Integração Generation Control

## 📁 Estrutura dos Arquivos

Esta pasta contém scripts SQL prontos para implementação futura da integração entre dados de controle (`generation_control`) e dados realizados (`generation_data`).

### Arquivos Disponíveis

#### 🔮 Integração Futura (Análise de Controles)
| Arquivo | Descrição | Status | Tempo Estimado |
|---------|-----------|--------|----------------|
| `01-create-view-generation-with-control.sql` | Cria VIEW que relaciona dados com controles vigentes | ✅ Pronto | 5 min |
| `02-create-function-analyze-effectiveness.sql` | Cria função para análise de efetividade | ✅ Pronto | 5 min |
| `03-test-queries.sql` | Queries de teste e exemplos de uso | ✅ Pronto | 10 min |

#### 🔄 Refatoração de Tabelas (Separar PDP)
| Arquivo | Descrição | Status | Tempo Estimado |
|---------|-----------|--------|----------------|
| `04-refactor-create-new-tables.sql` | Cria tabelas pdp_data e generation_realizada | ✅ Pronto | 10 min |
| `05-refactor-migrate-data.sql` | Migra dados da tabela antiga para as novas | ✅ Pronto | 5 min |
| `06-refactor-create-view-and-triggers.sql` | Cria VIEW e triggers de compatibilidade | ✅ Pronto | 10 min |

## 🚀 Como Usar

### Pré-requisitos

- Acesso ao Supabase SQL Editor
- Tabelas `generation_data` e `generation_control` já criadas
- Dados de exemplo para testar (opcional)

### Passo a Passo

#### 1️⃣ Criar a VIEW

```bash
# Abra o arquivo 01-create-view-generation-with-control.sql
# Copie todo o conteúdo
# Cole no Supabase SQL Editor
# Execute (Ctrl+Enter ou botão Run)
```

**O que faz:**
- Cria a VIEW `generation_with_control`
- Relaciona cada registro de geração com o controle vigente naquele momento
- Calcula tempo decorrido desde a mudança de set-point

**Verificação:**
```sql
SELECT * FROM generation_with_control LIMIT 10;
```

#### 2️⃣ Criar a Função de Análise

```bash
# Abra o arquivo 02-create-function-analyze-effectiveness.sql
# Copie todo o conteúdo
# Cole no Supabase SQL Editor
# Execute (Ctrl+Enter ou botão Run)
```

**O que faz:**
- Cria a função `analyze_control_effectiveness`
- Compara desvios antes e depois de cada mudança
- Calcula métricas de efetividade e tempo de estabilização

**Verificação:**
```sql
SELECT * FROM analyze_control_effectiveness('2025-11-09', 1.0);
```

#### 3️⃣ Testar com Queries de Exemplo

```bash
# Abra o arquivo 03-test-queries.sql
# Execute as queries uma por uma para explorar os dados
# Ajuste as datas conforme necessário
```

**O que contém:**
- 10 queries de teste prontas
- Exemplos de análises úteis
- Comparativos e estatísticas

## 📊 Exemplos de Uso

### Exemplo 1: Ver dados com controle vigente

```sql
SELECT
    hora,
    geracao,
    pdp,
    desvio,
    setpoint_vigente,
    responsavel_vigente
FROM generation_with_control
WHERE report_date = '2025-11-09'
ORDER BY hora;
```

### Exemplo 2: Analisar efetividade dos controles

```sql
-- Janela de 1 hora antes/depois
SELECT
    hora_controle,
    responsavel,
    desvio_medio_antes,
    desvio_medio_depois,
    melhora_percentual
FROM analyze_control_effectiveness('2025-11-09', 1.0);
```

### Exemplo 3: Comparar ONS vs Axia Energia

```sql
SELECT
    responsavel,
    COUNT(*) AS total_controles,
    AVG(melhora_percentual) AS melhora_media,
    AVG(tempo_estabilizacao_minutos) AS tempo_medio
FROM analyze_control_effectiveness('2025-11-09', 1.0)
GROUP BY responsavel;
```

## 🔧 Manutenção

### Remover VIEW

```sql
DROP VIEW IF EXISTS generation_with_control;
```

### Remover Função

```sql
DROP FUNCTION IF EXISTS analyze_control_effectiveness;
```

### Recriar com Modificações

Basta executar o script novamente com `CREATE OR REPLACE`.

## 📈 Performance

### Índices Recomendados

Estes índices já devem existir nas tabelas originais:

```sql
-- Em generation_data
CREATE INDEX IF NOT EXISTS idx_generation_data_report_date ON generation_data(report_date);
CREATE INDEX IF NOT EXISTS idx_generation_data_hora ON generation_data(hora);

-- Em generation_control
CREATE INDEX IF NOT EXISTS idx_generation_control_report_date ON generation_control(report_date);
CREATE INDEX IF NOT EXISTS idx_generation_control_created_at ON generation_control(created_at DESC);
```

### Estimativas de Performance

Com os índices adequados:
- VIEW: < 100ms para 48 registros (1 dia)
- Função: < 500ms para análise de 10 controles

## 🎯 Casos de Uso

### 1. Relatório Diário de Efetividade

```sql
-- Gerar relatório completo do dia
SELECT
    hora_controle AS "Hora",
    responsavel AS "Responsável",
    ROUND(setpoint::NUMERIC, 0) || ' MW' AS "Set-point",
    ROUND(melhora_percentual::NUMERIC, 1) || '%' AS "Melhora",
    COALESCE(tempo_estabilizacao_minutos::TEXT, '--') || ' min' AS "Estabilização"
FROM analyze_control_effectiveness(CURRENT_DATE, 1.0)
ORDER BY hora_controle;
```

### 2. Dashboard de KPIs

```sql
-- KPIs do dia
SELECT
    COUNT(*) AS total_mudancas,
    ROUND(AVG(melhora_percentual)::NUMERIC, 1) AS melhora_media,
    ROUND(AVG(tempo_estabilizacao_minutos)::NUMERIC, 0) AS tempo_medio_estabilizacao,
    COUNT(*) FILTER (WHERE melhora_percentual > 0) AS mudancas_efetivas,
    COUNT(*) FILTER (WHERE melhora_percentual < 0) AS mudancas_negativas
FROM analyze_control_effectiveness(CURRENT_DATE, 1.0);
```

### 3. Análise Histórica (Múltiplos Dias)

```sql
-- Comparar efetividade ao longo da semana
SELECT
    report_date,
    COUNT(*) AS total_controles,
    ROUND(AVG(melhora_percentual)::NUMERIC, 1) AS melhora_media
FROM (
    SELECT report_date, hora_controle, melhora_percentual
    FROM generation_control gc
    CROSS JOIN LATERAL (
        SELECT melhora_percentual
        FROM analyze_control_effectiveness(gc.report_date, 1.0)
        WHERE hora_controle = gc.hora
    ) eff
) sub
WHERE report_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY report_date
ORDER BY report_date;
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"

**Problema:** Tabelas base não existem.

**Solução:**
```sql
-- Verificar se as tabelas existem
SELECT tablename FROM pg_tables
WHERE tablename IN ('generation_data', 'generation_control');
```

### Erro: "no data found"

**Problema:** Sem dados para a data especificada.

**Solução:**
```sql
-- Verificar datas disponíveis
SELECT DISTINCT report_date
FROM generation_control
ORDER BY report_date DESC;
```

### VIEW retorna NULL em setpoint_vigente

**Problema:** Sem controles registrados antes do horário.

**Explicação:** Normal quando não há controle prévio (início do dia).

## 📚 Referências

- [PostgreSQL LATERAL JOIN](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/xfunc-sql.html)
- [PostgreSQL Views](https://www.postgresql.org/docs/current/sql-createview.html)

## ✅ Checklist de Implementação

- [ ] Executar script 01 (CREATE VIEW)
- [ ] Executar script 02 (CREATE FUNCTION)
- [ ] Testar com dados reais
- [ ] Executar queries de exemplo (script 03)
- [ ] Validar performance com volume esperado
- [ ] Documentar resultados
- [ ] Decidir sobre próximas fases (frontend, dashboard)

---

**Última atualização:** 2025-11-12
**Status:** Pronto para implementação
**Documentação completa:** [PLANOS-FUTUROS-INTEGRACAO.md](../PLANOS-FUTUROS-INTEGRACAO.md)
