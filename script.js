// ===========================
// VARIÁVEIS GLOBAIS
// ===========================

let currentData = [];
let observations = [];
let mainChart = null;
let editingObsIndex = null;

// ===========================
// DADOS DE EXEMPLO
// ===========================

const defaultData = [
    { hora: '00:00', pdp: 1790, geracao: 1785 },
    { hora: '00:30', pdp: 1790, geracao: 1792 },
    { hora: '01:00', pdp: 1790, geracao: 1788 },
    { hora: '01:30', pdp: 1790, geracao: 1795 },
    { hora: '02:00', pdp: 1790, geracao: 1787 },
    { hora: '02:30', pdp: 1790, geracao: 1791 },
    { hora: '03:00', pdp: 1790, geracao: 1789 },
    { hora: '03:30', pdp: 1790, geracao: 1793 },
    { hora: '04:00', pdp: 1790, geracao: 1786 },
    { hora: '04:30', pdp: 1790, geracao: 1790 },
    { hora: '05:00', pdp: 1790, geracao: 1794 },
    { hora: '05:30', pdp: 1790, geracao: 1788 },
    { hora: '06:00', pdp: 1790, geracao: 1791 },
    { hora: '06:30', pdp: 1790, geracao: 1787 },
    { hora: '07:00', pdp: 1790, geracao: 1792 },
    { hora: '07:30', pdp: 1790, geracao: 1789 },
    { hora: '08:00', pdp: 1790, geracao: 1793 },
    { hora: '08:30', pdp: 1790, geracao: 1786 },
    { hora: '09:00', pdp: 1790, geracao: 1795 },
    { hora: '09:30', pdp: 1790, geracao: 1788 },
    { hora: '10:00', pdp: 1790, geracao: 1790 },
    { hora: '10:30', pdp: 1790, geracao: 1792 },
    { hora: '11:00', pdp: 1790, geracao: 1787 },
    { hora: '11:30', pdp: 1790, geracao: 1789 },
    { hora: '12:00', pdp: 1790, geracao: 993 },  // Queda significativa
    { hora: '12:30', pdp: 1790, geracao: 1005 },
    { hora: '13:00', pdp: 1790, geracao: 1450 },
    { hora: '13:30', pdp: 1790, geracao: 1650 },
    { hora: '14:00', pdp: 1790, geracao: 1750 },
    { hora: '14:30', pdp: 1790, geracao: 1785 },
    { hora: '15:00', pdp: 1790, geracao: 1790 },
    { hora: '15:30', pdp: 1790, geracao: 1788 },
    { hora: '16:00', pdp: 1790, geracao: 1792 },
    { hora: '16:30', pdp: 1790, geracao: 1787 },
    { hora: '17:00', pdp: 1790, geracao: 1791 },
    { hora: '17:30', pdp: 1790, geracao: 1789 },
    { hora: '18:00', pdp: 1790, geracao: 1793 },
    { hora: '18:30', pdp: 1790, geracao: 1786 },
    { hora: '19:00', pdp: 1790, geracao: 1795 },
    { hora: '19:30', pdp: 1790, geracao: 1788 },
    { hora: '20:00', pdp: 1790, geracao: 1790 },
    { hora: '20:30', pdp: 1790, geracao: 1792 },
    { hora: '21:00', pdp: 1790, geracao: 1787 },
    { hora: '21:30', pdp: 1790, geracao: 1789 },
    { hora: '22:00', pdp: 1790, geracao: 1791 },
    { hora: '22:30', pdp: 1790, geracao: 1788 },
    { hora: '23:00', pdp: 1790, geracao: 1793 },
    { hora: '23:30', pdp: 1790, geracao: 1786 }
];

// Observação inicial
const defaultObservations = [
    {
        hora: '12:00',
        geracao: 993,
        pdp: 1790,
        desvio: -797,
        texto: 'Queda significativa de geração - verificar equipamentos',
        timestamp: new Date().toISOString()
    }
];

// ===========================
// INICIALIZAÇÃO
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados padrão
    currentData = [...defaultData];
    observations = [...defaultObservations];

    // Inicializar visualizações
    updateAllVisualizations();

    // Event Listeners - Botões principais
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('downloadTemplateBtn').addEventListener('click', downloadTemplate);
    document.getElementById('printBtn').addEventListener('click', () => window.print());

    // Event Listeners - Observações
    document.getElementById('uploadObsBtn').addEventListener('click', () => {
        document.getElementById('obsFileInput').click();
    });

    document.getElementById('obsFileInput').addEventListener('change', handleObsFileUpload);
    document.getElementById('downloadObsBtn').addEventListener('click', downloadObservations);

    // Event Listeners - Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelObsBtn').addEventListener('click', closeModal);
    document.getElementById('saveObsBtn').addEventListener('click', saveObservation);

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('obsModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Event Listener - Data do relatório
    document.getElementById('reportDate').addEventListener('change', updatePageTitleFromDate);

    // Inicializar data com data atual
    initializeReportDate();
});

// ===========================
// ATUALIZAÇÃO DE DATA
// ===========================

function initializeReportDate() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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

    // Desvio médio
    const desvios = currentData.map(d => d.geracao - d.pdp);
    const desvioMedio = desvios.reduce((a, b) => a + b, 0) / desvios.length;

    // Pico de geração
    const picoData = currentData.reduce((max, d) =>
        d.geracao > max.geracao ? d : max
    );

    // Eficiência (dentro da faixa baseada nas novas regras)
    const dentroFaixa = currentData.filter(d =>
        isDentroFaixa(d.geracao, d.pdp)
    ).length;
    const eficiencia = (dentroFaixa / currentData.length) * 100;

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
            return hour >= period.start && hour < period.end;
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

    // Calcular valor máximo das séries + 5%
    const maxGeracao = Math.max(...geracaoData);
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
                            // Exibir apenas horas cheias (terminam com :00)
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

    observations.forEach((obs, index) => {
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
                <div class="obs-actions no-print">
                    <button class="btn-icon" onclick="editObservation(${index})" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deleteObservation(${index})" title="Remover">🗑️</button>
                </div>
            </div>
            <div class="obs-data">
                Geração: ${obs.geracao} MW | PDP: ${obs.pdp} MW | Desvio: ${desvioFormatted}
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

function deleteObservation(index) {
    if (confirm('Deseja realmente remover esta observação?')) {
        observations.splice(index, 1);
        renderObservations();
    }
}

function saveObservation() {
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

    if (editingObsIndex !== null) {
        observations[editingObsIndex] = obs;
    } else {
        observations.push(obs);
    }

    renderObservations();
    closeModal();
}

function closeModal() {
    document.getElementById('obsModal').style.display = 'none';
    editingObsIndex = null;
}

// ===========================
// MANIPULAÇÃO DE EXCEL
// ===========================

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Validar e processar dados
            currentData = jsonData.map(row => ({
                hora: row.hora || row.Hora || '',
                pdp: parseFloat(row.pdp || row.PDP || 0),
                geracao: parseFloat(row.geracao || row.Geracao || row.geração || row.Geração || 0)
            }));

            if (currentData.length === 0) {
                alert('Nenhum dado válido encontrado no arquivo.');
                return;
            }

            updateAllVisualizations();
            alert('Dados carregados com sucesso!');
        } catch (error) {
            alert('Erro ao ler o arquivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);

    // Limpar input para permitir recarregar o mesmo arquivo
    e.target.value = '';
}

function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet(currentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, 'data.xlsx');
}

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
}
