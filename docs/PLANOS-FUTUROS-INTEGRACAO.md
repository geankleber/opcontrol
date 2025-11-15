# Planos Futuros - Integração entre Controles e Dados Realizados

## 📋 Visão Geral

Este documento descreve possíveis implementações para relacionar dados de **Controle da Geração** (`generation_control`) com **Dados Realizados** (`generation_data`), permitindo análises mais profundas sobre a efetividade das mudanças de set-point.

## 🎯 Objetivo

Correlacionar as mudanças de set-point registradas em `generation_control` com os dados de geração realizada em `generation_data`, permitindo:

- ✅ Análise de efetividade das ações de controle
- ✅ Identificação de tempo de resposta do sistema
- ✅ Comparação antes/depois das mudanças
- ✅ Visualização integrada no gráfico principal
- ✅ Relatórios de performance por responsável (ONS vs Axia)

---

## 🔗 Opção 1: View SQL com Relacionamento Temporal

### Descrição
Criar uma VIEW que mostra qual set-point estava vigente em cada momento da operação.

### Implementação

```sql
-- ===================================================
-- VIEW: generation_with_control
-- Relaciona dados de geração com controles vigentes
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
    -- Tempo decorrido desde a mudança de set-point
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

-- Comentários
COMMENT ON VIEW generation_with_control IS 'Relaciona dados de geração com o controle de set-point vigente em cada momento';
```

### Queries de Análise

```sql
-- Análise 1: Desvio médio por responsável
SELECT
    responsavel_vigente,
    COUNT(*) AS total_registros,
    AVG(ABS(desvio)) AS desvio_medio,
    MAX(ABS(desvio)) AS desvio_maximo,
    MIN(ABS(desvio)) AS desvio_minimo
FROM generation_with_control
WHERE report_date = '2025-11-09'
  AND responsavel_vigente IS NOT NULL
GROUP BY responsavel_vigente;

-- Análise 2: Performance após mudanças de set-point
SELECT
    control_id,
    hora_mudanca_setpoint,
    responsavel_vigente,
    setpoint_vigente,
    AVG(CASE WHEN horas_desde_mudanca <= 0.5 THEN ABS(desvio) END) AS desvio_30min,
    AVG(CASE WHEN horas_desde_mudanca <= 1.0 THEN ABS(desvio) END) AS desvio_1h,
    AVG(CASE WHEN horas_desde_mudanca <= 2.0 THEN ABS(desvio) END) AS desvio_2h
FROM generation_with_control
WHERE report_date = '2025-11-09'
  AND control_id IS NOT NULL
GROUP BY control_id, hora_mudanca_setpoint, responsavel_vigente, setpoint_vigente
ORDER BY hora_mudanca_setpoint;
```

### Vantagens
- ✅ Não modifica estrutura existente
- ✅ Performance otimizada com índices
- ✅ Fácil de consultar
- ✅ Permite análises históricas

### Desvantagens
- ❌ Requer índices adequados para performance em grandes volumes

---

## 🔗 Opção 2: Chave Estrangeira Explícita

### Descrição
Adicionar referência direta ao controle vigente em cada registro de `generation_data`.

### Implementação

```sql
-- ===================================================
-- Adicionar coluna de referência
-- ===================================================

ALTER TABLE generation_data
ADD COLUMN control_id BIGINT REFERENCES generation_control(id);

-- Criar índice
CREATE INDEX idx_generation_data_control_id ON generation_data(control_id);

-- Comentário
COMMENT ON COLUMN generation_data.control_id IS 'Referência ao controle de set-point vigente no momento';

-- ===================================================
-- Função para atualizar control_id automaticamente
-- ===================================================

CREATE OR REPLACE FUNCTION update_generation_data_control_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Buscar o controle mais recente para a data/hora do registro
    NEW.control_id := (
        SELECT id
        FROM generation_control gc
        WHERE gc.report_date = NEW.report_date
          AND gc.hora <= NEW.hora::time
        ORDER BY gc.hora DESC
        LIMIT 1
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trg_update_generation_data_control_id
BEFORE INSERT OR UPDATE ON generation_data
FOR EACH ROW
EXECUTE FUNCTION update_generation_data_control_id();

-- ===================================================
-- Popular dados existentes
-- ===================================================

UPDATE generation_data gd
SET control_id = (
    SELECT gc.id
    FROM generation_control gc
    WHERE gc.report_date = gd.report_date
      AND gc.hora <= gd.hora::time
    ORDER BY gc.hora DESC
    LIMIT 1
);
```

