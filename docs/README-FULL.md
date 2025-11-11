# 🏭 UHE Teles Pires - Monitor de Geração

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Sistema web completo para monitoramento e análise do desempenho da geração de energia da **Usina Hidrelétrica Teles Pires**.

[Características](#-características) •
[Demo](#-demo) •
[Instalação](#-instalação) •
[Uso](#-uso) •
[Documentação](#-documentação)

</div>

---

## Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Características](#-características)
- [Demo](#-demo)
- [Screenshots](#-screenshots)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Formato dos Arquivos Excel](#-formato-dos-arquivos-excel)
- [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
- [Deployment](#-deployment)
- [Personalização](#-personalização)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

---

## Sobre o Projeto

O **Monitor de Geração UHE Teles Pires** é uma aplicação web moderna desenvolvida para o Centro de Operação Integrada - Gestão Técnica (COI-GT) da Usina Hidrelétrica Teles Pires.

### Objetivo

Fornecer uma interface intuitiva e visual para:
- Monitorar o desempenho da geração de energia em tempo real
- Comparar geração real vs programada (PDP)
- Identificar desvios e anomalias rapidamente
- Documentar eventos e observações importantes
- Gerar relatórios impressos profissionais

### Por que este projeto?

-  **Interface Moderna**: Design limpo e profissional
-  **Sem Servidor**: Roda 100% no navegador
-  **Portabilidade**: Funciona offline, sem internet
-  **Zero Instalação**: Sem backend ou banco de dados
-  **Excel Nativo**: Import/export direto de planilhas
-  **Responsivo**: Funciona em desktop, tablet e mobile

---

## Características

### Análise de Dados
- **KPIs em Tempo Real**: Desvio médio, pico de geração e eficiência
- **Gráfico Interativo**: Visualização comparativa com Chart.js
- **Heatmap de Desvios**: Identificação rápida de períodos críticos
- **Análise por Período**: Estatísticas de madrugada, manhã, tarde e noite

### Sistema de Observações
- Registro de eventos com contexto completo
- Edição e remoção de observações
- Export/import via Excel
- Timestamp automático
- ** Persistência com Supabase**: Observações salvas permanentemente (opcional)
- Organização por data
- Sincronização automática

### Relatórios
- Impressão otimizada com cores preservadas
- Layout profissional automático
- Geração instantânea (window.print)

### Gestão de Dados
- Upload de arquivos Excel (.xlsx, .xls)
- Download de templates
- Validação automática de dados
- Dados de exemplo inclusos

---

## 🎬 Demo

### Acesso Rápido

1. Clone o repositório
2. Abra `index.html` no navegador
3. Explore os dados de exemplo pré-carregados

```bash
git clone [seu-repositorio]
cd opcontrol
open index.html  # macOS
# ou
start index.html  # Windows
# ou
xdg-open index.html  # Linux
```

---

## 📸 Screenshots

### Interface Principal
![Interface Principal](docs/screenshots/main-interface.png)
*Dashboard completo com KPIs, gráfico e heatmap*

### KPIs e Métricas
![KPIs](docs/screenshots/kpis.png)
*Cards coloridos com gradientes vibrantes mostrando métricas principais*

### Gráfico Interativo
![Gráfico](docs/screenshots/chart.png)
*Comparação visual entre geração real (azul) e programada (verde)*

### Heatmap de Desvios
![Heatmap](docs/screenshots/heatmap.png)
*Grid colorido: Verde (OK), Amarelo (Atenção), Vermelho (Crítico)*

### Sistema de Observações
![Observações](docs/screenshots/observations.png)
*Lista de eventos com edição e remoção*

### Modal de Observação
![Modal](docs/screenshots/modal.png)
*Interface para adicionar/editar observações*

### Relatório Impresso
![Impressão](docs/screenshots/print.png)
*Layout otimizado para impressão com cores preservadas*

> ** Como gerar screenshots:**
> ```bash
> # 1. Abra index.html no navegador
> # 2. Pressione F12 e ajuste para resolução desejada
> # 3. Capture com ferramenta de screenshot
> # 4. Salve em docs/screenshots/
> ```

---

## 🛠 Tecnologias

### Frontend
- **HTML5** - Estrutura semântica moderna
- **CSS3** - Gradientes, animações e grid layout
- **JavaScript ES6+** - Vanilla JS (sem frameworks)

### Bibliotecas Externas (via CDN)
- **[Chart.js 4.4.0](https://www.chartjs.org/)** - Gráficos interativos
- **[SheetJS 0.18.5](https://sheetjs.com/)** - Manipulação de Excel

### Ferramentas de Desenvolvimento
- **Node.js** (opcional) - Para gerador de Excel CLI
- **npm** (opcional) - Gerenciador de pacotes

### Navegadores Suportados
-  Chrome 90+
-  Firefox 88+
-  Safari 14+
-  Edge 90+

---

## Instalação

### Opção 1: Uso Direto (Recomendado)

**Sem instalação necessária!** Todas as bibliotecas são carregadas via CDN.

```bash
# Clone o repositório
git clone [seu-repositorio]
cd opcontrol

# Abra no navegador
open index.html
```

### Opção 2: Com Servidor Local

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx http-server -p 8000

# Acesse: http://localhost:8000
```

### Requisitos Mínimos

-  Navegador moderno (Chrome, Firefox, Edge, Safari)
-  JavaScript habilitado
-  Conexão com internet (para CDN) ou bibliotecas locais

### Arquivos Excel Inclusos

O projeto já inclui arquivos de exemplo prontos:

- **data.xlsx** - 48 linhas de dados (00:00-23:30)
- **observacoes.xlsx** - 1 observação de exemplo

### Persistência de Observações (Opcional)

Para salvar observações permanentemente com Supabase:

**Início Rápido (5 minutos):**
```bash
# 1. Copie o template de configuração
cp supabase-config.template.js supabase-config.js

# 2. Configure suas credenciais do Supabase
# Edite supabase-config.js com URL e key do projeto

# 3. Pronto! As observações serão salvas automaticamente
```

**Documentação completa:**
- 📖 [Guia Rápido](QUICKSTART-SUPABASE.md) - 5 minutos
- 📖 [Setup Completo](SUPABASE-SETUP.md) - Detalhado

**Funciona sem Supabase?**
 Sim! A aplicação funciona perfeitamente sem configuração.
- Observações ficam apenas na memória (perdidas ao recarregar)
- Use export/import Excel como backup

---

## 📖 Como Usar

### 1⃣ Inicialização

Ao abrir `index.html`, o sistema carrega automaticamente:
- 48 pontos de medição (intervalos de 30 minutos)
- PDP fixo de 1790 MW
- Geração com variação realista
- Evento de queda às 12:00 (993 MW)
- 1 observação pré-registrada

### 2⃣ Carregar Seus Dados

#### Via Upload de Excel

```
1. Prepare seu arquivo Excel com colunas: hora, pdp, geracao
2. Clique em " Carregar data.xlsx"
3. Selecione seu arquivo
4. Aguarde processamento
5. Todas as visualizações serão atualizadas automaticamente
```

#### Formato do Arquivo

| hora  | pdp  | geracao |
|-------|------|---------|
| 00:00 | 1790 | 1785    |
| 00:30 | 1790 | 1792    |
| ...   | ...  | ...     |

### 3⃣ Adicionar Observações

#### Método A: Clicando no Gráfico
```
1. Clique em qualquer ponto do gráfico principal
2. Modal abre com dados pré-preenchidos
3. Digite sua observação
4. Clique em "Salvar"
```

#### Método B: Clicando no Heatmap
```
1. Clique em qualquer célula do heatmap
2. Modal abre com dados do horário selecionado
3. Digite sua observação
4. Clique em "Salvar"
```

### 4⃣ Gerenciar Observações

- **Editar**: Clique no ícone 
- **Remover**: Clique no ícone 
- **Exportar**: Botão "⬇ Download Observações"
- **Importar**: Botão " Carregar Observações"

### 5⃣ Gerar Relatório

```
1. Clique em " Imprimir Relatório"
2. Configure impressora/PDF
3. Verifique preview (cores preservadas)
4. Imprima ou salve como PDF
```

### 6⃣ Download de Template

```
1. Clique em "⬇ Download data.xlsx"
2. Arquivo com dados atuais será baixado
3. Use como template para novos dados
```

---

## Estrutura do Projeto

```
opcontrol/
│
├──  index.html                 # Aplicação principal
├── 🎨 styles.css                 # Estilos e design
├──   script.js                  # Lógica JavaScript
├── 📖 README.md                  # Este arquivo
│
├──  Arquivos Excel
│   ├── data.xlsx                 # Dados de exemplo (48 linhas)
│   └── observacoes.xlsx          # Observações de exemplo
│
├── 🛠 Ferramentas
│   ├── generate-excel.html       # Gerador visual (navegador)
│   └── generate-excel.js         # Gerador CLI (Node.js)
│
├──  Dependências (opcional)
│   ├── package.json              # Configuração npm
│   ├── package-lock.json         # Lock de dependências
│   └── node_modules/             # Módulos Node.js
│       └── xlsx/                 # Biblioteca SheetJS
│
└── 📸 Documentação (criar)
    └── screenshots/              # Imagens para README
        ├── main-interface.png
        ├── kpis.png
        ├── chart.png
        ├── heatmap.png
        ├── observations.png
        ├── modal.png
        └── print.png
```

### Descrição dos Arquivos Principais

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `index.html` | ~180 | Estrutura HTML, modais e layout |
| `styles.css` | ~550 | Estilos, gradientes, responsividade e impressão |
| `script.js` | ~460 | Lógica, cálculos, gráficos e manipulação Excel |

---

## Formato dos Arquivos Excel

### data.xlsx - Dados de Geração

#### Estrutura

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `hora` | String |  | Horário no formato HH:MM (ex: 12:00) |
| `pdp` | Número |  | Potência Disponível Programada em MW |
| `geracao` | Número |  | Geração Real em MW |

#### Exemplo

```excel
hora    pdp     geracao
00:00   1790    1785
00:30   1790    1792
01:00   1790    1788
...     ...     ...
23:30   1790    1786
```

#### Regras de Validação

-  Horário válido (00:00 a 23:59)
-  Valores numéricos positivos
-  Separador decimal: ponto (.) ou vírgula (,)
-  Aceita variações de nome: `Hora`, `HORA`, `hora`
-  Mínimo: 1 registro
-  Recomendado: 48 registros (intervalos de 30 min)

#### Download do Template

```javascript
// Via interface: Botão "⬇ Download data.xlsx"
// Via código:
const dados = [
    { hora: '00:00', pdp: 1790, geracao: 1785 },
    // ... seus dados
];
```

---

### observacoes.xlsx - Observações

#### Estrutura

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `hora` | String |  | Horário do evento (HH:MM) |
| `geracao` | Número |  | Valor de geração em MW |
| `pdp` | Número |  | Valor de PDP em MW |
| `desvio` | Número |  | Diferença (geracao - pdp) |
| `texto` | String |  | Descrição da observação |
| `timestamp` | String |  | ISO 8601 (2024-01-15T12:00:00.000Z) |

#### Exemplo

```excel
hora    geracao  pdp   desvio  texto                                    timestamp
12:00   993      1790  -797    Queda significativa de geração...        2024-01-15T12:00:00.000Z
14:30   1785     1790  -5      Retorno à normalidade                    2024-01-15T14:30:00.000Z
```

#### Formato de Timestamp

```javascript
// ISO 8601
"2024-01-15T12:00:00.000Z"

// Gerado automaticamente no JavaScript
new Date().toISOString()
```

---

### Gerando Arquivos Excel de Exemplo

#### Método 1: Via Navegador (Sem instalação)

```bash
open generate-excel.html
```

Interface visual com botões:
- 📥 Gerar data.xlsx
- 📥 Gerar observacoes.xlsx
- 📥 Gerar Ambos

#### Método 2: Via Node.js

```bash
# Primeira vez: instalar dependência
npm install xlsx

# Executar gerador
node generate-excel.js
```

Output:
```
🏭 UHE Teles Pires - Gerador de Arquivos Excel

 Gerando data.xlsx...
 data.xlsx criado com sucesso! (48 linhas)
 Gerando observacoes.xlsx...
 observacoes.xlsx criado com sucesso! (1 observação)

 Todos os arquivos foram gerados com sucesso!
```

---

## Funcionalidades Detalhadas

### 1. KPIs (Indicadores-chave de Performance)

#### Desvio Médio
```javascript
// Cálculo
const desvios = dados.map(d => Math.abs(d.geracao - d.pdp));
const media = desvios.reduce((a, b) => a + b) / desvios.length;
```
- **Cor**: Gradiente roxo (#667eea → #764ba2)
- **Unidade**: MW
- **Significado**: Diferença média entre real e programado

#### Pico de Geração
```javascript
// Cálculo
const pico = dados.reduce((max, d) =>
    d.geracao > max.geracao ? d : max
);
```
- **Cor**: Gradiente rosa/vermelho (#f093fb → #f5576c)
- **Unidade**: MW + horário
- **Significado**: Maior valor de geração do período

#### ✓ Eficiência
```javascript
// Cálculo
const dentroFaixa = dados.filter(d =>
    Math.abs(d.geracao - d.pdp) <= 50
).length;
const eficiencia = (dentroFaixa / dados.length) * 100;
```
- **Cor**: Gradiente azul (#4facfe → #00f2fe)
- **Unidade**: Percentual
- **Significado**: % de medições dentro de ±50MW do PDP

---

### 2. Gráfico Principal (Chart.js)

#### Características
- **Tipo**: Gráfico de linha dupla
- **Linha Azul**: Geração Real
- **Linha Verde**: PDP (Programado)
- **Interativo**: Clicável para observações
- **Tooltip**: Mostra desvio automaticamente

#### Configuração
```javascript
{
    type: 'line',
    options: {
        onClick: (event, elements) => {
            // Abre modal de observação
        },
        plugins: {
            tooltip: {
                callbacks: {
                    afterLabel: (context) => {
                        return `Desvio: ${desvio} MW`;
                    }
                }
            }
        }
    }
}
```

---

### 3. Heatmap de Desvios

#### Código de Cores

| Cor | Desvio | Significado |
|-----|--------|-------------|
|  Verde | ≤ 50 MW | Dentro do programado |
|  Amarelo | 51-200 MW | Desvio moderado - atenção |
| 🔴 Vermelho | > 200 MW | Desvio alto - crítico |

#### Lógica
```javascript
if (desvio <= 50) {
    cor = 'verde';      // OK
} else if (desvio <= 200) {
    cor = 'amarelo';    // Atenção
} else {
    cor = 'vermelho';   // Crítico
}
```

#### Layout
- **Grid**: 12 colunas
- **Células**: 48 (00:00 às 23:30)
- **Formato**: HH:MM + valor
- **Clicável**: Sim (abre modal)

---

### 4. Tabela Resumo Estatístico

#### Períodos

| Período | Horário | Descrição |
|---------|---------|-----------|
| Madrugada | 00h-06h | Carga baixa |
| Manhã | 06h-12h | Rampa de subida |
| Tarde | 12h-18h | Pico de carga |
| Noite | 18h-00h | Rampa de descida |

#### Métricas por Período
- Geração Média (MW)
- PDP Médio (MW)
- Desvio Médio (MW)

---

### 5. Sistema de Observações

#### Informações Armazenadas
```javascript
{
    hora: "12:00",
    geracao: 993,
    pdp: 1790,
    desvio: -797,
    texto: "Descrição do evento...",
    timestamp: "2024-01-15T12:00:00.000Z"
}
```

#### Operações
- ➕ **Adicionar**: Via gráfico ou heatmap
-  **Editar**: Modifica observação existente
-  **Remover**: Deleta com confirmação
- 📥 **Importar**: Carrega de Excel
- 📤 **Exportar**: Salva em Excel

---

## Deployment

### Opção 1: GitHub Pages (Grátis)

```bash
# 1. Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/opcontrol.git
git push -u origin main

# 2. Configurar GitHub Pages
# Settings → Pages → Source: main branch → Save

# 3. Acessar
# https://seu-usuario.github.io/opcontrol/
```

### Opção 2: Netlify (Grátis)

```bash
# 1. Criar conta em netlify.com
# 2. Arrastar pasta para Netlify Drop
# 3. Ou via CLI:

npm install -g netlify-cli
netlify deploy --prod
```

### Opção 3: Vercel (Grátis)

```bash
npm install -g vercel
vercel --prod
```

### Opção 4: Servidor Próprio

#### Apache
```apache
# .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/opcontrol;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Opção 5: Docker

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t opcontrol .
docker run -d -p 8080:80 opcontrol
```

---

## 🎨 Personalização

### Modificar Cores dos KPIs

```css
/* styles.css */

/* KPI Roxo → Azul */
.kpi-purple::before,
.kpi-purple .kpi-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
```

### Ajustar Limiares do Heatmap

```javascript
// script.js - função renderHeatmap()

if (desvio <= 30) {          // Verde (era 50)
    cell.classList.add('green');
} else if (desvio <= 100) {  // Amarelo (era 200)
    cell.classList.add('yellow');
} else {
    cell.classList.add('red');
}
```

### Alterar Dados Padrão

```javascript
// script.js - variável defaultData

const defaultData = [
    { hora: '00:00', pdp: 2000, geracao: 1985 },  // Novo PDP
    // ... seus dados
];
```

### Adicionar Novo KPI

```javascript
// 1. Adicionar HTML (index.html)
<div class="kpi-card kpi-orange">
    <div class="kpi-icon">🔥</div>
    <div class="kpi-content">
        <div class="kpi-label">Novo KPI</div>
        <div class="kpi-value" id="novoKpi">--</div>
    </div>
</div>

// 2. Adicionar CSS (styles.css)
.kpi-orange::before,
.kpi-orange .kpi-icon {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

// 3. Adicionar cálculo (script.js)
function calculateAnalytics() {
    // ... código existente

    const novoValor = // seu cálculo
    document.getElementById('novoKpi').textContent = novoValor;
}
```

---

## 🐛 Troubleshooting

### Problema: Gráfico não aparece

**Sintomas**: Espaço em branco onde deveria estar o gráfico

**Soluções**:
```bash
# 1. Verificar console do navegador (F12)
# 2. Verificar se Chart.js foi carregado
console.log(typeof Chart); // deve retornar "function"

# 3. Verificar conexão com CDN
# 4. Usar biblioteca local se necessário
```

**Alternativa**: Baixar Chart.js local
```html
<!-- Substituir no index.html -->
<script src="./libs/chart.min.js"></script>
```

### Problema: Upload de Excel não funciona

**Sintomas**: Erro ao carregar arquivo

**Soluções**:
```javascript
// 1. Verificar extensão do arquivo
Aceito: .xlsx, .xls

// 2. Verificar nomes das colunas
Correto: hora, pdp, geracao
Aceito: Hora, PDP, Geração (case insensitive)

// 3. Verificar formato dos dados
Hora: texto "HH:MM"
PDP: número
Geração: número

// 4. Verificar console
F12 → Console → Ver erro detalhado
```

### Problema: Cores não aparecem na impressão

**Sintomas**: Relatório impresso sem cores

**Soluções**:
```
1. Usar Chrome ou Edge (melhor suporte)
2. Configurações de impressão:
    Gráficos de fundo: Ativado
    Cores: Ativado
3. Salvar como PDF primeiro
4. Verificar configuração da impressora
```

### Problema: Dados não atualizam

**Sintomas**: Upload funciona mas visualizações não mudam

**Soluções**:
```javascript
// 1. Limpar cache do navegador
Ctrl+Shift+Delete

// 2. Forçar reload
Ctrl+F5 (Windows)
Cmd+Shift+R (Mac)

// 3. Verificar console
Procurar por erros JavaScript
```

### Problema: Modal não abre

**Sintomas**: Clique não abre janela de observação

**Soluções**:
```javascript
// 1. Verificar se há bloqueador de popup
// 2. Verificar console (F12)
// 3. Testar em modo anônimo
// 4. Verificar z-index do modal (deve ser 1000)
```

---

## 🗺 Roadmap

### Versão 1.1 (Próximo Release)
- [ ] Modo escuro (dark mode)
- [ ] Exportar gráfico como imagem PNG
- [ ] Filtro de data/período
- [ ] Comparação entre dias
- [ ] PWA (Progressive Web App)

### Versão 1.2
- [ ] Backend opcional (Node.js + MongoDB)
- [ ] Autenticação de usuários
- [ ] Histórico de versões de dados
- [ ] API REST para integração
- [ ] Dashboard multi-usina

### Versão 2.0
- [ ] Previsão com Machine Learning
- [ ] Alertas automáticos
- [ ] Integração com SCADA
- [ ] App mobile nativo
- [ ] Exportar para PDF customizado

### Ideias Futuras
- [ ] Relatórios agendados
- [ ] Notificações push
- [ ] Análise de tendências
- [ ] Benchmark entre usinas
- [ ] IA para sugestões de otimização

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

### 1. Fork o Projeto
```bash
# Clique em "Fork" no GitHub
```

### 2. Crie uma Branch
```bash
git checkout -b feature/MinhaFuncionalidade
```

### 3. Commit suas Mudanças
```bash
git commit -m "Add: Nova funcionalidade X"
```

### 4. Push para o Branch
```bash
git push origin feature/MinhaFuncionalidade
```

### 5. Abra um Pull Request

### Diretrizes

-  Código limpo e comentado
-  Seguir padrão ES6+
-  Testar em múltiplos navegadores
-  Atualizar documentação
-  Adicionar screenshots se UI

---

## Licença

Este projeto está sob a licença **MIT**.

```
MIT License

Copyright (c) 2024 UHE Teles Pires

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contato

### Equipe de Desenvolvimento
- **Email**: coi-gt@uhetelespires.com.br
- **GitHub**: [github.com/seu-usuario](https://github.com/seu-usuario)

### Suporte
- 📧 **Email**: suporte@uhetelespires.com.br
- 📞 **Telefone**: (00) 0000-0000
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/opcontrol/issues)

### Links Úteis
- 📖 [Documentação Completa](https://docs.uhetelespires.com.br)
- 🎓 [Tutorial em Vídeo](https://youtube.com/...)
- 💬 [Discussões](https://github.com/seu-usuario/opcontrol/discussions)

---

## 🙏 Agradecimentos

- [Chart.js](https://www.chartjs.org/) - Biblioteca de gráficos
- [SheetJS](https://sheetjs.com/) - Manipulação de Excel
- [Shields.io](https://shields.io/) - Badges do README
- Equipe COI-GT da UHE Teles Pires

---

<div align="center">

**[⬆ Voltar ao topo](#-uhe-teles-pires---monitor-de-geração)**

Feito com ❤ pela equipe **COI-GT UHE Teles Pires**

</div>
