# Manual do Controle da Geração

## Visão Geral

O **Controle da Geração** é um sistema de registro temporal que permite documentar todas as alterações de set-point (valor programado) de geração, identificando o responsável pela solicitação e detalhes da mudança.

## Campos do Registro

Cada registro de controle contém:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| **Hora** | TIME | ✅ Sim | Horário em que a modificação foi solicitada |
| **Set-point** | Número | ✅ Sim | Novo valor de geração em MW |
| **Responsável** | Seleção | ✅ Sim | Quem solicitou (ONS ou Axia Energia) |
| **Detalhe** | Texto | ❌ Não | Campo livre para detalhamento da solicitação |

## Como Usar

### 1. Adicionar um Novo Registro

1. Na página principal, localize a seção **"Controle da Geração"**
2. Clique no botão **"➕ Adicionar Controle"**
3. Preencha o formulário:
   - **Hora**: Selecione o horário da modificação
   - **Set-point**: Digite o novo valor em MW (ex: 1790.50)
   - **Responsável**: Selecione entre ONS ou Axia Energia
   - **Detalhe**: (Opcional) Descreva o motivo da alteração
4. Clique em **"Salvar"**

### 2. Editar um Registro

1. Localize o registro na lista
2. Clique no ícone ✏️ (Editar)
3. Modifique os campos desejados
4. Clique em **"Salvar"**

### 3. Excluir um Registro

1. Localize o registro na lista
2. Clique no ícone 🗑️ (Remover)
3. Confirme a exclusão

### 4. Excluir Todos os Registros

1. Clique no botão **"Excluir Todos"**
2. Confirme a ação (⚠️ irreversível)

### 5. Exportar para Excel

1. Clique no botão **"Download Excel"**
2. O arquivo será salvo como `controle_geracao_YYYY-MM-DD.xlsx`

### 6. Importar de Excel

1. Prepare um arquivo Excel com as colunas:
   - `hora` (formato HH:MM)
   - `setpoint` (número em MW)
   - `responsavel` (ONS ou Axia Energia)
   - `detalhe` (texto, opcional)
2. Clique em **"Carregar Excel"**
3. Selecione o arquivo
4. Os registros serão **adicionados** aos existentes

## Visualização dos Registros

Os registros são exibidos em ordem cronológica reversa (mais recentes primeiro) e incluem:

- **Hora** da modificação
- **Set-point** (valor em MW)
- **Responsável** com distintivo colorido:
  - 🏢 **ONS**: Roxo
  - ⚡ **Axia Energia**: Rosa/vermelho
- **Detalhe** da solicitação (se fornecido)
- **Data/hora** de registro no sistema

## Filtro por Data

- Use o seletor de data no cabeçalho da página para visualizar registros de datas específicas
- Cada data possui seus próprios registros independentes

## Impressão

- Os registros de controle são incluídos automaticamente ao imprimir o relatório
- Use o botão **"Imprimir Relatório"** no cabeçalho
- As cores dos distintivos de responsável são preservadas na impressão

## Armazenamento

Todos os registros são salvos no **Supabase** e vinculados à data do relatório, garantindo:

- ✅ Persistência dos dados
- ✅ Acesso de múltiplos dispositivos
- ✅ Backup automático
- ✅ Histórico completo por data

## Casos de Uso

### Exemplo 1: Solicitação do ONS
```
Hora: 14:30
Set-point: 1850 MW
Responsável: ONS
Detalhe: Aumento de carga devido a pico de demanda no sistema
```

### Exemplo 2: Ajuste Interno
```
Hora: 09:15
Set-point: 1750 MW
Responsável: Axia Energia
Detalhe: Manutenção programada na unidade geradora 3
```

### Exemplo 3: Redução de Geração
```
Hora: 22:45
Set-point: 1650 MW
Responsável: ONS
Detalhe: Redução de carga no sistema interligado
```

## Dicas

- 💡 Sempre preencha o campo **Detalhe** para documentar o motivo da alteração
- 💡 Registre as alterações imediatamente após receberem a solicitação
- 💡 Use o campo de hora com precisão para facilitar auditorias
- 💡 Exporte regularmente para Excel como backup adicional
- 💡 Revise os registros ao final do dia para garantir completude

## Troubleshooting

### Os registros não aparecem
- Verifique se a data selecionada está correta
- Confirme que o Supabase está configurado (veja SUPABASE-SETUP.md)
- Verifique o console do navegador (F12) para erros

### Erro ao salvar
- Certifique-se de preencher todos os campos obrigatórios
- Verifique sua conexão com a internet
- Confirme que a tabela `generation_control` existe no Supabase

### Registros duplicados após importar Excel
- A importação **adiciona** registros aos existentes
- Se necessário, use "Excluir Todos" antes de importar

## Suporte

Para problemas ou dúvidas:
1. Verifique a documentação em `docs/`
2. Consulte os logs do console do navegador (F12)
3. Contate o suporte técnico

---

**Última atualização:** 2025-11-12
