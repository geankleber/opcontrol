// ===========================
// CONTROLE DA GERAÇÃO
// ===========================
// Sistema para registrar alterações de set-point de geração

let generationControls = [];
let showAllControls = false; // Estado de expansão da lista

// ===========================
// FUNÇÕES DE PERSISTÊNCIA
// ===========================

/**
 * Carrega registros de controle do Supabase para uma data específica
 */
async function loadGenerationControlsFromSupabase() {
    if (!supabase) return false;

    try {
        const reportDate = document.getElementById('reportDate').value;
        const { data, error } = await supabase
            .from('generation_control')
            .select('*')
            .eq('report_date', reportDate)
            .order('created_at', { ascending: false });

        if (error) throw error;

        generationControls = data.map(ctrl => ({
            id: ctrl.id,
            hora: ctrl.hora,
            setpoint: ctrl.setpoint,
            responsavel: ctrl.responsavel,
            detalhe: ctrl.detalhe,
            created_at: ctrl.created_at
        }));

        console.log(`✅ ${generationControls.length} registro(s) de controle carregado(s)`);
        return true;
    } catch (error) {
        console.error('Erro ao carregar controles de geração:', error.message);
        return false;
    }
}

/**
 * Salva um novo registro de controle no Supabase
 */
async function saveGenerationControlToSupabase(control) {
    if (!supabase) return false;

    try {
        const reportDate = document.getElementById('reportDate').value;
        const dbControl = {
            hora: control.hora,
            setpoint: control.setpoint,
            responsavel: control.responsavel,
            detalhe: control.detalhe || null,
            report_date: reportDate
        };

        const { data, error } = await supabase
            .from('generation_control')
            .insert([dbControl])
            .select();

        if (error) throw error;
        console.log('✅ Registro de controle salvo no Supabase');
        return data[0];
    } catch (error) {
        console.error('Erro ao salvar controle de geração:', error.message);
        return false;
    }
}

/**
 * Atualiza um registro de controle existente
 */
async function updateGenerationControlInSupabase(controlId, control) {
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('generation_control')
            .update({
                hora: control.hora,
                setpoint: control.setpoint,
                responsavel: control.responsavel,
                detalhe: control.detalhe || null
            })
            .eq('id', controlId)
            .select();

        if (error) throw error;
        console.log('✅ Registro de controle atualizado no Supabase');
        return data[0];
    } catch (error) {
        console.error('Erro ao atualizar controle de geração:', error.message);
        return false;
    }
}

/**
 * Deleta um registro de controle do Supabase
 */
async function deleteGenerationControlFromSupabase(controlId) {
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('generation_control')
            .delete()
            .eq('id', controlId);

        if (error) throw error;
        console.log('✅ Registro de controle removido do Supabase');
        return true;
    } catch (error) {
        console.error('Erro ao deletar controle de geração:', error.message);
        return false;
    }
}

/**
 * Deleta todos os registros de controle de uma data
 */
async function deleteAllGenerationControlsFromSupabase() {
    if (!supabase) return false;

    try {
        const reportDate = document.getElementById('reportDate').value;
        const { error } = await supabase
            .from('generation_control')
            .delete()
            .eq('report_date', reportDate);

        if (error) throw error;
        console.log('✅ Todos os registros de controle removidos do Supabase');
        return true;
    } catch (error) {
        console.error('Erro ao deletar controles de geração:', error.message);
        return false;
    }
}

// ===========================
// FUNÇÕES DE INTERFACE
// ===========================

/**
 * Renderiza a lista de registros de controle
 */
