// ===========================
// INICIALIZAÇÃO
// ===========================

let supabase = null;
let editorData = [];
let currentDate = null;

// Inicializar Supabase
if (typeof window.SUPABASE_CONFIG !== 'undefined' && typeof window.supabase !== 'undefined') {
    const { createClient } = window.supabase;
    supabase = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    console.log('✅ Supabase inicializado no editor');
} else {
    console.warn('⚠️ Configuração do Supabase não encontrada');
}

// ===========================
// FUNÇÕES DE DADOS
// ===========================

function generateDefaultRows() {
    const rows = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            rows.push({
                hora: hora,
                pdp: 1790,
                geracao: null,
                status: 'new'
            });
        }
    }
    return rows;
}

async function loadDataFromSupabase(reportDate) {
    if (!supabase) {
        console.warn('Supabase não disponível');
        return false;
    }

    showLoading(true);

    try {
        const { data, error } = await supabase
            .from('generation_data')
            .select('*')
            .eq('report_date', reportDate)
            .order('hora', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            editorData = data.map(row => ({
                id: row.id,
                hora: row.hora,
                pdp: row.pdp,
                geracao: row.geracao,
                status: 'saved'
            }));
            console.log(`✅ ${editorData.length} registro(s) carregado(s)`);
            renderTable();
            showLoading(false);
            return true;
        }

        showLoading(false);
        return false;
    } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
        alert('Erro ao carregar dados do Supabase: ' + error.message);
        showLoading(false);
        return false;
    }
}

async function saveDataToSupabase() {
    if (!supabase) {
        alert('Supabase não disponível');
        return;
    }

    if (!currentDate) {
        alert('Selecione uma data primeiro');
        return;
    }

    if (editorData.length === 0) {
        alert('Nenhum dado para salvar');
        return;
    }

    if (!confirm(`Salvar ${editorData.length} registros no Supabase para ${formatDateBR(currentDate)}?`)) {
        return;
    }

    showLoading(true);

    try {
        // Deletar dados existentes da data
        const { error: deleteError } = await supabase
            .from('generation_data')
            .delete()
            .eq('report_date', currentDate);

        if (deleteError) throw deleteError;

        // Preparar dados para inserção
        const records = editorData.map(d => ({
            hora: d.hora,
            pdp: d.pdp,
            geracao: d.geracao !== null && d.geracao !== undefined && d.geracao !== '' ? parseFloat(d.geracao) : null,
            report_date: currentDate
        }));

        // Inserir novos dados
        const { data, error } = await supabase
            .from('generation_data')
            .insert(records)
            .select();

        if (error) throw error;

        // Atualizar status local
        editorData = data.map(row => ({
            id: row.id,
            hora: row.hora,
            pdp: row.pdp,
            geracao: row.geracao,
            status: 'saved'
        }));

        console.log(`✅ ${records.length} registro(s) salvo(s)`);
        alert(`✅ ${records.length} registros salvos com sucesso!`);
        renderTable();
        showLoading(false);
    } catch (error) {
        console.error('Erro ao salvar dados:', error.message);
        alert('Erro ao salvar dados: ' + error.message);
        showLoading(false);
    }
}

// ===========================
// RENDERIZAÇÃO
// ===========================

