# Refatoração - Separar Dados PDP em Tabela Própria

## 📋 Motivação

Separar os dados de **PDP** (Programa Diário de Produção) dos dados de **Geração Realizada** traz diversos benefícios:

### Vantagens da Separação

✅ **Separação de Responsabilidades**
- PDP vem de fonte externa (API ONS)
- Geração é preenchida manualmente/internamente
- Diferentes origens de dados = diferentes tabelas

✅ **Rastreabilidade**
- Timestamp de quando PDP foi importado do ONS
- Histórico de atualizações separado
- Auditoria mais clara

✅ **Flexibilidade**
- PDP pode ser atualizado sem afetar geração
- Permite manter múltiplas versões do PDP
- Facilita reimportação de dados do ONS

✅ **Performance**
- Índices otimizados por tabela
- Queries mais eficientes
- Cache independente

✅ **Integridade**
- Constraints específicos por tipo de dado
- Validações diferentes para cada fonte
- Menos chance de corrupção de dados

---

## 🗄️ Estrutura Atual vs Nova Estrutura

### Estrutura Atual (generation_data)

```sql
-- Tabela única com PDP e Geração juntos
CREATE TABLE generation_data (
  id UUID PRIMARY KEY,
  hora TEXT NOT NULL,
  pdp NUMERIC,           -- ❌ Misturado com geração
  geracao NUMERIC,       -- ❌ Misturado com PDP
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(hora, report_date)
);
```

**Problemas:**
- ❌ Fonte de dados misturada (ONS + Manual)
- ❌ Difícil rastrear origem das atualizações
- ❌ PDP e Geração compartilham mesma linha
- ❌ Não permite versionamento do PDP

### Nova Estrutura (3 Tabelas)

```sql
-- Tabela 1: PDP (Programação do ONS)
CREATE TABLE pdp_data (
  id UUID PRIMARY KEY,
  hora TEXT NOT NULL,
  pdp NUMERIC NOT NULL,
  report_date DATE NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  import_source VARCHAR(50) DEFAULT 'ONS_API',
  UNIQUE(hora, report_date)
);

-- Tabela 2: Geração Realizada
CREATE TABLE generation_realizada (
  id UUID PRIMARY KEY,
  hora TEXT NOT NULL,
  geracao NUMERIC NOT NULL,
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hora, report_date)
);

-- Tabela 3: VIEW Unificada (compatibilidade)
CREATE OR REPLACE VIEW generation_data AS
SELECT
    COALESCE(p.id, g.id) AS id,
    COALESCE(p.hora, g.hora) AS hora,
    p.pdp,
    g.geracao,
    COALESCE(p.report_date, g.report_date) AS report_date,
    COALESCE(g.created_at, p.imported_at) AS created_at,
    g.updated_at
FROM pdp_data p
FULL OUTER JOIN generation_realizada g
    ON p.hora = g.hora
    AND p.report_date = g.report_date
ORDER BY report_date, hora;
```

**Vantagens:**
- ✅ Separação clara de responsabilidades
- ✅ VIEW mantém compatibilidade com código existente
- ✅ Rastreabilidade completa
- ✅ Permite queries específicas por fonte

---

## 📝 Script de Migração Completo

### Passo 1: Criar Novas Tabelas