function renderGenerationControls() {
    const list = document.getElementById('generationControlsList');
    const count = document.getElementById('controlsCount');

    count.textContent = `(${generationControls.length})`;

    // Renderizar linha do tempo
    renderTimeline();

    if (generationControls.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; margin-top: 20px; padding-top: 0; border-top: none;">Nenhum registro de controle.</p>';
        list.style.borderTop = 'none';
        list.style.paddingTop = '0';
        return;
    }

    // Restaurar borda se houver controles
    list.style.borderTop = '';
    list.style.paddingTop = '';

    list.innerHTML = '';

    // Determinar quantos controles mostrar
    const maxVisible = 3;
    const isPrinting = window.matchMedia('print').matches;

    // Ordenar por hora
    // Print: ordem crescente (mais antiga primeiro)
    // Tela: ordem decrescente (mais recente primeiro)
    const sortedControls = [...generationControls].sort((a, b) => {
        return isPrinting
            ? a.hora.localeCompare(b.hora)  // Crescente para impressão
            : b.hora.localeCompare(a.hora); // Decrescente para tela
    });
    const controlsToShow = (showAllControls || isPrinting) ? sortedControls : sortedControls.slice(0, maxVisible);
    const hasMore = sortedControls.length > maxVisible;

    controlsToShow.forEach((ctrl) => {
        // Encontrar índice original para editar/deletar
        const index = generationControls.findIndex(c => c.id === ctrl.id || (c.hora === ctrl.hora && c.created_at === ctrl.created_at));
        const item = document.createElement('div');
        item.className = 'control-item';

        const timestamp = new Date(ctrl.created_at);
        const timestampStr = timestamp.toLocaleString('pt-BR');

        // Formatar hora (hh:mm)
        const horaFormatada = ctrl.hora.substring(0, 5); // Pega apenas HH:MM

        // Formatar setpoint sem casas decimais
        const setpointFormatado = Math.round(ctrl.setpoint);

        // Ícone/cor por responsável
        const responsavelIcon = ctrl.responsavel === 'ONS' ? '🏢' : '⚡';
        const responsavelClass = ctrl.responsavel === 'ONS' ? 'responsavel-ons' : 'responsavel-axia';

        item.innerHTML = `
            <div class="control-header">
                <div class="control-left">
                    <span class="control-hora"><strong>${horaFormatada}</strong></span>
                    <span class="control-setpoint">Set-Point: <strong>${setpointFormatado} MW</strong></span>
                    <span class="control-responsavel ${responsavelClass}">
                        ${responsavelIcon} ${ctrl.responsavel}
                    </span>
                </div>
                <div class="control-right">
                    <span class="control-timestamp">Registrado em: ${timestampStr}</span>
                    <div class="control-actions no-print">
                        <button class="btn-icon" onclick="editGenerationControl(${index})" title="Editar">✏️</button>
                        <button class="btn-icon" onclick="deleteGenerationControl(${index})" title="Remover">🗑️</button>
                    </div>
                </div>
            </div>
            ${ctrl.detalhe ? `<div class="control-detalhe">${ctrl.detalhe}</div>` : ''}
        `;

        list.appendChild(item);
    });

    // Adicionar botão "Ver mais/menos" se houver mais de 3 controles
    if (hasMore) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'btn btn-sm btn-secondary toggle-controls-btn no-print';
        toggleButton.style.marginTop = '15px';
        toggleButton.style.width = '100%';
        toggleButton.innerHTML = showAllControls
            ? `▲ Ocultar controles antigos (${sortedControls.length - maxVisible})`
            : `▼ Ver todos os controles (${sortedControls.length - maxVisible} ocultos)`;

        toggleButton.onclick = toggleShowAllControls;

        list.appendChild(toggleButton);
    }
}

/**
 * Alterna entre mostrar todos ou apenas os 3 mais recentes
 */
function toggleShowAllControls() {
    showAllControls = !showAllControls;
    renderGenerationControls();
}

/**
 * Abre o modal para adicionar novo registro de controle
 */
