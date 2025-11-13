# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.1.0] - 2025-11-12

### 🎉 Versão Inicial

Primeira versão estável do sistema de monitoramento e controle de geração da UHE Teles Pires.

### ✨ Funcionalidades Principais

#### 📊 Dashboard de Monitoramento
- **Gráfico Principal**: Visualização de geração realizada vs programada
  - Linha do tempo de 00:30 até 23:59
  - Rótulos no eixo horizontal em horas cheias + 23:59
  - Tooltip com desvio em MW
  - Clique para adicionar observações

- **KPIs em Tempo Real**:
  - Desvio médio (MW)
  - Pico de geração (MW e horário)
  - Eficiência (% dentro da faixa programada)

- **Heatmap de Desvios**:
  - Visualização colorida por hora do dia
  - Escala: verde (dentro), amarelo (moderado), vermelho (alto)

- **Resumo Estatístico**:
  - Métricas por período (madrugada, manhã, tarde, noite)
  - Geração realizada média, programada média e desvio médio

#### 🎛️ Controle da Geração
- **Registro de Mudanças de Set-point**:
  - Hora (formato HH:MM)
  - Set-point em MW (sem decimais)
  - Responsável (ONS ou Axia Energia)
  - Detalhamento opcional da solicitação
  - Timestamp automático de criação