```sql
-- ===================================================
-- CRIAR NOVA TABELA: pdp_data
-- Armazena dados de PDP importados do ONS
-- ===================================================

CREATE TABLE pdp_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hora TEXT NOT NULL,
  pdp NUMERIC NOT NULL,
  report_date DATE NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  import_source VARCHAR(50) DEFAULT 'ONS_API',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_pdp_data_report_date ON pdp_data(report_date);
CREATE INDEX idx_pdp_data_hora ON pdp_data(hora);
CREATE INDEX idx_pdp_data_imported_at ON pdp_data(imported_at DESC);

-- Constraint de unicidade
ALTER TABLE pdp_data ADD CONSTRAINT unique_pdp_hora_date
  UNIQUE(hora, report_date);

-- Comentários
COMMENT ON TABLE pdp_data IS 'Dados de Programa Diário de Produção (PDP) importados do ONS';
COMMENT ON COLUMN pdp_data.pdp IS 'Valor programado em MW';
COMMENT ON COLUMN pdp_data.import_source IS 'Fonte da importação (ONS_API, MANUAL, etc)';
COMMENT ON COLUMN pdp_data.imported_at IS 'Timestamp de quando foi importado do ONS';

-- ===================================================
-- CRIAR NOVA TABELA: generation_realizada
-- Armazena dados de geração realizada (preenchimento manual)
-- ===================================================

CREATE TABLE generation_realizada (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hora TEXT NOT NULL,
  geracao NUMERIC NOT NULL,
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_generation_realizada_report_date ON generation_realizada(report_date);
CREATE INDEX idx_generation_realizada_hora ON generation_realizada(hora);

-- Constraint de unicidade
ALTER TABLE generation_realizada ADD CONSTRAINT unique_geracao_hora_date
  UNIQUE(hora, report_date);

-- Comentários
COMMENT ON TABLE generation_realizada IS 'Dados de geração efetivamente realizada (MW)';
COMMENT ON COLUMN generation_realizada.geracao IS 'Valor realizado em MW';

-- ===================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ===================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generation_realizada_updated_at
BEFORE UPDATE ON generation_realizada
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- HABILITAR RLS (Row Level Security)
-- ===================================================

ALTER TABLE pdp_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_realizada ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajustar conforme necessário)
CREATE POLICY "Permitir leitura pública pdp_data"
ON pdp_data FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção pública pdp_data"
ON pdp_data FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública pdp_data"
ON pdp_data FOR UPDATE
USING (true);

CREATE POLICY "Permitir deleção pública pdp_data"
ON pdp_data FOR DELETE
USING (true);

CREATE POLICY "Permitir leitura pública generation_realizada"
ON generation_realizada FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção pública generation_realizada"
ON generation_realizada FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública generation_realizada"
ON generation_realizada FOR UPDATE
USING (true);

CREATE POLICY "Permitir deleção pública generation_realizada"
ON generation_realizada FOR DELETE
USING (true);
```

### Passo 2: Migrar Dados Existentes

```sql
-- ===================================================
-- MIGRAR DADOS DA TABELA ANTIGA PARA AS NOVAS
-- ===================================================

-- Migrar PDP
INSERT INTO pdp_data (hora, pdp, report_date, created_at)
SELECT
    hora,
    pdp,
    report_date,
    created_at
FROM generation_data
WHERE pdp IS NOT NULL;

-- Migrar Geração
INSERT INTO generation_realizada (hora, geracao, report_date, created_at, updated_at)
SELECT
    hora,
    geracao,
    report_date,
    created_at,
    updated_at
FROM generation_data
WHERE geracao IS NOT NULL;

-- Verificar migração
SELECT
    'generation_data' AS tabela,
    COUNT(*) AS total
FROM generation_data
UNION ALL
SELECT
    'pdp_data' AS tabela,
    COUNT(*) AS total
FROM pdp_data
UNION ALL
SELECT
    'generation_realizada' AS tabela,
    COUNT(*) AS total
FROM generation_realizada;
```

### Passo 3: Criar VIEW de Compatibilidade

```sql
-- ===================================================
-- VIEW: generation_data
-- Mantém compatibilidade com código frontend existente
-- ===================================================

CREATE OR REPLACE VIEW generation_data AS
SELECT
    -- ID: preferir ID da geração, senão do PDP
    COALESCE(g.id, p.id) AS id,

    -- Hora e data
    COALESCE(g.hora, p.hora) AS hora,
    COALESCE(g.report_date, p.report_date) AS report_date,

    -- Dados
    p.pdp,
    g.geracao,

    -- Metadados
    COALESCE(g.created_at, p.created_at) AS created_at,
    g.updated_at,

    -- Informações adicionais (para referência)
    p.import_source,
    p.imported_at

FROM pdp_data p
FULL OUTER JOIN generation_realizada g
    ON p.hora = g.hora
    AND p.report_date = g.report_date
ORDER BY report_date, hora;

-- Comentário
COMMENT ON VIEW generation_data IS 'VIEW de compatibilidade que une pdp_data e generation_realizada. Mantém interface para código frontend existente.';
```