function openGenerationControlModal() {
    // Obter hora atual no horário de Brasília
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const hours = String(brasiliaTime.getHours()).padStart(2, '0');
    const minutes = String(brasiliaTime.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Resetar formulário
    document.getElementById('controlHora').value = currentTime;
    document.getElementById('controlSetpoint').value = '';
    document.getElementById('controlDetalhe').value = '';

    // Selecionar ONS por padrão
    const radioONS = document.querySelector('input[name="controlResponsavel"][value="ONS"]');
    if (radioONS) radioONS.checked = true;

    document.getElementById('controlModalTitle').textContent = 'Adicionar Controle da Geração';
    editingControlIndex = null;

    document.getElementById('controlModal').style.display = 'block';
    document.getElementById('controlSetpoint').focus();
}

/**
 * Fecha o modal de controle
 */
function closeGenerationControlModal() {
    document.getElementById('controlModal').style.display = 'none';
    editingControlIndex = null;
}

/**
 * Edita um registro de controle existente
 */
function editGenerationControl(index) {
    editingControlIndex = index;
    const ctrl = generationControls[index];

    document.getElementById('controlHora').value = ctrl.hora;
    document.getElementById('controlSetpoint').value = Math.round(ctrl.setpoint);
    document.getElementById('controlDetalhe').value = ctrl.detalhe || '';

    // Selecionar o radio button correto
    const radio = document.querySelector(`input[name="controlResponsavel"][value="${ctrl.responsavel}"]`);
    if (radio) radio.checked = true;

    document.getElementById('controlModalTitle').textContent = 'Editar Controle da Geração';
    document.getElementById('controlModal').style.display = 'block';
    document.getElementById('controlHora').focus();
}

/**
 * Salva um registro de controle (novo ou editado)
 */
async function saveGenerationControl() {
    const hora = document.getElementById('controlHora').value.trim();
    const setpoint = document.getElementById('controlSetpoint').value.trim();
    const detalhe = document.getElementById('controlDetalhe').value.trim();

    // Obter valor do radio button selecionado
    const responsavelRadio = document.querySelector('input[name="controlResponsavel"]:checked');
    const responsavel = responsavelRadio ? responsavelRadio.value : null;

    // Validações
    if (!hora) {
        alert('Por favor, informe a hora da modificação.');
        document.getElementById('controlHora').focus();
        return;
    }

    if (!setpoint) {
        alert('Por favor, informe o novo set-point.');
        document.getElementById('controlSetpoint').focus();
        return;
    }

    const setpointValue = Math.round(parseFloat(setpoint));
    if (isNaN(setpointValue)) {
        alert('Set-point deve ser um número válido.');
        document.getElementById('controlSetpoint').focus();
        return;
    }

    if (!responsavel) {
        alert('Por favor, selecione o responsável.');
        return;
    }

    const control = {
        hora: hora,
        setpoint: setpointValue,
        responsavel: responsavel,
        detalhe: detalhe,
        created_at: new Date().toISOString()
    };

    let savedControl = control;

    // Tentar salvar no Supabase
    if (supabase) {
        if (editingControlIndex !== null) {
            // Atualizar registro existente
            const existingControl = generationControls[editingControlIndex];
            const result = await updateGenerationControlInSupabase(existingControl.id, control);
            if (result) {
                savedControl = { ...control, id: existingControl.id };
                generationControls[editingControlIndex] = savedControl;
            } else {
                alert('Erro ao atualizar registro no servidor.');
                return;
            }
        } else {
            // Inserir novo registro
            const result = await saveGenerationControlToSupabase(control);
            if (result) {
                savedControl = { ...control, id: result.id, created_at: result.created_at };
                generationControls.unshift(savedControl); // Adiciona no início (mais recente primeiro)
            } else {
                alert('Erro ao salvar registro no servidor.');
                return;
            }
        }
    } else {
        // Fallback: salvar apenas localmente
        if (editingControlIndex !== null) {
            generationControls[editingControlIndex] = control;
        } else {
            generationControls.unshift(control);
        }
    }

    renderGenerationControls();
    closeGenerationControlModal();
}

/**
 * Deleta um registro de controle
 */
async function deleteGenerationControl(index) {
    if (!confirm('Deseja realmente remover este registro de controle?')) {
        return;
    }

    const ctrl = generationControls[index];

    // Tentar deletar do Supabase
    if (supabase && ctrl.id) {
        const success = await deleteGenerationControlFromSupabase(ctrl.id);
        if (!success) {
            alert('Erro ao remover registro do servidor. Tente novamente.');
            return;
        }
    }

    // Remover do array local
    generationControls.splice(index, 1);
    renderGenerationControls();
}

/**
 * Deleta todos os registros de controle da data atual
 */
async function deleteAllGenerationControls() {
    const count = generationControls.length;

    if (count === 0) {
        alert('Não há registros para excluir.');
        return;
    }

    const reportDate = document.getElementById('reportDate').value;
    const confirmMsg = `Deseja realmente excluir TODOS os ${count} registro(s) de controle da data ${reportDate}?\n\n⚠️ Esta ação não pode ser desfeita!`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // Tentar deletar do Supabase
    if (supabase) {
        const success = await deleteAllGenerationControlsFromSupabase();
        if (!success) {
            alert('Erro ao remover registros do servidor. Tente novamente.');
            return;
        }
    }

    // Limpar array local
    generationControls = [];
    renderGenerationControls();

    alert(`${count} registro(s) excluído(s) com sucesso!`);
}

/**
 * Exporta registros de controle para Excel
 */
function downloadGenerationControls() {
    if (generationControls.length === 0) {
        alert('Não há registros de controle para exportar.');
        return;
    }

    const exportData = generationControls.map(ctrl => ({
        hora: ctrl.hora,
        setpoint: ctrl.setpoint,
        responsavel: ctrl.responsavel,
        detalhe: ctrl.detalhe || '',
        registrado_em: new Date(ctrl.created_at).toLocaleString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Controle de Geração');

    const reportDate = document.getElementById('reportDate').value;
    XLSX.writeFile(wb, `controle_geracao_${reportDate}.xlsx`);
}

/**
 * Importa registros de controle de um arquivo Excel
 */
function handleControlFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            if (!confirm(`Isso irá ADICIONAR ${jsonData.length} registro(s) aos já existentes. Continuar?`)) {
                return;
            }

            const newControls = [];

            for (const row of jsonData) {
                const control = {
                    hora: row.hora || row.Hora || '',
                    setpoint: parseFloat(row.setpoint || row.Setpoint || row['Set-point'] || 0),
                    responsavel: row.responsavel || row.Responsavel || 'ONS',
                    detalhe: row.detalhe || row.Detalhe || '',
                    created_at: new Date().toISOString()
                };

                // Validar responsável
                if (control.responsavel !== 'ONS' && control.responsavel !== 'Axia Energia') {
                    control.responsavel = 'ONS';
                }

                // Salvar no Supabase
                if (supabase) {
                    const result = await saveGenerationControlToSupabase(control);
                    if (result) {
                        newControls.push({ ...control, id: result.id, created_at: result.created_at });
                    }
                } else {
                    newControls.push(control);
                }
            }

            // Adicionar aos controles existentes
            generationControls = [...newControls, ...generationControls];
            renderGenerationControls();
            alert(`${newControls.length} registro(s) importado(s) com sucesso!`);
        } catch (error) {
            alert('Erro ao ler o arquivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);

    e.target.value = '';
}

// Variável global para controlar edição
let editingControlIndex = null;

// ===========================
// LINHA DO TEMPO
// ===========================

/**
 * Renderiza a linha do tempo com os controles de geração
 */
function renderTimeline() {
    const container = document.getElementById('timelineContainer');

    if (generationControls.length === 0) {
        container.innerHTML = '<div class="timeline-empty">Nenhum controle de geração registrado. Adicione registros para visualizar a linha do tempo.</div>';
        return;
    }

    // Ordenar controles por hora
    const sortedControls = [...generationControls].sort((a, b) => {
        return a.hora.localeCompare(b.hora);
    });

    // HTML da linha do tempo
    let html = '<div class="timeline-wrapper">';
    html += '<h3 class="timeline-title">Linha do Tempo</h3>';
    html += '<div class="timeline-line">';

    // Horários Início e Fim
    html += '<div class="timeline-start-time">00:00</div>';
    html += '<div class="timeline-end-time">24:00</div>';

    // Adicionar eventos na linha do tempo com detecção de sobreposição
    let lastPercentage = -10; // Inicializa com valor que não causa sobreposição
    let offsetLevel = 0; // 0, 1, 2 para múltiplos níveis de sobreposição

    sortedControls.forEach((ctrl, index) => {
        const horaFormatada = ctrl.hora.substring(0, 5);
        const setpointFormatado = Math.round(ctrl.setpoint);

        // Calcular posição no timeline (0-100%)
        const [hours, minutes] = horaFormatada.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const percentage = (totalMinutes / (24 * 60)) * 100;

        // Detectar se está muito próximo do evento anterior (menos de 5% de distância)
        const distance = percentage - lastPercentage;
        const isNearPrevious = distance < 5;

        // Alternar posição em níveis se houver sobreposição
        if (isNearPrevious) {
            offsetLevel = (offsetLevel + 1) % 3; // Cicla entre 0, 1, 2
        } else {
            offsetLevel = 0;
        }

        const offsetClass = offsetLevel === 1 ? 'timeline-event-offset-1' :
                           offsetLevel === 2 ? 'timeline-event-offset-2' : '';

        // Classe do ponto baseada no responsável
        const pointClass = ctrl.responsavel === 'ONS' ? 'timeline-point-ons' : 'timeline-point-axia';

        html += `
            <div class="timeline-event ${offsetClass}" style="left: ${percentage}%">
                <div class="timeline-event-time">${horaFormatada}</div>
                <div class="timeline-arrow-down"></div>
                <div class="timeline-point ${pointClass}"></div>
                <div class="timeline-event-value">${setpointFormatado} MW</div>
                ${ctrl.detalhe ? `
                    <div class="timeline-event-detail">
                        <strong>${ctrl.responsavel}</strong><br>
                        ${ctrl.detalhe}
                    </div>
                ` : `
                    <div class="timeline-event-detail">
                        <strong>${ctrl.responsavel}</strong>
                    </div>
                `}
            </div>
        `;

        lastPercentage = percentage;
    });

    html += '</div>'; // timeline-line

    // Legenda
    html += '<div class="timeline-legend">';
    html += '<span class="timeline-legend-label">Responsável:</span>';
    html += '<div class="timeline-legend-item"><span class="timeline-legend-dot timeline-legend-dot-ons"></span> ONS</div>';
    html += '<div class="timeline-legend-item"><span class="timeline-legend-dot timeline-legend-dot-axia"></span> Axia Energia</div>';
    html += '</div>';

    html += '</div>'; // timeline-wrapper

    container.innerHTML = html;
}