- **Linha do Tempo Visual** (00:00 - 24:00):
  - Visualização gráfica de todos os controles do dia
  - Círculos coloridos por responsável:
    - 🟢 ONS: Verde oliva (#475D16)
    - 🔵 Axia Energia: Azul (#0000FF)
  - Legenda com rótulo "Responsável:"
  - Sistema anti-sobreposição de rótulos (3 níveis)
  - Tooltips com detalhes ao passar o mouse
  - Setas indicadoras de momento da mudança

- **Gerenciamento de Controles**:
  - Adicionar, editar e deletar registros
  - Importar/exportar Excel
  - Ordenação cronológica automática
  - Contador de registros
  - Filtro por data do relatório

- **Cores Padronizadas**:
  - Consistência visual entre lista, linha do tempo e legenda
  - ONS: #475D16 (verde oliva)
  - Axia Energia: #0000FF (azul)

#### 📝 Sistema de Observações
- **Observações Contextuais**:
  - Vinculadas a hora, geração, PDP e desvio
  - Adição rápida via clique no gráfico
  - Campo de texto livre para observações
  - Timestamp de criação
  - Filtro por data

- **Gerenciamento**:
  - Upload/download de Excel
  - Exclusão individual ou em lote
  - Contador de observações

#### ✏️ Editor de Dados
- **Interface Dedicada** (editor.html):
  - Edição inline de valores PDP e Geração
  - Cálculo automático de desvios
  - Geração de 48 linhas padrão (00:30 até 23:59)
  - Indicadores de status (salvo, modificado, novo)
  - Sincronização com Supabase

- **Funcionalidades**:
  - Carregar dados existentes do Supabase
  - Edição célula a célula (Enter para salvar, Esc para cancelar)
  - Limpar apenas valores de geração
  - Salvar tudo de uma vez
  - Navegação integrada com página principal

#### 🗄️ Persistência de Dados (Supabase)
- **Tabelas**:
  - `observations`: Sistema de observações
  - `generation_data`: Dados de geração (PDP e realizado)
  - `generation_control`: Controles de set-point

- **Recursos**:
  - Row Level Security (RLS) configurado
  - Índices para performance
  - Políticas de acesso público
  - Triggers para updated_at automático
  - Unique constraints para evitar duplicatas

#### 📄 Impressão e Exportação
- **Modo de Impressão**:
  - Layout otimizado para PDF
  - Ocultação de botões e controles
  - Preservação de cores e gráficos
  - Quebras de página apropriadas
  - Linha do tempo incluída

- **Exportação Excel**:
  - Dados de geração
  - Controles de geração
  - Observações
  - Formato compatível com reimportação

#### 📅 Filtro por Data
- **Seletor de Data**:
  - Navegação entre dias
  - Sincronização entre página principal e editor
  - Passagem de data via URL
  - Carregamento automático de dados

### 🎨 Interface e UX

- **Design Responsivo**:
  - Layout adaptativo mobile/tablet/desktop
  - Fontes e espaçamentos ajustados por tela
  - Linha do tempo otimizada para mobile

- **Cores e Tema**:
  - Gradientes modernos nos KPIs
  - Código de cores consistente
  - Badges coloridos por responsável
  - Heatmap com escala visual clara

- **Interatividade**:
  - Tooltips informativos
  - Hover effects em gráficos
  - Modais para entrada de dados
  - Confirmações para ações destrutivas

### 🛠️ Tecnologias

- **Frontend**:
  - HTML5, CSS3, JavaScript (Vanilla)
  - Chart.js 4.4.0 para gráficos
  - SheetJS (xlsx 0.18.5) para Excel
  - Supabase JS Client 2.x

- **Backend**:
  - Supabase (PostgreSQL)
  - Edge Functions (futuro)

- **Deploy**:
  - Vercel (recomendado)
  - GitHub Pages (alternativa)

### 📚 Documentação

Documentação completa criada em `docs/`:

#### Configuração
- `SUPABASE-SETUP.md` - Setup completo do banco
- `QUICKSTART-SUPABASE.md` - Início rápido
- `GENERATION-CONTROL-SETUP.md` - Setup da tabela de controles
- `DEPLOY.md` - Deploy na Vercel

#### Funcionalidades
- `CONTROLE-GERACAO-MANUAL.md` - Manual do usuário
- `INSTALACAO-CONTROLE-GERACAO.md` - Guia de instalação
- `LINHA-TEMPO-GERACAO.md` - Documentação da linha do tempo

#### Desenvolvimento
- `CONTRIBUTING.md` - Guia para contribuidores
- `README-FULL.md` - Documentação completa do projeto
- `SCREENSHOTS.md` - Galeria de imagens

#### Planos Futuros
- `PLANOS-FUTUROS-INTEGRACAO.md` - Roadmap de integração
- `INDEX.md` - Índice geral da documentação
- `sql/` - Scripts SQL prontos para implementação futura
  - `01-create-view-generation-with-control.sql`
  - `02-create-function-analyze-effectiveness.sql`
  - `03-test-queries.sql`
  - `README.md`

#### Exemplos
- `exemplos-controle-geracao.sql` - 10 registros de exemplo
- `exemplos-controle-geracao.csv` - Versão CSV

### 🔧 Configuração

```json
{
  "name": "opcontrol",
  "version": "0.1.0",
  "description": "Sistema de monitoramento e controle de geração - UHE Teles Pires"
}
```

### 📦 Estrutura do Projeto

```
opcontrol/
├── index.html              # Página principal
├── pages/
│   ├── editor.html        # Editor de dados
│   └── generate-excel.html
├── css/
│   └── styles.css         # Estilos principais
├── js/
│   ├── script.js          # Lógica principal
│   ├── editor.js          # Lógica do editor
│   ├── generation-control.js  # Controle de geração
│   ├── generate-excel.js
│   └── supabase-config.js
├── docs/                  # Documentação completa
├── package.json           # Configuração do projeto
└── CHANGELOG.md          # Este arquivo
```

### 🎯 Métricas da Versão

- **14 documentos** de referência
- **3 scripts SQL** prontos
- **~145 páginas** de documentação
- **3 tabelas** no Supabase
- **5 arquivos JavaScript** principais
- **1 arquivo CSS** (~1200 linhas)
- **48 linhas** de dados por dia (00:30 - 23:59)

### 🚀 Como Usar

1. **Configurar Supabase**:
   ```bash
   # Ver: docs/QUICKSTART-SUPABASE.md
   ```

2. **Deploy na Vercel**:
   ```bash
   # Ver: docs/DEPLOY.md
   ```

3. **Usar o Sistema**:
   - Selecionar data no cabeçalho
   - Editar dados via botão "Editar Dados"
   - Adicionar controles de geração
   - Visualizar gráficos e KPIs
   - Adicionar observações clicando no gráfico
   - Imprimir relatório

### 🐛 Correções Conhecidas

Nenhum bug crítico conhecido nesta versão.

### 🔮 Próximas Versões

Planejado para versões futuras (ver `docs/PLANOS-FUTUROS-INTEGRACAO.md`):

- **v0.2**: Integração entre controles e dados realizados
- **v0.3**: Dashboard de análise de efetividade
- **v0.4**: Visualização de marcadores no gráfico principal
- **v0.5**: Otimizações de performance

### 🙏 Agradecimentos

Sistema desenvolvido para UHE Teles Pires com assistência de Claude Code.

---

## Links Úteis

- **Repositório**: https://github.com/geankleber/opcontrol
- **Documentação**: [docs/INDEX.md](docs/INDEX.md)
- **Issues**: https://github.com/geankleber/opcontrol/issues

---

**Data de Release**: 2025-11-12
**Commits**: 48bd632...9b82b71
**Status**: ✅ Estável