function renderTable() {
    const tbody = document.getElementById('dataTableBody');

    if (editorData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                    Clique em "Carregar do Supabase" ou "Gerar 48 Linhas" para começar
                </td>
            </tr>
        `;
        updateDataCount(0);
        return;
    }

    tbody.innerHTML = editorData.map((row, index) => {
        const desvio = calculateDesvio(row.geracao, row.pdp);
        const desvioClass = desvio > 0 ? 'desvio-positive' : desvio < 0 ? 'desvio-negative' : 'desvio-zero';
        const statusIcon = getStatusIcon(row.status);

        return `
            <tr data-index="${index}">
                <td><strong>${row.hora}</strong></td>
                <td>
                    <div class="editable" data-field="pdp" data-index="${index}">
                        ${row.pdp}
                    </div>
                </td>
                <td>
                    <div class="editable" data-field="geracao" data-index="${index}">
                        ${row.geracao !== null && row.geracao !== undefined && row.geracao !== '' ? row.geracao : '--'}
                    </div>
                </td>
                <td class="${desvioClass}">
                    ${desvio !== null ? (desvio > 0 ? '+' : '') + desvio.toFixed(2) : '--'}
                </td>
                <td>
                    <span class="status-indicator status-${row.status}">${statusIcon}</span>
                </td>
            </tr>
        `;
    }).join('');

    updateDataCount(editorData.length);
    attachEditListeners();
}

function attachEditListeners() {
    const editables = document.querySelectorAll('.editable');

    editables.forEach(editable => {
        editable.addEventListener('click', function() {
            if (this.querySelector('input')) return;

            const field = this.dataset.field;
            const index = parseInt(this.dataset.index);
            const currentValue = editorData[index][field];

            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.className = 'editable-input';
            input.value = currentValue !== null && currentValue !== undefined ? currentValue : '';

            this.innerHTML = '';
            this.appendChild(input);
            this.classList.add('editing');
            input.focus();
            input.select();

            const saveValue = () => {
                const newValue = input.value.trim() === '' ? null : parseFloat(input.value);
                editorData[index][field] = newValue;

                // Marcar como modificado
                if (editorData[index].status === 'saved') {
                    editorData[index].status = 'modified';
                }

                renderTable();
            };

            input.addEventListener('blur', saveValue);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveValue();
                } else if (e.key === 'Escape') {
                    renderTable();
                }
            });
        });
    });
}

// ===========================
// UTILITÁRIOS
// ===========================

function calculateDesvio(geracao, pdp) {
    if (geracao === null || geracao === undefined || geracao === '') return null;
    if (pdp === null || pdp === undefined || pdp === '') return null;
    return parseFloat(geracao) - parseFloat(pdp);
}

function getStatusIcon(status) {
    switch(status) {
        case 'saved': return '🟢';
        case 'modified': return '🟡';
        case 'new': return '⚪';
        default: return '⚪';
    }
}

function updateDataCount(count) {
    document.getElementById('dataCount').textContent = `(${count} registros)`;
}

function formatDateBR(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function showLoading(show) {
    let overlay = document.getElementById('loadingOverlay');

    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    } else {
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// ===========================
// EVENT LISTENERS
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar data com hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
    currentDate = today;

    // Botão Voltar
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Botão Carregar do Supabase
    document.getElementById('loadBtn').addEventListener('click', async () => {
        const loaded = await loadDataFromSupabase(currentDate);
        if (!loaded) {
            alert('Nenhum dado encontrado para esta data. Clique em "Gerar 48 Linhas" para começar.');
        }
    });

    // Botão Salvar no Supabase
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveDataToSupabase();
    });

    // Botão Gerar 48 Linhas
    document.getElementById('generateBtn').addEventListener('click', () => {
        if (editorData.length > 0) {
            if (!confirm('Isso substituirá os dados atuais. Continuar?')) {
                return;
            }
        }

        editorData = generateDefaultRows();
        renderTable();
        console.log('✅ 48 linhas geradas');
    });

    // Botão Limpar Geração
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (editorData.length === 0) {
            alert('Nenhum dado carregado');
            return;
        }

        if (!confirm('Isso limpará apenas os valores de geração (PDP será mantido). Continuar?')) {
            return;
        }

        editorData = editorData.map(row => ({
            ...row,
            geracao: null,
            status: row.status === 'saved' ? 'modified' : row.status
        }));

        renderTable();
        console.log('✅ Valores de geração limpos');
    });

    // Event Listener - Data
    document.getElementById('reportDate').addEventListener('change', (e) => {
        currentDate = e.target.value;
        console.log('Data alterada para:', currentDate);
    });

    // Tentar carregar dados da data atual
    loadDataFromSupabase(currentDate);
});