### Vantagens
- ✅ Relacionamento explícito e direto
- ✅ JOINs mais simples e rápidos
- ✅ Atualização automática via trigger

### Desvantagens
- ❌ Modifica estrutura existente
- ❌ Requer migração de dados
- ❌ Trigger adiciona overhead em INSERT/UPDATE

---

## 🔗 Opção 3: Função de Análise de Efetividade

### Descrição
Função SQL que analisa a efetividade das mudanças de set-point, comparando desvios antes e depois.

### Implementação

```sql
-- ===================================================
-- Função: analyze_control_effectiveness
-- Analisa efetividade das mudanças de set-point
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
        -- Métricas ANTES da mudança
        (SELECT COALESCE(AVG(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
           AND gd.hora::time < gc.hora
        )::DECIMAL AS desvio_medio_antes,
        (SELECT COALESCE(MAX(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
           AND gd.hora::time < gc.hora
        )::DECIMAL AS desvio_max_antes,
        (SELECT COUNT(*)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= (gc.hora - (p_window_hours || ' hours')::INTERVAL)
           AND gd.hora::time < gc.hora
        )::INTEGER AS registros_antes,
        -- Métricas DEPOIS da mudança
        (SELECT COALESCE(AVG(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        )::DECIMAL AS desvio_medio_depois,
        (SELECT COALESCE(MAX(ABS(gd.geracao - gd.pdp)), 0)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        )::DECIMAL AS desvio_max_depois,
        (SELECT COUNT(*)
         FROM generation_data gd
         WHERE gd.report_date = p_report_date
           AND gd.hora::time >= gc.hora
           AND gd.hora::time < (gc.hora + (p_window_hours || ' hours')::INTERVAL)
        )::INTEGER AS registros_depois,
        -- Melhora percentual (negativo = piorou)
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
        -- Tempo até estabilização (desvio < 10 MW)
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

-- Comentário
COMMENT ON FUNCTION analyze_control_effectiveness IS 'Analisa a efetividade das mudanças de set-point comparando desvios antes e depois';
```

### Exemplo de Uso

```sql
-- Analisar efetividade dos controles do dia 09/11/2025
-- Janela de 1 hora antes e depois de cada mudança
SELECT * FROM analyze_control_effectiveness('2025-11-09', 1.0);

-- Analisar com janela de 30 minutos
SELECT * FROM analyze_control_effectiveness('2025-11-09', 0.5);
```

### Vantagens
- ✅ Análise completa de efetividade
- ✅ Configurável (janela de tempo)
- ✅ Não modifica estrutura existente
- ✅ Útil para relatórios gerenciais

---

## 🔗 Opção 4: Visualização Integrada no Gráfico

### Descrição
Adicionar marcadores verticais no gráfico principal mostrando momento das mudanças de set-point.

### Implementação JavaScript

#### 4.1. Instalar Plugin de Anotações

Adicionar ao `index.html`:

```html
<!-- Chart.js Annotation Plugin -->
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@2.2.1/dist/chartjs-plugin-annotation.min.js"></script>
```

#### 4.2. Modificar `js/script.js`

```javascript
/**
 * Adiciona marcadores de controle ao gráfico principal
 */
function addControlMarkersToChart(chart, controls) {
    if (!chart || !controls || controls.length === 0) return;

    // Registrar plugin se necessário
    if (!Chart.registry.plugins.get('annotation')) {
        console.warn('Plugin chartjs-plugin-annotation não encontrado');
        return;
    }

    // Inicializar annotations se não existir
    if (!chart.options.plugins.annotation) {
        chart.options.plugins.annotation = { annotations: {} };
    }

    // Limpar annotations antigas
    chart.options.plugins.annotation.annotations = {};

    // Adicionar marcador para cada controle
    controls.forEach((ctrl, index) => {
        const horaFormatada = ctrl.hora.substring(0, 5);
        const color = ctrl.responsavel === 'ONS' ? '#475D16' : '#0000FF';

        chart.options.plugins.annotation.annotations[`control_${index}`] = {
            type: 'line',
            scaleID: 'x',
            value: horaFormatada,
            borderColor: color,
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
                display: true,
                content: `${Math.round(ctrl.setpoint)} MW`,
                position: 'start',
                yAdjust: -10,
                backgroundColor: color,
                color: 'white',
                font: {
                    size: 10,
                    weight: 'bold'
                },
                padding: 4,
                borderRadius: 3
            }
        };
    });

    chart.update('none'); // Atualizar sem animação
}

/**
 * Modificar função updateChart para incluir marcadores
 */
async function updateChart() {
    const selectedDate = document.getElementById('reportDate').value;

    // Carregar dados de geração
    const data = await loadGenerationDataFromSupabase(selectedDate);

    // Carregar controles do mesmo dia
    const controls = generationControls.filter(c => c.report_date === selectedDate);

    // ... código existente de criação do gráfico ...

    // Adicionar marcadores de controle
    addControlMarkersToChart(mainChart, controls);
}
```

