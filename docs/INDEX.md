# 📚 Índice da Documentação - OpControl

Bem-vindo à documentação completa do sistema de monitoramento UHE Teles Pires.

---

## 🚀 Início Rápido

Para começar rapidamente, consulte estes documentos primeiro:

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| [QUICKSTART-SUPABASE.md](QUICKSTART-SUPABASE.md) | Configuração rápida do Supabase | 10 min |
| [README-FULL.md](README-FULL.md) | Documentação completa do projeto | 20 min |
| [DEPLOY.md](DEPLOY.md) | Como fazer deploy na Vercel | 15 min |

---

## 📖 Documentação por Categoria

### 🔧 Configuração e Instalação

#### Backend (Supabase)
- **[SUPABASE-SETUP.md](SUPABASE-SETUP.md)**
  - Configuração completa do banco de dados
  - Criação de tabelas (observations, generation_data, generation_control)
  - Configuração de RLS (Row Level Security)
  - Integração com a aplicação
  - Editor de dados de geração

- **[QUICKSTART-SUPABASE.md](QUICKSTART-SUPABASE.md)**
  - Versão resumida para início rápido
  - Passo a passo básico
  - Troubleshooting comum

#### Frontend (Deploy)
- **[DEPLOY.md](DEPLOY.md)**
  - Deploy na Vercel
  - Configuração de variáveis de ambiente
  - Domínio customizado
  - CI/CD

---

### 📊 Funcionalidades

#### Controle da Geração
- **[GENERATION-CONTROL-SETUP.md](GENERATION-CONTROL-SETUP.md)**
  - Script SQL para criar tabela `generation_control`
  - Estrutura de campos e índices
  - Políticas de segurança RLS
  - Comentários e documentação do schema

- **[CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md)**
  - Manual do usuário para o sistema de controles
  - Como adicionar, editar e deletar controles
  - Importação/exportação de Excel
  - Boas práticas de uso

- **[INSTALACAO-CONTROLE-GERACAO.md](INSTALACAO-CONTROLE-GERACAO.md)**
  - Guia de instalação técnica
  - Passos de integração com o sistema
  - Verificação de funcionamento
  - Troubleshooting

- **[LINHA-TEMPO-GERACAO.md](LINHA-TEMPO-GERACAO.md)**
  - Documentação da visualização temporal
  - Como funciona a linha do tempo (00:00-24:00)
  - Sistema de anti-sobreposição de rótulos
  - Cores e responsáveis (ONS vs Axia Energia)
  - Interatividade e tooltips
  - Impressão e exportação

---

### 🔮 Planos Futuros

#### Integração Avançada
- **[PLANOS-FUTUROS-INTEGRACAO.md](PLANOS-FUTUROS-INTEGRACAO.md)**
  - Plano completo de integração entre `generation_control` e `generation_data`
  - 5 opções de implementação detalhadas
  - Abordagem híbrida recomendada (3 fases)
  - Análise de efetividade de controles
  - Visualização integrada no gráfico
  - Dashboard de análise
  - Métricas de sucesso e KPIs
  - Checklist completo para implementação

#### Scripts SQL Prontos
- **[sql/README.md](sql/README.md)**
  - Guia de uso dos scripts SQL
  - Passo a passo de implementação
  - Exemplos práticos
  - Troubleshooting

- **[sql/01-create-view-generation-with-control.sql](sql/01-create-view-generation-with-control.sql)**
  - VIEW que relaciona dados de geração com controles vigentes
  - Relacionamento temporal automático
  - Cálculo de tempo desde mudança

- **[sql/02-create-function-analyze-effectiveness.sql](sql/02-create-function-analyze-effectiveness.sql)**
  - Função para análise de efetividade
  - Comparação antes/depois de mudanças
  - Métricas de performance
  - Tempo de estabilização

- **[sql/03-test-queries.sql](sql/03-test-queries.sql)**
  - 10 queries de teste prontas
  - Exemplos de análises úteis
  - Comparativos ONS vs Axia
  - KPIs e relatórios

---

### 💼 Desenvolvimento

- **[CONTRIBUTING.md](CONTRIBUTING.md)**
  - Guia para contribuidores
  - Padrões de código
  - Processo de pull request
  - Estrutura do projeto
  - Boas práticas

- **[SCREENSHOTS.md](SCREENSHOTS.md)**
  - Galeria de imagens do sistema
  - Capturas de tela das funcionalidades
  - Exemplos visuais

---

## 📋 Documentos por Arquivo

### Dados de Exemplo

Além da documentação, o projeto inclui dados de exemplo:

- **[exemplos-controle-geracao.sql](exemplos-controle-geracao.sql)**
  - 10 registros de exemplo para teste
  - Data: 09/11/2025
  - Cenários variados (ONS e Axia)
  - Pronto para inserir no Supabase

- **[exemplos-controle-geracao.csv](exemplos-controle-geracao.csv)**
  - Mesmos dados em formato CSV
  - Para importação via Excel

---

## 🗺️ Fluxo de Leitura Recomendado

### Para Novos Usuários
1. [README-FULL.md](README-FULL.md) - Entender o projeto
2. [QUICKSTART-SUPABASE.md](QUICKSTART-SUPABASE.md) - Configurar backend
3. [DEPLOY.md](DEPLOY.md) - Colocar no ar
4. [CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md) - Usar o sistema

