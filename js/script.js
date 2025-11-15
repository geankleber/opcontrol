// ===========================
// VARIÁVEIS GLOBAIS
// ===========================

let currentData = [];
let observations = [];
let mainChart = null;
let editingObsIndex = null;
let supabase = null;

// ===========================
// INICIALIZAR SUPABASE
// ===========================

function initSupabase() {
    try {
        if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            const { createClient } = window.supabase;
            supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase inicializado com sucesso');
            return true;
        } else {
            console.warn('⚠️ Supabase não configurado. Usando armazenamento local. Veja SUPABASE-SETUP.md');
            return false;
        }
    } catch (error) {
        console.warn('⚠️ Erro ao inicializar Supabase:', error.message);
        console.warn('Usando armazenamento local. Veja SUPABASE-SETUP.md');
        return false;
    }
}

// ===========================
// PERSISTÊNCIA DE OBSERVAÇÕES
// ===========================

async function loadObservationsFromSupabase() {
    if (!supabase) return false;

    try {
        const reportDate = document.getElementById('reportDate').value;
        const { data, error } = await supabase
            .from('observations')
            .select('*')
            .eq('report_date', reportDate)
            .order('hora', { ascending: true });

        if (error) throw error;

        observations = data.map(obs => ({
            id: obs.id,
            hora: obs.hora,
            geracao: obs.geracao,
            pdp: obs.pdp,
            desvio: obs.desvio,
            texto: obs.texto,
            timestamp: obs.timestamp
        }));

        console.log(`✅ ${observations.length} observação(ões) carregada(s) do Supabase`);
        return true;
    } catch (error) {
        console.error('Erro ao carregar observações:', error.message);
        return false;
    }
}

async function saveObservationToSupabase(obs, isUpdate = false, obsId = null) {
    if (!supabase) return false;

    try {
        const reportDate = document.getElementById('reportDate').value;
        const dbObs = {
            hora: obs.hora,
            geracao: obs.geracao,
            pdp: obs.pdp,
            desvio: obs.desvio,
            texto: obs.texto,
            timestamp: obs.timestamp,
            report_date: reportDate
        };

        if (isUpdate && obsId) {
            // Atualizar observação existente
            const { data, error } = await supabase
                .from('observations')
                .update(dbObs)
                .eq('id', obsId)
                .select();

            if (error) throw error;
            console.log('✅ Observação atualizada no Supabase');
            return data[0];
        } else {
            // Inserir nova observação
            const { data, error } = await supabase
                .from('observations')
                .insert([dbObs])
                .select();

            if (error) throw error;
            console.log('✅ Observação salva no Supabase');
            return data[0];
        }
    } catch (error) {
        console.error('Erro ao salvar observação:', error.message);
        return false;
    }
}

async function deleteObservationFromSupabase(obsId) {
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('observations')
            .delete()
            .eq('id', obsId);

        if (error) throw error;
        console.log('✅ Observação removida do Supabase');
        return true;
    } catch (error) {
        console.error('Erro ao deletar observação:', error.message);
        return false;
    }
}

// ===========================
// PERSISTÊNCIA DE DADOS DE GERAÇÃO
// ===========================