#### 4.3. Adicionar Legenda de Controles

```javascript
/**
 * Adiciona legenda explicativa dos marcadores
 */
function addControlLegendToChart() {
    const legendHTML = `
        <div style="text-align: center; margin-top: 10px; font-size: 0.85rem; color: #666;">
            <span style="display: inline-block; margin: 0 10px;">
                <span style="display: inline-block; width: 20px; height: 2px;
                      background: #475D16; border: 1px dashed #475D16;
                      vertical-align: middle;"></span>
                <span style="margin-left: 5px;">Controle ONS</span>
            </span>
            <span style="display: inline-block; margin: 0 10px;">
                <span style="display: inline-block; width: 20px; height: 2px;
                      background: #0000FF; border: 1px dashed #0000FF;
                      vertical-align: middle;"></span>
                <span style="margin-left: 5px;">Controle Axia</span>
            </span>
        </div>
    `;

    document.querySelector('.card canvas#mainChart')
        .insertAdjacentHTML('afterend', legendHTML);
}
```

### Vantagens
- ✅ Visualização imediata e intuitiva
- ✅ Correlação visual clara
- ✅ Não requer mudanças no backend
- ✅ Interativo (hover mostra detalhes)

### Desvantagens
- ❌ Requer plugin adicional
- ❌ Pode poluir gráfico com muitos controles

---

## 🔗 Opção 5: Dashboard de Análise

### Descrição
Criar seção dedicada na página principal com análise de efetividade dos controles.

### Implementação HTML

```html
<!-- Adicionar após o card de Controle da Geração -->
<div class="card analysis-card">
    <h2>Análise de Efetividade dos Controles</h2>

    <div class="analysis-filters no-print">
        <label>Janela de Análise:</label>
        <select id="analysisWindow">
            <option value="0.5">30 minutos</option>
            <option value="1" selected>1 hora</option>
            <option value="2">2 horas</option>
        </select>
        <button id="runAnalysisBtn" class="btn btn-primary">Analisar</button>
    </div>

    <div id="analysisResults" class="analysis-results">
        <!-- Resultados serão inseridos aqui -->
    </div>
</div>
```

### Implementação JavaScript