### Passo 4: Criar INSTEAD OF Triggers para INSERT/UPDATE/DELETE

```sql
-- ===================================================
-- TRIGGERS INSTEAD OF para permitir INSERT/UPDATE/DELETE na VIEW
-- Isso mantém 100% de compatibilidade com código existente
-- ===================================================

-- Trigger: INSERT
CREATE OR REPLACE FUNCTION generation_data_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir PDP se fornecido
    IF NEW.pdp IS NOT NULL THEN
        INSERT INTO pdp_data (hora, pdp, report_date)
        VALUES (NEW.hora, NEW.pdp, NEW.report_date)
        ON CONFLICT (hora, report_date)
        DO UPDATE SET pdp = EXCLUDED.pdp;
    END IF;

    -- Inserir Geração se fornecido
    IF NEW.geracao IS NOT NULL THEN
        INSERT INTO generation_realizada (hora, geracao, report_date)
        VALUES (NEW.hora, NEW.geracao, NEW.report_date)
        ON CONFLICT (hora, report_date)
        DO UPDATE SET geracao = EXCLUDED.geracao;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generation_data_insert_trigger
INSTEAD OF INSERT ON generation_data
FOR EACH ROW
EXECUTE FUNCTION generation_data_insert();

-- Trigger: UPDATE
CREATE OR REPLACE FUNCTION generation_data_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar PDP se mudou
    IF NEW.pdp IS DISTINCT FROM OLD.pdp THEN
        IF NEW.pdp IS NULL THEN
            DELETE FROM pdp_data
            WHERE hora = OLD.hora AND report_date = OLD.report_date;
        ELSE
            INSERT INTO pdp_data (hora, pdp, report_date)
            VALUES (NEW.hora, NEW.pdp, NEW.report_date)
            ON CONFLICT (hora, report_date)
            DO UPDATE SET pdp = EXCLUDED.pdp;
        END IF;
    END IF;

    -- Atualizar Geração se mudou
    IF NEW.geracao IS DISTINCT FROM OLD.geracao THEN
        IF NEW.geracao IS NULL THEN
            DELETE FROM generation_realizada
            WHERE hora = OLD.hora AND report_date = OLD.report_date;
        ELSE
            INSERT INTO generation_realizada (hora, geracao, report_date)
            VALUES (NEW.hora, NEW.geracao, NEW.report_date)
            ON CONFLICT (hora, report_date)
            DO UPDATE SET geracao = EXCLUDED.geracao;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generation_data_update_trigger
INSTEAD OF UPDATE ON generation_data
FOR EACH ROW
EXECUTE FUNCTION generation_data_update();

-- Trigger: DELETE
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

CREATE TRIGGER generation_data_delete_trigger
INSTEAD OF DELETE ON generation_data
FOR EACH ROW
EXECUTE FUNCTION generation_data_delete();
```

---

## 🔄 Impacto no Código Frontend

### ✅ NENHUMA MUDANÇA NECESSÁRIA!

Graças à VIEW `generation_data` com INSTEAD OF triggers, **todo o código frontend continua funcionando sem alterações**:

```javascript
// ✅ Continua funcionando exatamente igual
const { data, error } = await supabase
    .from('generation_data')
    .select('*')
    .eq('report_date', selectedDate);

// ✅ INSERT continua funcionando
const { data, error } = await supabase
    .from('generation_data')
    .insert({ hora: '10:00', pdp: 1800, geracao: 1750, report_date: '2025-11-12' });

// ✅ UPDATE continua funcionando
const { data, error } = await supabase
    .from('generation_data')
    .update({ geracao: 1800 })
    .eq('hora', '10:00')
    .eq('report_date', '2025-11-12');

// ✅ DELETE continua funcionando
const { data, error } = await supabase
    .from('generation_data')
    .delete()
    .eq('report_date', '2025-11-12');
```

### 📊 Novas Funcionalidades Disponíveis

Com as tabelas separadas, agora você pode:

