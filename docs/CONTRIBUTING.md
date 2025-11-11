# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Monitor de Geração UHE Teles Pires**!

Este documento fornece diretrizes para contribuir com o projeto.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

---

## 📜 Código de Conduta

Este projeto adere a um Código de Conduta. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

### Nossas Promessas

-  Ser respeitoso com todos os contribuidores
-  Aceitar críticas construtivas
-  Focar no que é melhor para a comunidade
-  Mostrar empatia com outros membros

---

## Como Posso Contribuir?

### 🐛 Reportar Bugs

Encontrou um bug? Ajude-nos a melhorar:

1. Verifique se já não foi reportado nas [Issues](https://github.com/seu-usuario/opcontrol/issues)
2. Crie uma nova issue com o template de bug
3. Inclua:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (navegador, OS, versão)

### Sugerir Features

Tem uma ideia? Compartilhe:

1. Verifique se já não foi sugerida
2. Crie uma issue com o template de feature
3. Descreva:
   - Problema que resolve
   - Solução proposta
   - Alternativas consideradas
   - Impacto nos usuários

### Melhorar Documentação

- Corrigir erros de digitação
- Adicionar exemplos
- Melhorar explicações
- Traduzir documentação

### 🎨 Melhorar Design/UX

- Sugerir melhorias visuais
- Otimizar responsividade
- Melhorar acessibilidade
- Adicionar animações

### 💻 Contribuir com Código

Veja [Processo de Desenvolvimento](#processo-de-desenvolvimento)

---

## Processo de Desenvolvimento

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Depois clone seu fork:

git clone https://github.com/SEU-USUARIO/opcontrol.git
cd opcontrol
```

### 2. Criar Branch

```bash
# Sempre crie uma branch a partir da main atualizada

git checkout main
git pull origin main
git checkout -b tipo/descricao-curta
```

**Tipos de branch:**
- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Documentação
- `style/` - Mudanças de estilo (CSS)
- `refactor/` - Refatoração
- `test/` - Testes
- `chore/` - Tarefas diversas

**Exemplos:**
```bash
git checkout -b feature/dark-mode
git checkout -b fix/chart-tooltip-bug
git checkout -b docs/update-readme
```

### 3. Fazer Alterações

- Escreva código limpo e comentado
- Siga os [Padrões de Código](#padrões-de-código)
- Teste em múltiplos navegadores
- Atualize documentação se necessário

### 4. Testar

```bash
# Abra no navegador e teste:
open index.html

# Teste em diferentes navegadores:
- Chrome
- Firefox
- Safari (macOS)
- Edge

# Teste responsividade:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)
```

### 5. Commit

```bash
git add .
git commit -m "tipo: descrição curta"
```

Veja [Commits](#commits) para padrões

### 6. Push

```bash
git push origin nome-da-sua-branch
```

### 7. Pull Request

1. Vá para seu fork no GitHub
2. Clique em "New Pull Request"
3. Preencha o template
4. Aguarde review

---

## 📏 Padrões de Código

### JavaScript (ES6+)

#### Nomenclatura

```javascript
// Variáveis e funções: camelCase
const currentData = [];
function calculateAnalytics() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_DEVIATION = 200;

// Classes: PascalCase
class ChartManager {}
```

#### Estrutura de Funções

```javascript
/**
 * Calcula KPIs baseado nos dados fornecidos
 * @param {Array} data - Array de objetos com hora, pdp, geracao
 * @returns {Object} Objeto com KPIs calculados
 */
function calculateAnalytics(data) {
    // Validação
    if (!data || data.length === 0) {
        console.warn('Nenhum dado fornecido');
        return null;
    }

    // Lógica
    const result = {
        desvioMedio: 0,
        picoGeracao: 0,
        eficiencia: 0
    };

    // ... cálculos

    return result;
}
```

#### Boas Práticas JS

```javascript
//  BOM
const filteredData = data.filter(d => d.geracao > 1000);
const average = values.reduce((a, b) => a + b) / values.length;

//  EVITAR
var x = [];  // Use const/let
for (var i = 0; i < data.length; i++) {}  // Use forEach, map, filter
```

### CSS

#### Nomenclatura BEM-like

```css
/* Bloco */
.kpi-card {}

/* Elemento */
.kpi-card__icon {}
.kpi-card__value {}

/* Modificador */
.kpi-card--purple {}
.kpi-card--large {}
```

#### Organização

```css
/* 1. Positioning */
.element {
    position: relative;
    top: 0;
    left: 0;
}

/* 2. Box Model */
.element {
    display: flex;
    width: 100%;
    padding: 20px;
    margin: 10px;
}

/* 3. Typography */
.element {
    font-size: 16px;
    line-height: 1.6;
    color: #333;
}

/* 4. Visual */
.element {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
}

/* 5. Misc */
.element {
    cursor: pointer;
    transition: all 0.3s;
}
```

#### Boas Práticas CSS

```css
/*  BOM */
.kpi-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: transform 0.3s ease;
}

/*  EVITAR */
.kpi-card {
    background: #667eea;  /* Usar gradientes quando possível */
    transition: all 0.3s;  /* Especificar propriedades */
}
```

### HTML

#### Semântica

```html
<!--  BOM -->
<header class="header">
    <h1>Título</h1>
</header>

<main class="container">
    <section class="kpis">
        <article class="kpi-card">
            <!-- ... -->
        </article>
    </section>
</main>

<!--  EVITAR -->
<div class="header">
    <div class="title">Título</div>
</div>
```

#### Acessibilidade

```html
<!-- Sempre incluir labels -->
<label for="obsTexto">Observação:</label>
<textarea id="obsTexto" aria-label="Campo de observação"></textarea>

<!-- Botões descritivos -->
<button aria-label="Fechar modal" title="Fechar">×</button>

<!-- Imagens com alt -->
<img src="logo.png" alt="Logo UHE Teles Pires">
```

---

## 💬 Commits

### Formato

```
tipo(escopo): descrição curta

Descrição detalhada (opcional)

Referências (opcional)
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, CSS
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas, build, etc

### Exemplos

```bash
# Simples
git commit -m "feat: adicionar modo escuro"

# Detalhado
git commit -m "fix: corrigir cálculo de desvio médio

O cálculo estava incluindo valores negativos sem abs().
Agora usa Math.abs() para desvio absoluto.

Fixes #42"

# Com escopo
git commit -m "style(kpis): ajustar gradientes dos cards"
git commit -m "docs(readme): adicionar seção de deployment"
```

### Boas Práticas

-  Usar presente do indicativo ("adiciona" não "adicionado")
-  Primeira letra minúscula
-  Sem ponto final
-  Máximo 50 caracteres no título
-  Corpo com máximo 72 caracteres por linha

---

## Pull Requests

### Template

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Sem console.log ou debugger
- [ ] Funciona em Chrome, Firefox, Safari
- [ ] Responsivo testado
- [ ] Screenshots adicionados (se UI)

## Screenshots (se aplicável)
Antes:
![antes](url)

Depois:
![depois](url)

## Issues Relacionadas
Fixes #123
Relates to #456
```

### Processo de Review

1. **Automático**: Verificações de CI/CD (se configurado)
2. **Manual**: Review de código por mantenedores
3. **Feedback**: Possíveis solicitações de mudanças
4. **Aprovação**: Merge quando aprovado

### Dicas para Aprovação Rápida

-  PRs pequenos e focados
-  Descrição clara
-  Screenshots de mudanças visuais
-  Código bem comentado
-  Testes realizados
-  Sem mudanças desnecessárias

---

## 🐛 Reportar Bugs

### Template de Issue

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer

**Comportamento Atual**
O que está acontecendo

**Screenshots**
Se aplicável, adicione screenshots

**Ambiente**
- Navegador: [ex: Chrome 120]
- OS: [ex: Windows 11]
- Versão: [ex: 1.0.0]

**Contexto Adicional**
Qualquer outra informação relevante
```

---

## Sugerir Features

### Template de Issue

```markdown
**Problema**
Descrição clara do problema que a feature resolve

**Solução Proposta**
Como você imagina a solução

**Alternativas Consideradas**
Outras abordagens que você pensou

**Benefícios**
- Benefício 1
- Benefício 2

**Impacto**
Usuários afetados: [todos / alguns / novos]
Complexidade: [baixa / média / alta]

**Mockups/Exemplos**
Links ou imagens de referência
```

---

## 🎨 Contribuindo com Design

### Diretrizes Visuais

**Cores Principais:**
- Roxo: `#667eea → #764ba2`
- Rosa: `#f093fb → #f5576c`
- Azul: `#4facfe → #00f2fe`
- Verde: `#a8e063 → #56ab2f`
- Amarelo: `#f7b733 → #fc4a1a`
- Vermelho: `#eb3349 → #f45c43`

**Tipografia:**
- Fonte: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
- Tamanhos: 0.75rem, 0.875rem, 1rem, 1.25rem, 1.5rem, 1.75rem

**Espaçamentos:**
- Base: 8px
- Pequeno: 10px
- Médio: 15px, 20px
- Grande: 30px, 40px

---

## ❓ Dúvidas?

- 📧 Email: coi-gt@uhetelespires.com.br
- 💬 [Discussions](https://github.com/seu-usuario/opcontrol/discussions)
- 🐛 [Issues](https://github.com/seu-usuario/opcontrol/issues)

---

## 🙏 Agradecimentos

Obrigado por contribuir! Cada contribuição, por menor que seja, é valiosa.

**Principais Contribuidores:**
- Veja [Contributors](https://github.com/seu-usuario/opcontrol/graphs/contributors)

---

<div align="center">

**[⬆ Voltar ao topo](#-guia-de-contribuição)**

Feito com ❤ pela comunidade

</div>