```javascript
/**
 * Executa análise de efetividade dos controles
 */
async function runControlAnalysis() {
    const selectedDate = document.getElementById('reportDate').value;
    const window = parseFloat(document.getElementById('analysisWindow').value);

    // Carregar dados via função SQL
    const { data, error } = await supabase.rpc('analyze_control_effectiveness', {
        p_report_date: selectedDate,
        p_window_hours: window
    });

    if (error) {
        console.error('Erro ao analisar controles:', error);
        return;
    }

    renderAnalysisResults(data);
}

/**
 * Renderiza resultados da análise
 */
function renderAnalysisResults(results) {
    const container = document.getElementById('analysisResults');

    if (!results || results.length === 0) {
        container.innerHTML = '<p>Nenhum controle registrado para análise.</p>';
        return;
    }

    let html = '<table class="analysis-table"><thead><tr>';
    html += '<th>Hora</th>';
    html += '<th>Set-point</th>';
    html += '<th>Responsável</th>';
    html += '<th>Desvio Antes</th>';
    html += '<th>Desvio Depois</th>';
    html += '<th>Melhora</th>';
    html += '<th>Estabilização</th>';
    html += '</tr></thead><tbody>';

    results.forEach(r => {
        const melhora = r.melhora_percentual;
        const melhoraClass = melhora > 0 ? 'positive' : 'negative';
        const melhoraIcon = melhora > 0 ? '↑' : '↓';

        html += '<tr>';
        html += `<td>${r.hora_controle.substring(0, 5)}</td>`;
        html += `<td>${Math.round(r.setpoint)} MW</td>`;
        html += `<td><span class="badge ${r.responsavel === 'ONS' ? 'badge-ons' : 'badge-axia'}">${r.responsavel}</span></td>`;
        html += `<td>${r.desvio_medio_antes.toFixed(1)} MW</td>`;
        html += `<td>${r.desvio_medio_depois.toFixed(1)} MW</td>`;
        html += `<td class="${melhoraClass}">${melhoraIcon} ${Math.abs(melhora).toFixed(1)}%</td>`;
        html += `<td>${r.tempo_estabilizacao_minutos || '--'} min</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';

    // Adicionar sumário
    const avgMelhora = results.reduce((sum, r) => sum + r.melhora_percentual, 0) / results.length;
    html += `<div class="analysis-summary">`;
    html += `<p><strong>Melhora Média:</strong> ${avgMelhora.toFixed(1)}%</p>`;
    html += `<p><strong>Total de Controles:</strong> ${results.length}</p>`;
    html += `</div>`;

    container.innerHTML = html;
}
```

### CSS Adicional

```css
.analysis-card {
    margin-top: 30px;
}

.analysis-filters {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 20px;
}

.analysis-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.analysis-table th,
.analysis-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
}

.analysis-table th {
    background: #f5f5f5;
    font-weight: 600;
}

.analysis-table .positive {
    color: #28a745;
    font-weight: bold;
}

.analysis-table .negative {
    color: #dc3545;
    font-weight: bold;
}

.badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-ons {
    background: #475D16;
    color: white;
}

.badge-axia {
    background: #0000FF;
    color: white;
}

.analysis-summary {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #4facfe;
}
```

---

## 📊 Implementação Recomendada (Abordagem Híbrida)

Para obter máximo valor com menor complexidade, recomendo implementar nesta ordem:

### Fase 1: Backend (SQL) ✅ Alta Prioridade
1. **Criar VIEW `generation_with_control`** (Opção 1)
   - Baixa complexidade
   - Alto valor analítico
   - Não modifica estrutura existente

2. **Criar Função `analyze_control_effectiveness`** (Opção 3)
   - Útil para relatórios gerenciais
   - Análises automáticas

### Fase 2: Frontend (Visualização) ⭐ Média Prioridade
3. **Adicionar marcadores no gráfico** (Opção 4)
   - Visualização intuitiva
   - Correlação visual clara
   - Requer plugin adicional

### Fase 3: Analytics (Dashboard) 🔮 Baixa Prioridade
4. **Dashboard de análise** (Opção 5)
   - Para usuários avançados
   - Métricas detalhadas
   - Comparações históricas

### Fase 4: Otimização (Opcional) 🚀
5. **Chave estrangeira** (Opção 2)
   - Somente se houver problemas de performance
   - Requer migração de dados

---

## 📝 Passos para Implementação Futura

### Checklist - Fase 1 (Backend)

```sql
-- 1. Criar VIEW
-- Arquivo: docs/sql/01-create-view-generation-with-control.sql
-- Status: Pronto para execução
-- Tempo estimado: 5 minutos

-- 2. Criar Função de Análise
-- Arquivo: docs/sql/02-create-function-analyze-effectiveness.sql
-- Status: Pronto para execução
-- Tempo estimado: 5 minutos

-- 3. Testar queries
-- Arquivo: docs/sql/03-test-queries.sql
-- Status: Pronto para execução
-- Tempo estimado: 10 minutos
```

### Checklist - Fase 2 (Frontend)

```javascript
// 1. Adicionar plugin ao HTML
// Arquivo: index.html (linha ~11)
// Status: Aguardando decisão
// Tempo estimado: 2 minutos

// 2. Implementar função addControlMarkersToChart
// Arquivo: js/script.js
// Status: Código pronto acima
// Tempo estimado: 20 minutos

// 3. Integrar com updateChart
// Arquivo: js/script.js
// Status: Requer modificação
// Tempo estimado: 15 minutos