async function loadGenerationDataFromSupabase() {
    if (!supabase) return false;

    try {
        const reportDate = document.getElementById('reportDate').value;
        const { data, error } = await supabase
            .from('generation_data')
            .select('*')
            .eq('report_date', reportDate)
            .order('hora', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            currentData = data.map(row => ({
                id: row.id,
                hora: row.hora,
                pdp: row.pdp,
                geracao: row.geracao
            }));
            console.log(`✅ ${currentData.length} registro(s) de geração carregado(s) do Supabase`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao carregar dados de geração:', error.message);
        return false;
    }
}

async function saveGenerationDataToSupabase(reportDate, dataArray) {
    if (!supabase) return false;

    try {
        // Primeiro, deletar dados existentes da data
        const { error: deleteError } = await supabase
            .from('generation_data')
            .delete()
            .eq('report_date', reportDate);

        if (deleteError) throw deleteError;

        // Preparar dados para inserção
        const records = dataArray.map(d => ({
            hora: d.hora,
            pdp: d.pdp,
            geracao: d.geracao !== null && d.geracao !== undefined ? d.geracao : null,
            report_date: reportDate
        }));

        // Inserir novos dados
        const { data, error } = await supabase
            .from('generation_data')
            .insert(records)
            .select();

        if (error) throw error;

        console.log(`✅ ${records.length} registro(s) de geração salvo(s) no Supabase`);
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados de geração:', error.message);
        return false;
    }
}

async function updateGenerationRow(id, geracao) {
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('generation_data')
            .update({ geracao: geracao })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao atualizar linha:', error.message);
        return false;
    }
}

// ===========================
// DADOS DE EXEMPLO - REMOVIDOS
// ===========================
// Dados agora são carregados APENAS do Supabase

// ===========================
// INICIALIZAÇÃO
// ===========================

document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar Supabase
    initSupabase();

    // Inicializar data com data atual
    initializeReportDate();

    // Carregar dados de geração do Supabase
    if (supabase) {
        const dataLoaded = await loadGenerationDataFromSupabase();
        if (!dataLoaded) {
            // Se Supabase disponível mas sem dados, usar array vazio
            currentData = [];
            console.log('ℹ️ Nenhum dado encontrado para a data atual. Use o editor para adicionar dados.');
        }
    } else {
        // Se Supabase não configurado, array vazio
        currentData = [];
        console.log('⚠️ Supabase não configurado. Configure o Supabase para usar a aplicação.');
    }

    // Carregar observações do Supabase
    if (supabase) {
        const loaded = await loadObservationsFromSupabase();
        if (!loaded) {
            // Se Supabase disponível mas sem observações, usar array vazio
            observations = [];
            console.log('ℹ️ Nenhuma observação encontrada para a data atual.');
        }
    } else {
        // Se Supabase não configurado, array vazio
        observations = [];
        console.log('⚠️ Supabase não configurado.');
    }

    // Carregar controles de geração do Supabase
    if (supabase) {
        await loadGenerationControlsFromSupabase();
    } else {
        generationControls = [];
    }

    // Resetar estado de expansão da lista de controles
    showAllControls = false;

    // Inicializar visualizações
    updateAllVisualizations();

    // Event Listeners - Botões principais
    document.getElementById('editorBtn').addEventListener('click', () => {
        const selectedDate = document.getElementById('reportDate').value;
        window.location.href = `pages/editor.html?date=${selectedDate}`;
    });
    document.getElementById('printBtn').addEventListener('click', () => window.print());

    // Event Listeners - Impressão (forçar exibição de todos os controles)
    window.addEventListener('beforeprint', () => {
        const previousState = showAllControls;
        showAllControls = true;
        renderGenerationControls();
        showAllControls = previousState; // Restaurar estado após render
    });

    window.addEventListener('afterprint', () => {
        renderGenerationControls(); // Re-renderizar com estado original
    });

    // Event Listeners - Observações
    document.getElementById('uploadObsBtn').addEventListener('click', () => {
        document.getElementById('obsFileInput').click();
    });

    document.getElementById('obsFileInput').addEventListener('change', handleObsFileUpload);
    document.getElementById('downloadObsBtn').addEventListener('click', downloadObservations);
    document.getElementById('deleteAllObsBtn').addEventListener('click', deleteAllObservations);

    // Event Listeners - Modal de Observações
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelObsBtn').addEventListener('click', closeModal);
    document.getElementById('saveObsBtn').addEventListener('click', saveObservation);

    // Event Listeners - Controle da Geração
    document.getElementById('addControlBtn').addEventListener('click', openGenerationControlModal);
    document.getElementById('uploadControlBtn').addEventListener('click', () => {
        document.getElementById('controlFileInput').click();
    });
    document.getElementById('controlFileInput').addEventListener('change', handleControlFileUpload);
    document.getElementById('downloadControlBtn').addEventListener('click', downloadGenerationControls);
    document.getElementById('deleteAllControlBtn').addEventListener('click', deleteAllGenerationControls);

    // Event Listeners - Modal de Controle
    document.getElementById('closeControlModal').addEventListener('click', closeGenerationControlModal);
    document.getElementById('cancelControlBtn').addEventListener('click', closeGenerationControlModal);
    document.getElementById('saveControlBtn').addEventListener('click', saveGenerationControl);

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const obsModal = document.getElementById('obsModal');
        const controlModal = document.getElementById('controlModal');

        if (e.target === obsModal) {
            closeModal();
        }
        if (e.target === controlModal) {
            closeGenerationControlModal();
        }
    });

    // Event Listener - Data do relatório
    document.getElementById('reportDate').addEventListener('change', async () => {
        updatePageTitleFromDate();

        // Recarregar dados quando a data mudar
        if (supabase) {
            // Carregar dados de geração
            const dataLoaded = await loadGenerationDataFromSupabase();
            if (!dataLoaded) {
                currentData = [];
            }

            // Carregar observações
            await loadObservationsFromSupabase();

            // Carregar controles de geração
            await loadGenerationControlsFromSupabase();

            // Resetar estado de expansão da lista de controles
            showAllControls = false;

            // Atualizar todas as visualizações
            updateAllVisualizations();
        }
    });
});

