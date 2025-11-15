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

    // Começar de 00:30 (pular 00:00)
    rows.push({
        hora: '00:30',
        pdp: null,
        geracao: null,
        status: 'new'
    });

    // Gerar de 01:00 até 23:30
    for (let h = 1; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            rows.push({
                hora: hora,
                pdp: null,
                geracao: null,
                status: 'new'
            });
        }
    }

    // Adicionar 24:00 no final
    rows.push({
        hora: '24:00',
        pdp: null,
        geracao: null,
        status: 'new'
    });

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

async function deleteDataFromSupabase() {
    if (!supabase) {
        alert('Supabase não disponível');
        return;
    }

    if (!currentDate) {
        alert('Selecione uma data primeiro');
        return;
    }

    const confirmMsg = `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nDeseja realmente EXCLUIR PERMANENTEMENTE todos os dados de ${formatDateBR(currentDate)} do Supabase?\n\nClique em OK para confirmar a exclusão.`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // Confirmação dupla para ação destrutiva
    if (!confirm('Tem certeza absoluta? Esta ação NÃO PODE ser desfeita!')) {
        return;
    }

    showLoading(true);

    try {
        const { error } = await supabase
            .from('generation_data')
            .delete()
            .eq('report_date', currentDate);

        if (error) throw error;

        // Limpar dados locais
        editorData = [];
        renderTable();

        console.log(`✅ Dados de ${currentDate} excluídos do Supabase`);
        alert(`✅ Todos os dados de ${formatDateBR(currentDate)} foram excluídos permanentemente do Supabase.`);
        showLoading(false);
    } catch (error) {
        console.error('Erro ao excluir dados:', error.message);
        alert('Erro ao excluir dados: ' + error.message);
        showLoading(false);
    }
}

async function importPDPFromONS() {
    if (!currentDate) {
        alert('Selecione uma data primeiro');
        return;
    }

    const confirmMsg = `Importar dados de PDP da API do ONS para ${formatDateBR(currentDate)}?\n\nIsso irá substituir os valores de PDP existentes.`;

    if (!confirm(confirmMsg)) {
        return;
    }

    showLoading(true);

    try {
        // Chamar Edge Function
        const response = await fetch(
            'https://shjbfriuqrwbnqochybz.supabase.co/functions/v1/import-pdp',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.SUPABASE_CONFIG.anonKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: currentDate }),
            }
        );

        const result = await response.json();

        if (response.ok && result.success) {
            alert(`✅ ${result.records} registros de PDP importados com sucesso da API do ONS!`);

            // Recarregar dados do Supabase
            await loadDataFromSupabase(currentDate);

            console.log(`✅ PDP importado do ONS: ${result.records} registros`);
        } else {
            // Verificar se é erro de dados zerados
            if (result.error_type === 'DADOS_ZERADOS') {
                alert(`ℹ️ ${result.message}\n\nData: ${formatDateBR(currentDate)}`);
                console.log(`ℹ️ Dados zerados para ${currentDate}`);
            } else {
                throw new Error(result.error || result.message || 'Erro desconhecido ao importar PDP');
            }
        }

        showLoading(false);
    } catch (error) {
        console.error('Erro ao importar PDP do ONS:', error);
        alert(`❌ Erro ao importar PDP do ONS:\n\n${error.message}\n\nVerifique os logs do Supabase para mais detalhes.`);
        showLoading(false);
    }
}