// 4. Testar em diferentes cenários
// Status: Aguardando implementação
// Tempo estimado: 30 minutos
```

### Checklist - Fase 3 (Dashboard)

```javascript
// 1. Adicionar HTML do dashboard
// Arquivo: index.html (após #generationControlsList)
// Status: HTML pronto acima
// Tempo estimado: 10 minutos

// 2. Implementar funções JS
// Arquivo: js/analysis.js (novo arquivo)
// Status: Código pronto acima
// Tempo estimado: 40 minutos

// 3. Adicionar estilos CSS
// Arquivo: css/styles.css
// Status: CSS pronto acima
// Tempo estimado: 10 minutos

// 4. Integrar com fluxo principal
// Arquivo: js/script.js
// Status: Requer modificação
// Tempo estimado: 20 minutos
```

---

## 🎯 Métricas de Sucesso

Após implementação, avaliar:

1. **Performance**
   - Queries rodando em < 500ms
   - Gráfico renderizando em < 1s

2. **Usabilidade**
   - Visualização clara e intuitiva
   - Informações relevantes destacadas

3. **Valor Analítico**
   - Identificação rápida de controles efetivos
   - Correlação visual entre ações e resultados
   - Dados para tomada de decisão

---

## 📚 Referências

- [Chart.js Annotation Plugin](https://www.chartjs.org/chartjs-plugin-annotation/)
- [PostgreSQL LATERAL JOIN](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL)
- [PostgreSQL Window Functions](https://www.postgresql.org/docs/current/tutorial-window.html)

---

## 🌐 Melhorias da Integração com API do ONS

### Descrição
Melhorias na integração existente com a API do ONS para importação de dados de PDP.

---

### 1. **Histórico de Importações** 📊

**Objetivo:** Rastrear todas as tentativas de importação de dados da API do ONS.

**Implementação:**

```sql
-- Criar tabela de log de importações
CREATE TABLE pdp_import_log (
    id BIGSERIAL PRIMARY KEY,
    import_date DATE NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
    source VARCHAR(50) NOT NULL, -- 'manual', 'scheduled', 'batch'
    records_imported INTEGER DEFAULT 0,
    error_message TEXT,
    response_data JSONB,
    execution_time_ms INTEGER,
    user_id UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_pdp_import_log_date ON pdp_import_log(import_date);
CREATE INDEX idx_pdp_import_log_status ON pdp_import_log(status);
CREATE INDEX idx_pdp_import_log_attempted ON pdp_import_log(attempted_at DESC);

-- Comentários
COMMENT ON TABLE pdp_import_log IS 'Histórico de todas as tentativas de importação de PDP da API do ONS';
```

**Modificações na Edge Function:**

```typescript
// Registrar log de importação
async function logImport(supabaseClient: any, logData: {
    import_date: string,
    status: string,
    source: string,
    records_imported: number,
    error_message?: string,
    execution_time_ms: number
}) {
    await supabaseClient
        .from('pdp_import_log')
        .insert(logData);
}

// Uso na função principal
const startTime = Date.now();
try {
    // ... importação ...
    await logImport(supabaseClient, {
        import_date: date,
        status: 'success',
        source: 'manual',
        records_imported: pdpData.length,
        execution_time_ms: Date.now() - startTime
    });
} catch (error) {
    await logImport(supabaseClient, {
        import_date: date,
        status: 'failed',
        source: 'manual',
        records_imported: 0,
        error_message: error.message,
        execution_time_ms: Date.now() - startTime
    });
}
```

**Benefícios:**
- ✅ Monitorar saúde da integração
- ✅ Identificar padrões de falha
- ✅ Auditoria de quando dados foram atualizados
- ✅ Métricas de performance

**Prioridade:** Alta
**Complexidade:** Baixa
**Tempo estimado:** 2 horas

---

### 2. **Importação Retroativa/Em Lote** 📅

**Objetivo:** Permitir importação de múltiplas datas de uma vez.

**Implementação Frontend:**

```html
<!-- Modal de importação em lote -->
<div id="batchImportModal" class="modal">
    <div class="modal-content">
        <h2>Importar PDP em Lote</h2>
        <div class="form-group">
            <label>Data Inicial:</label>
            <input type="date" id="batchStartDate">
        </div>
        <div class="form-group">
            <label>Data Final:</label>
            <input type="date" id="batchEndDate">
        </div>
        <div id="batchProgress" style="display: none;">
            <progress id="batchProgressBar" max="100" value="0"></progress>
            <p id="batchStatus">Importando...</p>
        </div>
        <button id="startBatchImportBtn" class="btn btn-primary">Importar</button>
    </div>
</div>
```

**JavaScript:**

```javascript
async function batchImportPDP(startDate, endDate) {
    const dates = generateDateRange(startDate, endDate);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < dates.length; i++) {
        updateProgress((i / dates.length) * 100, `${i + 1}/${dates.length}`);

        try {
            const result = await importPDPFromONS(dates[i]);
            if (result.success) successCount++;
            else failCount++;
        } catch (error) {
            failCount++;
        }

        // Delay para não sobrecarregar API
        await sleep(2000);
    }

    alert(`Importação concluída!\n✅ Sucesso: ${successCount}\n❌ Falhas: ${failCount}`);
}