// ===========================
// ATUALIZAÇÃO DE DATA
// ===========================

function initializeReportDate() {
    // Verificar se há data na URL (vindo do editor)
    const urlParams = new URLSearchParams(window.location.search);
    const dateFromUrl = urlParams.get('date');

    let dateStr;

    if (dateFromUrl) {
        // Usar data passada pela URL
        dateStr = dateFromUrl;
        console.log(`📅 Data recebida da URL: ${dateStr}`);
    } else {
        // Obter data atual no horário de Brasília (UTC-3)
        const now = new Date();
        const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

        const year = brasiliaTime.getFullYear();
        const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
        const day = String(brasiliaTime.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`; // Formato YYYY-MM-DD
        console.log(`📅 Data inicializada: ${dateStr} (Horário de Brasília)`);
    }

    document.getElementById('reportDate').value = dateStr;
    updatePageTitleFromDate();
}

function updatePageTitleFromDate() {
    const dateInput = document.getElementById('reportDate').value;
    if (!dateInput) {
        document.getElementById('pageTitle').textContent = 'UHE Teles Pires - Desempenho da Geração';
        return;
    }

    const date = new Date(dateInput + 'T00:00:00');
    const dateStr = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('pageTitle').textContent =
        `UHE Teles Pires - Desempenho da Geração - ${dateStr}`;
}

function updatePageTitle() {
    // Mantém compatibilidade com código existente
    updatePageTitleFromDate();
}

// ===========================
// CÁLCULOS E ANALYTICS
// ===========================

function isDentroFaixa(geracao, pdp) {
    const desvio = geracao - pdp;

    // Desvio positivo: até +100 MW
    if (desvio > 0) {
        return desvio <= 100;
    }

    // Desvio negativo: regras baseadas no valor programado
    const desvioAbs = Math.abs(desvio);

    if (pdp >= 0 && pdp <= 100) {
        // 0-100 MW: até 10 MW de desvio negativo
        return desvioAbs <= 10;
    } else if (pdp > 100 && pdp <= 200) {
        // 100-200 MW: até 10% do valor programado
        return desvioAbs <= pdp * 0.10;
    } else if (pdp > 200 && pdp <= 1000) {
        // 200-1000 MW: até 5% do valor programado
        return desvioAbs <= pdp * 0.05;
    } else if (pdp > 1000) {
        // Acima de 1000 MW: até 2% do valor programado OU até 100 MW (o que for menor)
        const limite = Math.min(pdp * 0.02, 100);
        return desvioAbs <= limite;
    }

    return false;
}

function calculateAnalytics() {
    if (currentData.length === 0) return;

    // Filtrar apenas dados com geração válida
    const validData = currentData.filter(d => d.geracao !== null && d.geracao !== undefined);

    if (validData.length === 0) return;

    // Desvio médio
    const desvios = validData.map(d => d.geracao - d.pdp);
    const desvioMedio = desvios.reduce((a, b) => a + b, 0) / desvios.length;

    // Pico de geração
    const picoData = validData.reduce((max, d) =>
        d.geracao > max.geracao ? d : max
    );

    // Eficiência (dentro da faixa baseada nas novas regras)
    const dentroFaixa = validData.filter(d =>
        isDentroFaixa(d.geracao, d.pdp)
    ).length;
    const eficiencia = (dentroFaixa / validData.length) * 100;

    // Atualizar KPIs
    const desvioMedioEl = document.getElementById('desvioMedio');
    if (desvioMedio < 0) {
        desvioMedioEl.innerHTML = `<span style="color: red;">${desvioMedio.toFixed(1)} MW</span>`;
    } else {
        desvioMedioEl.textContent = `${desvioMedio.toFixed(1)} MW`;
    }
    document.getElementById('picoGeracao').textContent = `${picoData.geracao} MW`;
    document.getElementById('picoHorario').textContent = picoData.hora;
    document.getElementById('eficiencia').textContent = `${eficiencia.toFixed(1)}%`;
}

function calculatePeriodStats() {
    if (currentData.length === 0) return;

    const periods = [
        { name: 'Madrugada (00h-06h)', start: 0, end: 6 },
        { name: 'Manhã (06h-12h)', start: 6, end: 12 },
        { name: 'Tarde (12h-18h)', start: 12, end: 18 },
        { name: 'Noite (18h-00h)', start: 18, end: 24 }
    ];

    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';

    periods.forEach(period => {
        const periodData = currentData.filter(d => {
            const hour = parseInt(d.hora.split(':')[0]);
            return hour >= period.start && hour < period.end && d.geracao !== null && d.geracao !== undefined;
        });

        if (periodData.length > 0) {
            const avgGeracao = periodData.reduce((sum, d) => sum + d.geracao, 0) / periodData.length;
            const avgPdp = periodData.reduce((sum, d) => sum + d.pdp, 0) / periodData.length;
            const avgDesvio = avgGeracao - avgPdp;

            const desvioFormatted = avgDesvio < 0
                ? `<span style="color: red;">${avgDesvio.toFixed(1)}</span>`
                : avgDesvio.toFixed(1);

            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${period.name}</td>
                <td>${avgGeracao.toFixed(1)}</td>
                <td>${avgPdp.toFixed(1)}</td>
                <td>${desvioFormatted}</td>
            `;
        }
    });
}

