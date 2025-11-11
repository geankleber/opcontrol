# 📸 Guia para Gerar Screenshots

Este guia ajuda você a criar screenshots profissionais para a documentação do projeto.

## Screenshots Necessários

1. **main-interface.png** - Interface principal completa
2. **kpis.png** - Seção de KPIs em destaque
3. **chart.png** - Gráfico interativo
4. **heatmap.png** - Grid de heatmap colorido
5. **observations.png** - Lista de observações
6. **modal.png** - Modal de adicionar observação
7. **print.png** - Preview de impressão

## 🛠 Ferramentas Recomendadas

### macOS
- **Comando Nativo**: `Cmd + Shift + 4` (área selecionada)
- **Ferramenta**: [CleanShot X](https://cleanshot.com/) (paga)
- **Alternativa**: [Monosnap](https://monosnap.com/) (grátis)

### Windows
- **Comando Nativo**: `Win + Shift + S` (Windows 10/11)
- **Ferramenta**: [ShareX](https://getsharex.com/) (grátis)
- **Alternativa**: [Greenshot](https://getgreenshot.org/) (grátis)

### Linux
- **Comando**: `gnome-screenshot -a` (área selecionada)
- **Ferramenta**: [Flameshot](https://flameshot.org/) (grátis)
- **KDE**: `Spectacle`

## 📐 Configurações Recomendadas

### Resolução do Navegador
```
Largura: 1400px (max-width do container)
Altura: Ajustar conforme necessário
Zoom: 100%
```

### DevTools Settings (F12)
```
1. Abrir DevTools (F12)
2. Clicar no ícone de dispositivo (Toggle Device Toolbar)
3. Definir largura: 1400px
4. Capturar screenshot
```

## Checklist de Captura

### 1. Interface Principal (main-interface.png)

**Preparação:**
- [ ] Abrir `index.html` no Chrome/Edge
- [ ] Aguardar carregamento completo dos dados
- [ ] Scroll até o topo da página
- [ ] Zoom 100%

**Captura:**
- [ ] Incluir desde o cabeçalho até o início das observações
- [ ] Garantir que KPIs, gráfico e heatmap estejam visíveis
- [ ] Resolução: 1400px de largura mínima

**Exemplo de comando DevTools:**
```javascript
// Console do navegador
document.querySelector('.container').style.maxWidth = '1400px';
```

---

### 2. KPIs (kpis.png)

**Preparação:**
- [ ] Scroll até a seção de KPIs
- [ ] Certificar que os 3 cards estão visíveis
- [ ] Verificar se os valores estão calculados

**Captura:**
- [ ] Focar apenas nos 3 cards KPI
- [ ] Incluir um pouco de espaço ao redor
- [ ] Garantir que gradientes estão visíveis

**Recorte sugerido:**
```
Elemento: .kpi-grid
Padding: 20px ao redor
```

---

### 3. Gráfico (chart.png)

**Preparação:**
- [ ] Scroll até o gráfico principal
- [ ] Aguardar renderização completa
- [ ] Verificar se ambas as linhas estão visíveis

**Captura:**
- [ ] Incluir título "Geração vs Programado"
- [ ] Mostrar gráfico completo
- [ ] Incluir legenda

**Elemento:**
```css
#mainChart (canvas)
+ título h2
```

---

### 4. Heatmap (heatmap.png)

**Preparação:**
- [ ] Scroll até o heatmap
- [ ] Verificar células coloridas (verde/amarelo/vermelho)
- [ ] Certificar que todas as 48 células estão visíveis

**Captura:**
- [ ] Incluir título e legenda
- [ ] Mostrar grid completo de 12 colunas
- [ ] Garantir cores vibrantes

**Elemento:**
```css
.card (heatmap) completo
```

---

### 5. Observações (observations.png)

**Preparação:**
- [ ] Scroll até seção de observações
- [ ] Garantir que há pelo menos 1 observação
- [ ] Verificar botões de editar/remover visíveis

**Captura:**
- [ ] Incluir cabeçalho com contador
- [ ] Mostrar pelo menos 1 observação completa
- [ ] Incluir botões de ação

---

### 6. Modal (modal.png)

**Preparação:**
- [ ] Clicar em um ponto do gráfico para abrir modal
- [ ] Preencher campo de observação com texto exemplo
- [ ] Certificar que modal está centralizado

**Captura:**
- [ ] Incluir overlay de fundo (escuro)
- [ ] Modal completo centralizado
- [ ] Mostrar todos os campos preenchidos

**Dica:**
```javascript
// Forçar abertura do modal via console
document.getElementById('obsModal').style.display = 'block';
```

---

### 7. Print Preview (print.png)

**Preparação:**
- [ ] Clicar em "Imprimir Relatório"
- [ ] Aguardar preview de impressão
- [ ] Verificar cores preservadas

**Captura:**
- [ ] Screenshot do preview de impressão
- [ ] Mostrar layout otimizado
- [ ] Incluir cores dos KPIs

**Comando:**
```
Chrome: Ctrl+P (Windows) ou Cmd+P (Mac)
Capturar a janela de preview
```

---

## 🎨 Pós-Processamento

### Redimensionamento
```bash
# Usando ImageMagick
convert input.png -resize 1400x output.png

# Usando sips (macOS)
sips -Z 1400 input.png --out output.png
```

### Otimização
```bash
# Reduzir tamanho do arquivo
pngquant input.png --output output.png
optipng -o7 output.png
```

### Renomear
```bash
# Padrão de nomes
main-interface.png
kpis.png
chart.png
heatmap.png
observations.png
modal.png
print.png
```

## Organização

```
docs/
└── screenshots/
    ├── main-interface.png
    ├── kpis.png
    ├── chart.png
    ├── heatmap.png
    ├── observations.png
    ├── modal.png
    └── print.png
```

## Checklist Final

Antes de fazer commit:

- [ ] Todos os 7 screenshots criados
- [ ] Nomes corretos (lowercase, hífen)
- [ ] Formato PNG
- [ ] Resolução mínima 1400px largura
- [ ] Cores preservadas
- [ ] Sem informações sensíveis
- [ ] Arquivos otimizados (<500KB cada)

## Comandos Rápidos

### Captura via DevTools

```javascript
// 1. Abrir DevTools (F12)
// 2. Console → Executar:

// Capturar elemento específico
const element = document.querySelector('.kpi-grid');
element.scrollIntoView({ behavior: 'smooth', block: 'center' });

// Capturar página inteira (Chrome)
// Ctrl+Shift+P → "Capture full size screenshot"
```

### Batch Rename (se necessário)

```bash
# Renomear múltiplos arquivos
mv Screenshot\ 1.png main-interface.png
mv Screenshot\ 2.png kpis.png
# ... etc
```

## Notas

- Prefira Chrome ou Edge para melhor renderização
- Desabilite extensões que possam alterar aparência
- Use modo anônimo para evitar cache
- Capture em monitor de alta resolução se possível
- Verifique zoom em 100%

## 🎓 Exemplos

### Screenshot Perfeito 
- Alta resolução
- Cores vibrantes
- Bem enquadrado
- Sem distrações
- Otimizado

### Screenshot Ruim 
- Baixa resolução
- Cores desbotadas
- Mal enquadrado
- Com elementos desnecessários
- Arquivo muito grande

---

**Dúvidas?** Consulte a [documentação principal](../README.md)