function generateDateRange(start, end) {
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    return dates;
}
```

**Benefícios:**
- ✅ Preencher dados históricos rapidamente
- ✅ Recuperar lacunas de dados
- ✅ Facilitar setup inicial
- ✅ Indicador de progresso visual

**Prioridade:** Média
**Complexidade:** Média
**Tempo estimado:** 4 horas

---

### 3. **Validação de Dados Antes de Salvar** ✅

**Objetivo:** Garantir qualidade e consistência dos dados importados.

**Validações Implementadas:**

```typescript
interface ValidationResult {
    isValid: boolean;
    warnings: string[];
    errors: string[];
}

function validatePDPData(pdpData: PDPData[], date: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        warnings: [],
        errors: []
    };

    // 1. Verificar se há exatamente 48 registros
    if (pdpData.length !== 48) {
        result.errors.push(`Número incorreto de registros: ${pdpData.length} (esperado: 48)`);
        result.isValid = false;
    }

    // 2. Verificar valores negativos
    const negativeValues = pdpData.filter(d => d.pdp < 0);
    if (negativeValues.length > 0) {
        result.errors.push(`${negativeValues.length} registros com valores negativos`);
        result.isValid = false;
    }

    // 3. Verificar valores fora do limite da usina (Teles Pires: 1820 MW)
    const MAX_CAPACITY = 1820;
    const outOfRange = pdpData.filter(d => d.pdp > MAX_CAPACITY);
    if (outOfRange.length > 0) {
        result.warnings.push(`${outOfRange.length} registros acima da capacidade (${MAX_CAPACITY} MW)`);
    }

    // 4. Verificar mudanças bruscas (> 200 MW entre períodos)
    for (let i = 1; i < pdpData.length; i++) {
        const diff = Math.abs(pdpData[i].pdp - pdpData[i-1].pdp);
        if (diff > 200) {
            result.warnings.push(`Mudança brusca detectada: ${pdpData[i-1].hora} -> ${pdpData[i].hora} (${diff.toFixed(1)} MW)`);
        }
    }

    // 5. Verificar valores constantes (todos iguais - possível erro)
    const uniqueValues = new Set(pdpData.map(d => d.pdp));
    if (uniqueValues.size === 1 && pdpData[0].pdp > 0) {
        result.warnings.push('Todos os valores são idênticos - possível erro nos dados');
    }

    // 6. Comparar com dia anterior (se disponível)
    // ... implementação de comparação histórica ...

    return result;
}

// Uso na Edge Function
const validation = validatePDPData(pdpData, date);

if (!validation.isValid) {
    return new Response(
        JSON.stringify({
            success: false,
            errors: validation.errors,
            warnings: validation.warnings
        }),
        { headers: corsHeaders, status: 400 }
    );
}

if (validation.warnings.length > 0) {
    console.warn('Avisos de validação:', validation.warnings);
}
```

**Benefícios:**
- ✅ Evitar dados inconsistentes
- ✅ Alertar sobre anomalias
- ✅ Maior confiabilidade
- ✅ Detecção precoce de problemas

**Prioridade:** Alta
**Complexidade:** Média
**Tempo estimado:** 3 horas

---

### 4. **Comparação Antes de Sobrescrever** ⚖️

**Objetivo:** Mostrar diferenças entre dados existentes e novos dados antes de importar.

**Implementação:**

```javascript
async function compareAndImport(date) {
    // 1. Buscar dados existentes
    const existingData = await supabase
        .from('pdp_data')
        .select('*')
        .eq('report_date', date)
        .order('hora');

    if (!existingData.data || existingData.data.length === 0) {
        // Não há dados, importar diretamente
        await importPDPFromONS(date);
        return;
    }

    // 2. Buscar novos dados da API (sem salvar)
    const newData = await fetchPDPPreview(date);

    // 3. Calcular diferenças
    const differences = calculateDifferences(existingData.data, newData);

    // 4. Mostrar modal de comparação
    showComparisonModal(date, existingData.data, newData, differences);
}