// ===========================
// GRÁFICO PRINCIPAL
// ===========================

function renderMainChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');

    if (mainChart) {
        mainChart.destroy();
    }

    const labels = currentData.map(d => d.hora);
    const geracaoData = currentData.map(d => d.geracao);
    const pdpData = currentData.map(d => d.pdp);

    // Calcular valor máximo das séries + 5% (apenas valores válidos)
    const validGeracaoData = geracaoData.filter(v => v !== null && v !== undefined);
    const maxGeracao = validGeracaoData.length > 0 ? Math.max(...validGeracaoData) : 0;
    const maxPdp = Math.max(...pdpData);
    const maxValue = Math.max(maxGeracao, maxPdp);
    const yMax = maxValue * 1.05; // 5% a mais

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Geração Realizada',
                    data: geracaoData,
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Geração Programada',
                    data: pdpData,
                    borderColor: '#56ab2f',
                    backgroundColor: 'rgba(86, 171, 47, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const data = currentData[index];
                    openObservationModal(data);
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: (context) => {
                            if (context.datasetIndex === 0) {
                                const pdp = pdpData[context.dataIndex];
                                const geracao = context.parsed.y;
                                const desvio = geracao - pdp;
                                return `Desvio: ${desvio > 0 ? '+' : ''}${desvio.toFixed(1)} MW`;
                            }
                            return '';
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'Geração (MW)'
                    },
                    ticks: {
                        callback: function(value, index, ticks) {
                            // Não exibir o último rótulo (valor máximo)
                            if (index === ticks.length - 1) {
                                return '';
                            }
                            return value;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Horário'
                    },
                    ticks: {
                        callback: function(value, index, ticks) {
                            const label = this.getLabelForValue(value);
                            // Exibir horas cheias (terminam com :00)
                            if (label.endsWith(':00')) {
                                return label;
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });
}

// ===========================
// HEATMAP
// ===========================

function renderHeatmap() {
    const heatmap = document.getElementById('heatmap');
    heatmap.innerHTML = '';

    currentData.forEach((d, index) => {
        // Pular células sem geração
        if (d.geracao === null || d.geracao === undefined) {
            return;
        }

        const desvio = d.geracao - d.pdp;
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';

        // Determinar cor baseada nas novas regras
        if (isDentroFaixa(d.geracao, d.pdp)) {
            // Verde: dentro da faixa
            cell.classList.add('green');
        } else {
            // Calcular limite para amarelo (2x o limite de "dentro da faixa")
            const desvioAbs = Math.abs(desvio);
            let limiteAmarelo;

            if (desvio > 0) {
                // Desvio positivo: até 200 MW para amarelo
                limiteAmarelo = 200;
            } else {
                // Desvio negativo: 2x os limites de "dentro da faixa"
                if (d.pdp >= 0 && d.pdp <= 100) {
                    limiteAmarelo = 20;
                } else if (d.pdp > 100 && d.pdp <= 200) {
                    limiteAmarelo = d.pdp * 0.20;
                } else if (d.pdp > 200 && d.pdp <= 1000) {
                    limiteAmarelo = d.pdp * 0.10;
                } else if (d.pdp > 1000) {
                    limiteAmarelo = Math.min(d.pdp * 0.04, 200);
                }
            }

            if (desvioAbs <= limiteAmarelo) {
                cell.classList.add('yellow');
            } else {
                cell.classList.add('red');
            }
        }

        cell.innerHTML = `
            <div class="heatmap-time">${d.hora}</div>
            <div class="heatmap-value">${desvio.toFixed(0)}MW</div>
        `;

        cell.addEventListener('click', () => openObservationModal(d));
        heatmap.appendChild(cell);
    });
}

// ===========================
// OBSERVAÇÕES
// ===========================

function renderObservations() {
    const list = document.getElementById('observationsList');
    const count = document.getElementById('obsCount');

    count.textContent = `(${observations.length})`;

    if (observations.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center;">Nenhuma observação registrada.</p>';
        return;
    }

    list.innerHTML = '';

    // Ordenar observações por hora (crescente)
    const sortedObservations = [...observations].sort((a, b) => {
        return a.hora.localeCompare(b.hora);
    });

    sortedObservations.forEach((obs, index) => {
        // Encontrar índice original para editar/deletar corretamente
        const originalIndex = observations.findIndex(o => o.id === obs.id || (o.hora === obs.hora && o.timestamp === obs.timestamp));
        const item = document.createElement('div');
        item.className = 'observation-item';

        const timestamp = new Date(obs.timestamp);
        const timestampStr = timestamp.toLocaleString('pt-BR');

        const desvioFormatted = obs.desvio < 0
            ? `<span style="color: red;">${obs.desvio} MW</span>`
            : `${obs.desvio > 0 ? '+' : ''}${obs.desvio} MW`;

        item.innerHTML = `
            <div class="obs-header">
                <span class="obs-time">${obs.hora}</span>
                <div class="obs-data">
                    Geração: ${obs.geracao} MW | PDP: ${obs.pdp} MW | Desvio: ${desvioFormatted}
                </div>
                <div class="obs-actions no-print">
                    <button class="btn-icon" onclick="editObservation(${originalIndex})" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deleteObservation(${originalIndex})" title="Remover">🗑️</button>
                </div>
            </div>
            <div class="obs-text">${obs.texto}</div>
            <div class="obs-timestamp">Registrado em: ${timestampStr}</div>
        `;

        list.appendChild(item);
    });
}

function openObservationModal(data) {
    const desvio = data.geracao - data.pdp;

    document.getElementById('obsHora').value = data.hora;
    document.getElementById('obsGeracao').value = data.geracao;
    document.getElementById('obsPdp').value = data.pdp;
    document.getElementById('obsDesvio').value = desvio.toFixed(1);
    document.getElementById('obsTexto').value = '';

    document.getElementById('modalTitle').textContent = 'Adicionar Observação';
    editingObsIndex = null;

    document.getElementById('obsModal').style.display = 'block';
    document.getElementById('obsTexto').focus();
}

function editObservation(index) {
    editingObsIndex = index;
    const obs = observations[index];

    document.getElementById('obsHora').value = obs.hora;
    document.getElementById('obsGeracao').value = obs.geracao;
    document.getElementById('obsPdp').value = obs.pdp;
    document.getElementById('obsDesvio').value = obs.desvio;
    document.getElementById('obsTexto').value = obs.texto;

    document.getElementById('modalTitle').textContent = 'Editar Observação';
    document.getElementById('obsModal').style.display = 'block';
    document.getElementById('obsTexto').focus();
}

async function deleteObservation(index) {
    if (confirm('Deseja realmente remover esta observação?')) {
        const obs = observations[index];

        // Tentar deletar do Supabase
        if (supabase && obs.id) {
            const success = await deleteObservationFromSupabase(obs.id);
            if (!success) {
                alert('Erro ao remover observação do servidor. Tente novamente.');
                return;
            }
        }

        // Remover do array local
        observations.splice(index, 1);
        renderObservations();
    }
}

async function saveObservation() {
    const texto = document.getElementById('obsTexto').value.trim();

    if (!texto) {
        alert('Por favor, digite uma observação.');
        return;
    }

    const obs = {
        hora: document.getElementById('obsHora').value,
        geracao: parseFloat(document.getElementById('obsGeracao').value),
        pdp: parseFloat(document.getElementById('obsPdp').value),
        desvio: parseFloat(document.getElementById('obsDesvio').value),
        texto: texto,
        timestamp: new Date().toISOString()
    };

    let savedObs = obs;

    // Tentar salvar no Supabase
    if (supabase) {
        if (editingObsIndex !== null) {
            // Atualizar observação existente
            const existingObs = observations[editingObsIndex];
            const result = await saveObservationToSupabase(obs, true, existingObs.id);
            if (result) {
                savedObs = { ...obs, id: existingObs.id };
                observations[editingObsIndex] = savedObs;
            } else {
                alert('Erro ao atualizar observação no servidor.');
                return;
            }
        } else {
            // Inserir nova observação
            const result = await saveObservationToSupabase(obs, false);
            if (result) {
                savedObs = { ...obs, id: result.id };
                observations.push(savedObs);
            } else {
                alert('Erro ao salvar observação no servidor.');
                return;
            }
        }
    } else {
        // Fallback: salvar apenas localmente
        if (editingObsIndex !== null) {
            observations[editingObsIndex] = obs;
        } else {
            observations.push(obs);
        }
    }

    // Ordenar observações por hora após adicionar/editar
    observations.sort((a, b) => a.hora.localeCompare(b.hora));

    renderObservations();
    closeModal();
}

function closeModal() {
    document.getElementById('obsModal').style.display = 'none';
    editingObsIndex = null;
}

async function deleteAllObservations() {
    const count = observations.length;

    if (count === 0) {
        alert('Não há observações para excluir.');
        return;
    }

    const reportDate = document.getElementById('reportDate').value;
    const confirmMsg = `Deseja realmente excluir TODAS as ${count} observação(ões) da data ${reportDate}?\n\n⚠️ Esta ação não pode ser desfeita!`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // Tentar deletar do Supabase
    if (supabase) {
        try {
            const { error } = await supabase
                .from('observations')
                .delete()
                .eq('report_date', reportDate);

            if (error) {
                throw error;
            }

            console.log(`✅ ${count} observação(ões) removida(s) do Supabase`);
        } catch (error) {
            console.error('Erro ao deletar observações:', error.message);
            alert('Erro ao remover observações do servidor. Tente novamente.');
            return;
        }
    }

    // Limpar array local
    observations = [];
    renderObservations();

    alert(`${count} observação(ões) excluída(s) com sucesso!`);
}

// ===========================
// MANIPULAÇÃO DE EXCEL
// ===========================

function handleObsFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            observations = jsonData.map(row => ({
                hora: row.hora || row.Hora || '',
                geracao: parseFloat(row.geracao || row.Geracao || 0),
                pdp: parseFloat(row.pdp || row.PDP || 0),
                desvio: parseFloat(row.desvio || row.Desvio || 0),
                texto: row.texto || row.Texto || row.observacao || row.Observacao || '',
                timestamp: row.timestamp || new Date().toISOString()
            }));

            // Ordenar observações por hora após carregar
            observations.sort((a, b) => a.hora.localeCompare(b.hora));

            renderObservations();
            alert('Observações carregadas com sucesso!');
        } catch (error) {
            alert('Erro ao ler o arquivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);

    e.target.value = '';
}

function downloadObservations() {
    if (observations.length === 0) {
        alert('Não há observações para exportar.');
        return;
    }

    const exportData = observations.map(obs => ({
        hora: obs.hora,
        geracao: obs.geracao,
        pdp: obs.pdp,
        desvio: obs.desvio,
        texto: obs.texto,
        timestamp: obs.timestamp
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Observações');
    XLSX.writeFile(wb, 'observacoes.xlsx');
}

// ===========================
// ATUALIZAÇÃO GERAL
// ===========================

function updateAllVisualizations() {
    calculateAnalytics();
    calculatePeriodStats();
    renderMainChart();
    renderHeatmap();
    renderObservations();
    renderGenerationControls();
}