function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Pegar primeira planilha
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            if (jsonData.length === 0) {
                alert('Arquivo Excel vazio ou formato inválido');
                showLoading(false);
                return;
            }

            // Processar dados
            editorData = jsonData.map(row => {
                // Aceitar diferentes formatos de coluna (maiúscula/minúscula)
                const hora = row.hora || row.Hora || row.HORA || '';
                const pdp = row.pdp || row.PDP || row.Pdp || 0;
                const geracao = row.geracao || row.Geracao || row.GERACAO || null;

                return {
                    hora: String(hora).trim(),
                    pdp: parseFloat(pdp) || 0,
                    geracao: geracao !== null && geracao !== undefined && geracao !== '' ? parseFloat(geracao) : null,
                    status: 'new'
                };
            }).filter(row => row.hora); // Remover linhas sem hora

            if (editorData.length === 0) {
                alert('Nenhum dado válido encontrado. Certifique-se de que as colunas são: hora, pdp, geracao');
                showLoading(false);
                return;
            }

            console.log(`✅ ${editorData.length} registro(s) carregado(s) do Excel`);
            renderTable();
            showLoading(false);
            alert(`✅ ${editorData.length} registros carregados com sucesso!\n\nAgora você pode editar e clicar em "Salvar no Supabase".`);

        } catch (error) {
            console.error('Erro ao processar Excel:', error);
            alert('Erro ao processar arquivo Excel: ' + error.message);
            showLoading(false);
        }
    };

    reader.onerror = () => {
        alert('Erro ao ler arquivo');
        showLoading(false);
    };

    reader.readAsArrayBuffer(file);

    // Limpar input para permitir recarregar o mesmo arquivo
    e.target.value = '';
}

function downloadExcel() {
    if (editorData.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }

    if (!currentDate) {
        alert('Selecione uma data primeiro');
        return;
    }

    // Preparar dados para exportação (sem o campo status)
    const exportData = editorData.map(row => ({
        hora: row.hora,
        pdp: row.pdp,
        geracao: row.geracao !== null && row.geracao !== undefined ? row.geracao : ''
    }));

    // Criar planilha e workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');

    // Nome do arquivo com a data
    const fileName = `data_${currentDate}.xlsx`;

    // Download
    XLSX.writeFile(wb, fileName);
    console.log(`✅ Arquivo ${fileName} exportado com sucesso`);
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
    // Verificar se há data na URL (vindo da página principal)
    const urlParams = new URLSearchParams(window.location.search);
    const dateFromUrl = urlParams.get('date');

    let initialDate;

    if (dateFromUrl) {
        // Usar data passada pela URL
        initialDate = dateFromUrl;
        console.log(`Data recebida da URL: ${initialDate}`);
    } else {
        // Inicializar data com hoje (horário de Brasília)
        const now = new Date();
        const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

        const year = brasiliaTime.getFullYear();
        const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
        const day = String(brasiliaTime.getDate()).padStart(2, '0');
        initialDate = `${year}-${month}-${day}`;
        console.log(`Data inicializada: ${initialDate} (Horário de Brasília)`);
    }

    document.getElementById('reportDate').value = initialDate;
    currentDate = initialDate;

    // Botão Voltar
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = `../index.html?date=${currentDate}`;
    });

    // Botão Upload Excel
    document.getElementById('uploadExcelBtn').addEventListener('click', () => {
        document.getElementById('excelFileInput').click();
    });

    // Input file Excel
    document.getElementById('excelFileInput').addEventListener('change', handleExcelUpload);

    // Botão Download Excel
    document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);

    // Botão Salvar
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

    // Botão Importar PDP do ONS
    document.getElementById('importPdpBtn').addEventListener('click', () => {
        importPDPFromONS();
    });

    // Botão Excluir Geração
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (editorData.length === 0) {
            alert('Nenhum dado carregado');
            return;
        }

        if (!confirm('Isso excluirá apenas os valores de geração (PDP será mantido). Continuar?')) {
            return;
        }

        editorData = editorData.map(row => ({
            ...row,
            geracao: null,
            status: row.status === 'saved' ? 'modified' : row.status
        }));

        renderTable();
        console.log('✅ Valores de geração excluídos');
    });

    // Botão Excluir Tudo
    document.getElementById('deleteBtn').addEventListener('click', () => {
        deleteDataFromSupabase();
    });

    // Event Listener - Data
    document.getElementById('reportDate').addEventListener('change', async (e) => {
        currentDate = e.target.value;
        console.log('Data alterada para:', currentDate);

        // Carregar dados automaticamente ao mudar a data
        const loaded = await loadDataFromSupabase(currentDate);
        if (!loaded) {
            // Limpar tabela se não houver dados para esta data
            editorData = [];
            renderTable();
            console.log('ℹ️ Nenhum dado encontrado para esta data.');
        }
    });

    // Tentar carregar dados da data atual
    loadDataFromSupabase(currentDate);
});