```javascript
// Query apenas PDP
const { data: pdpData } = await supabase
    .from('pdp_data')
    .select('*')
    .eq('report_date', selectedDate);

// Query apenas Geração
const { data: geracaoData } = await supabase
    .from('generation_realizada')
    .select('*')
    .eq('report_date', selectedDate);

// Ver quando PDP foi importado
const { data: lastImport } = await supabase
    .from('pdp_data')
    .select('imported_at, import_source')
    .eq('report_date', selectedDate)
    .order('imported_at', { ascending: false })
    .limit(1);
```

---

## 🎯 Queries Úteis Pós-Migração

### Verificar dados PDP sem geração

```sql
SELECT p.report_date, p.hora, p.pdp
FROM pdp_data p
LEFT JOIN generation_realizada g
    ON p.hora = g.hora AND p.report_date = g.report_date
WHERE g.geracao IS NULL
ORDER BY p.report_date, p.hora;
```

### Verificar dados de geração sem PDP

```sql
SELECT g.report_date, g.hora, g.geracao
FROM generation_realizada g
LEFT JOIN pdp_data p
    ON g.hora = p.hora AND g.report_date = p.report_date
WHERE p.pdp IS NULL
ORDER BY g.report_date, g.hora;
```

### Histórico de importações do ONS

```sql
SELECT
    report_date,
    COUNT(*) AS total_registros,
    MIN(imported_at) AS primeira_importacao,
    MAX(imported_at) AS ultima_importacao,
    import_source
FROM pdp_data
GROUP BY report_date, import_source
ORDER BY report_date DESC;
```

### Comparar PDP vs Geração

```sql
SELECT
    hora,
    pdp,
    geracao,
    geracao - pdp AS desvio,
    ROUND(((geracao - pdp) / NULLIF(pdp, 0) * 100)::NUMERIC, 2) AS desvio_percentual
FROM generation_data
WHERE report_date = '2025-11-12'
ORDER BY hora;
```

---

## 📋 Checklist de Migração

### Pré-Migração
- [ ] Fazer backup completo do banco de dados
- [ ] Testar scripts em ambiente de desenvolvimento
- [ ] Verificar quantidade de registros em `generation_data`

### Migração
- [ ] Executar Passo 1: Criar novas tabelas
- [ ] Executar Passo 2: Migrar dados existentes
- [ ] Verificar contagem de registros migrados
- [ ] Executar Passo 3: Criar VIEW de compatibilidade
- [ ] Executar Passo 4: Criar INSTEAD OF triggers
- [ ] Testar INSERT/UPDATE/DELETE na VIEW

### Pós-Migração
- [ ] Testar aplicação frontend
- [ ] Verificar se todos os dados aparecem corretamente
- [ ] Verificar performance das queries
- [ ] **(Opcional)** Renomear `generation_data` → `generation_data_old`
- [ ] **(Opcional)** Após 30 dias, deletar tabela antiga

### Rollback (se necessário)
```sql
-- Restaurar tabela original
DROP VIEW IF EXISTS generation_data;
ALTER TABLE generation_data_old RENAME TO generation_data;
```

---

## 🚀 Próximos Passos

Após a migração, você pode implementar:

1. **Importação Automática do ONS**
   - Edge Function para buscar PDP
   - Armazenar direto em `pdp_data`

2. **Dashboard de Importações**
   - Mostrar quando PDP foi atualizado
   - Log de importações

3. **Versionamento de PDP**
   - Guardar histórico de mudanças
   - Comparar diferentes versões

4. **Validações**
   - Alertar se PDP não foi importado
   - Avisar se geração sem PDP correspondente

---

## 📚 Resumo

### Antes
```
generation_data
├── hora
├── pdp (ONS + Manual misturado)
└── geracao
```

### Depois
```
pdp_data                    generation_realizada
├── hora                    ├── hora
├── pdp (ONS)              ├── geracao
├── import_source          └── report_date
└── imported_at
                           generation_data (VIEW)
                           └── Une as duas tabelas
```

### Benefícios
- ✅ Separação clara de fontes
- ✅ Rastreabilidade completa
- ✅ Zero mudanças no frontend
- ✅ Preparado para integração ONS
- ✅ Melhor performance e manutenibilidade

---

**Status:** Pronto para implementação
**Impacto:** Zero no código existente (100% compatível)
**Tempo estimado:** 30 minutos de migração