### Para Desenvolvedores
1. [README-FULL.md](README-FULL.md) - Visão geral técnica
2. [SUPABASE-SETUP.md](SUPABASE-SETUP.md) - Estrutura do banco
3. [GENERATION-CONTROL-SETUP.md](GENERATION-CONTROL-SETUP.md) - Schema detalhado
4. [CONTRIBUTING.md](CONTRIBUTING.md) - Padrões de desenvolvimento
5. [PLANOS-FUTUROS-INTEGRACAO.md](PLANOS-FUTUROS-INTEGRACAO.md) - Roadmap

### Para Implementar Integrações Futuras
1. [PLANOS-FUTUROS-INTEGRACAO.md](PLANOS-FUTUROS-INTEGRACAO.md) - Ler o plano completo
2. [sql/README.md](sql/README.md) - Entender scripts SQL
3. [sql/01-create-view-generation-with-control.sql](sql/01-create-view-generation-with-control.sql) - Executar VIEW
4. [sql/02-create-function-analyze-effectiveness.sql](sql/02-create-function-analyze-effectiveness.sql) - Executar função
5. [sql/03-test-queries.sql](sql/03-test-queries.sql) - Testar com queries

### Para Administradores
1. [SUPABASE-SETUP.md](SUPABASE-SETUP.md) - Gerenciar banco
2. [DEPLOY.md](DEPLOY.md) - Gerenciar deploy
3. [CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md) - Treinar usuários

---

## 📊 Estatísticas da Documentação

| Categoria | Documentos | Páginas (aprox.) |
|-----------|------------|------------------|
| Configuração | 4 | 45 |
| Funcionalidades | 4 | 30 |
| Planos Futuros | 4 | 50 |
| Desenvolvimento | 2 | 20 |
| **TOTAL** | **14** | **~145** |

---

## 🔍 Busca Rápida

### Por Tópico

- **Supabase**: [SUPABASE-SETUP.md](SUPABASE-SETUP.md), [QUICKSTART-SUPABASE.md](QUICKSTART-SUPABASE.md), [GENERATION-CONTROL-SETUP.md](GENERATION-CONTROL-SETUP.md)
- **Deploy**: [DEPLOY.md](DEPLOY.md)
- **Controle de Geração**: [CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md), [INSTALACAO-CONTROLE-GERACAO.md](INSTALACAO-CONTROLE-GERACAO.md), [LINHA-TEMPO-GERACAO.md](LINHA-TEMPO-GERACAO.md)
- **SQL**: [sql/](sql/)
- **Integração**: [PLANOS-FUTUROS-INTEGRACAO.md](PLANOS-FUTUROS-INTEGRACAO.md)
- **Desenvolvimento**: [CONTRIBUTING.md](CONTRIBUTING.md)

### Por Tarefa

| Tarefa | Documento |
|--------|-----------|
| Configurar banco de dados | [QUICKSTART-SUPABASE.md](QUICKSTART-SUPABASE.md) |
| Fazer deploy | [DEPLOY.md](DEPLOY.md) |
| Adicionar controle de geração | [CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md) |
| Criar tabela no banco | [GENERATION-CONTROL-SETUP.md](GENERATION-CONTROL-SETUP.md) |
| Implementar integração futura | [PLANOS-FUTUROS-INTEGRACAO.md](PLANOS-FUTUROS-INTEGRACAO.md) |
| Contribuir com código | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Ver exemplos visuais | [SCREENSHOTS.md](SCREENSHOTS.md) |

---

## 🆕 Últimas Atualizações

| Data | Documento | Mudança |
|------|-----------|---------|
| 2025-11-12 | [PLANOS-FUTUROS-INTEGRACAO.md](PLANOS-FUTUROS-INTEGRACAO.md) | ✨ Criado - Plano completo de integração |
| 2025-11-12 | [sql/](sql/) | ✨ Criados - Scripts SQL prontos |
| 2025-11-12 | [LINHA-TEMPO-GERACAO.md](LINHA-TEMPO-GERACAO.md) | 🔄 Atualizado - Cores e legendas |
| 2025-11-12 | [GENERATION-CONTROL-SETUP.md](GENERATION-CONTROL-SETUP.md) | ✨ Criado - Setup da tabela |
| 2025-11-11 | [CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md) | ✨ Criado - Manual do usuário |

---

## 💡 Ajuda e Suporte

### Problemas Comuns

1. **Erro ao conectar no Supabase**
   - Ver: [QUICKSTART-SUPABASE.md](QUICKSTART-SUPABASE.md#troubleshooting)

2. **Deploy não funciona**
   - Ver: [DEPLOY.md](DEPLOY.md#troubleshooting)

3. **Controles não aparecem**
   - Ver: [CONTROLE-GERACAO-MANUAL.md](CONTROLE-GERACAO-MANUAL.md#troubleshooting)

### Onde Pedir Ajuda

- **Issues no GitHub**: Para bugs e problemas técnicos
- **Documentação**: Sempre consulte primeiro
- **Código**: Comentários inline explicam detalhes

---

## 📝 Contribuindo com a Documentação

Encontrou algo faltando ou incorreto?

1. Leia [CONTRIBUTING.md](CONTRIBUTING.md)
2. Crie um issue ou PR
3. Ajude a melhorar! 🎉

---

## 📜 Licença

Este projeto e sua documentação estão sob licença MIT.

---

**Última atualização:** 2025-11-12
**Documentos:** 14 arquivos principais + 3 scripts SQL
**Status:** Documentação completa e atualizada ✅