function calculateDifferences(existing, newData) {
    const diffs = [];

    for (let i = 0; i < Math.min(existing.length, newData.length); i++) {
        const diff = newData[i].pdp - existing[i].pdp;
        if (Math.abs(diff) > 1) { // Diferença > 1 MW
            diffs.push({
                hora: existing[i].hora,
                oldValue: existing[i].pdp,
                newValue: newData[i].pdp,
                difference: diff,
                percentChange: (diff / existing[i].pdp * 100).toFixed(1)
            });
        }
    }

    return diffs;
}

function showComparisonModal(date, existing, newData, differences) {
    const modal = document.getElementById('comparisonModal');
    const tbody = document.getElementById('comparisonTableBody');

    let html = '';
    differences.forEach(d => {
        const changeClass = d.difference > 0 ? 'positive' : 'negative';
        html += `
            <tr>
                <td>${d.hora}</td>
                <td>${d.oldValue.toFixed(1)} MW</td>
                <td>${d.newValue.toFixed(1)} MW</td>
                <td class="${changeClass}">
                    ${d.difference > 0 ? '+' : ''}${d.difference.toFixed(1)} MW
                    (${d.percentChange}%)
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    document.getElementById('comparisonSummary').textContent =
        `${differences.length} diferenças encontradas em ${existing.length} registros`;

    modal.style.display = 'block';
}
```

**HTML do Modal:**

```html
<div id="comparisonModal" class="modal">
    <div class="modal-content" style="max-width: 800px;">
        <h2>Comparar Dados Existentes vs. API ONS</h2>
        <p id="comparisonSummary"></p>

        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Atual (Banco)</th>
                    <th>Novo (API)</th>
                    <th>Diferença</th>
                </tr>
            </thead>
            <tbody id="comparisonTableBody"></tbody>
        </table>

        <div class="modal-actions">
            <button id="keepExistingBtn" class="btn btn-secondary">Manter Atual</button>
            <button id="replaceBtn" class="btn btn-primary">Substituir por API</button>
            <button id="cancelComparisonBtn" class="btn btn-secondary">Cancelar</button>
        </div>
    </div>
</div>
```

**Benefícios:**
- ✅ Transparência total
- ✅ Evitar sobrescritas acidentais
- ✅ Identificar mudanças nos dados do ONS
- ✅ Decisão informada

**Prioridade:** Média
**Complexidade:** Alta
**Tempo estimado:** 5 horas

---

### 5. **Importar Geração Realizada** 🏭

**Status:** ❌ **Endpoint não disponível na API pública do ONS**

**Investigação Realizada:**
- API `integra.ons.org.br` não possui endpoint documentado para geração realizada
- Portal de Dados Abertos (dados.ons.org.br) disponibiliza apenas arquivos CSV/XLSX para download
- Não há API REST para consulta programática de dados verificados

**Alternativa Possível:**
- Download e parsing automático de arquivos CSV do portal de dados abertos
- Contato com ONS para confirmar disponibilidade de endpoint

**Prioridade:** Baixa (aguardando confirmação de disponibilidade)
**Status:** Bloqueado - API não disponível

---

## 📅 Roadmap de Implementação Sugerido

### Curto Prazo (1-2 semanas)
1. ✅ **Validação de Dados** - Garantir qualidade
2. ✅ **Histórico de Importações** - Rastreabilidade

### Médio Prazo (1 mês)
3. ⭐ **Importação em Lote** - Produtividade
4. ⭐ **Comparação de Dados** - Segurança

### Longo Prazo (Futuro)
5. 🔮 **Geração Realizada** - Aguardar disponibilidade de API

---

**Última atualização:** 2025-11-15
**Status:** Planejamento completo - Aguardando análise de viabilidade
**Prioridade:** Baixa - Implementação futura
