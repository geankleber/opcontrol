# Linha do Tempo - Controle de Geração

## Visão Geral

A **Linha do Tempo** é uma visualização gráfica que mostra todos os registros de controle de geração ao longo do dia (00:00 - 24:00), similar a um gráfico de Gantt horizontal.

## Características

### 📊 Visualização

- **Linha Horizontal**: Representa as 24 horas do dia
- **Início**: 00:00 (lado esquerdo)
- **Conclusão**: 24:00 (lado direito)
- **Gradiente Laranja**: Linha principal com degradê de cor

### 🎯 Eventos (Pontos de Controle)

Cada registro de controle aparece como um evento na linha do tempo:

```
┌─────────────────────────────────────────────────────────┐
│        Linha do Tempo - Controle de Geração            │
├─────────────────────────────────────────────────────────┤
│ Início                                       Conclusão  │
│   ▼                                                ▼    │
│   ●──────●────────────●──────●────────●──────────●     │
│ 00:00  06:30       10:45  12:00    16:00      24:00   │
│                                                         │
│  ONS   Axia        ONS   Axia      ONS                 │
│ 1850MW 1820MW     1900MW 1650MW   1875MW               │
└─────────────────────────────────────────────────────────┘
```

### 📍 Elementos de Cada Evento

1. **Responsável** (acima do horário)
   - ONS ou Axia Energia

2. **Horário** (HH:MM)
   - Hora da modificação

3. **Seta para baixo** (▼)
   - Indicador visual

4. **Ponto circular** (●)
   - Marcador na linha
   - Cor: branco com borda laranja
   - Hover: fica laranja

5. **Set-point** (abaixo da linha)
   - Valor em MW (sem decimais)
   - Cor laranja

6. **Tooltip** (ao passar o mouse)
   - Mostra o detalhe da solicitação (se houver)

## Posicionamento

Os eventos são posicionados proporcionalmente ao horário:

- **00:00** = 0% (extrema esquerda)
- **12:00** = 50% (centro)
- **24:00** = 100% (extrema direita)

### Fórmula de Cálculo:
```javascript
posição (%) = (hora_em_minutos / 1440) × 100
```

Onde `1440 = 24h × 60min`

## Interatividade

### 🖱️ Hover (Passar o Mouse)

- **Ponto**: Aumenta de tamanho e muda de cor
- **Evento completo**: Escala aumenta ligeiramente
- **Tooltip**: Aparece com o detalhamento (se houver)

### 📱 Responsividade

Em telas pequenas (mobile):
- Fontes reduzidas
- Espaçamento ajustado
- Mantém proporção horizontal

## Casos de Uso

### Exemplo 1: Dia Normal de Operação
```
00:30 → Axia (1790 MW) - Carga base
06:30 → ONS (1850 MW) - Aumento matinal
12:00 → Axia (1650 MW) - Redução para manutenção
14:30 → Axia (1790 MW) - Retorno ao normal
17:30 → ONS (1920 MW) - Horário de ponta
```

### Exemplo 2: Emergência no Sistema
```
10:00 → ONS (1900 MW) - Emergência: outra usina offline
10:15 → ONS (1950 MW) - Aumento adicional solicitado
14:00 → ONS (1790 MW) - Normalização do sistema
```

## Cores e Estilo

### Linha Principal
- **Cor**: Gradiente laranja (#ff6b35 → #f7931e → #ff6b35)
- **Altura**: 4px
- **Sombra**: Sim (leve)

### Pontos de Evento
- **Normal**: Branco com borda laranja
- **Hover**: Laranja sólido
- **Tamanho**: 16px (diâmetro)

### Texto
- **Responsável**: Cinza escuro (#666)
- **Horário**: Preto (#2c3e50)
- **Set-point**: Laranja (#ff6b35)

## Atualização Automática

A linha do tempo é atualizada automaticamente quando:
- ✅ Novo controle é adicionado
- ✅ Controle existente é editado
- ✅ Controle é deletado
- ✅ Data do relatório é alterada
- ✅ Dados são importados de Excel

## Impressão

Na impressão:
- ✅ Cores preservadas (print-color-adjust)
- ✅ Tooltips ocultados
- ✅ Layout mantido
- ✅ Evita quebra de página no meio

## Estado Vazio

Quando não há registros:
```
┌────────────────────────────────────────────┐
│                                            │
│  Nenhum controle de geração registrado.   │
│  Adicione registros para visualizar a     │
│  linha do tempo.                           │
│                                            │
└────────────────────────────────────────────┘
```

## Vantagens da Visualização

1. **Visual**: Fácil de entender o fluxo do dia
2. **Temporal**: Mostra distribuição ao longo de 24h
3. **Comparativo**: Identifica padrões e desvios
4. **Interativo**: Hover mostra detalhes adicionais
5. **Profissional**: Design moderno e limpo

## Integração com Outras Funcionalidades

- **Lista de Controles**: Abaixo da linha do tempo
- **Adicionar Controle**: Atualiza linha do tempo automaticamente
- **Filtro por Data**: Mostra apenas controles da data selecionada
- **Exportar**: Linha do tempo incluída na impressão

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Gradientes, transições, flexbox
- **JavaScript**: Cálculo de posições e renderização dinâmica
- **Position Absolute**: Posicionamento preciso dos eventos

## Limitações

- Máximo de ~20-30 eventos visíveis confortavelmente
- Em dias com muitos registros próximos, pode haver sobreposição de labels
- Mobile: Eventos muito próximos podem ser difíceis de clicar

## Melhorias Futuras (Sugestões)

- [ ] Zoom interativo
- [ ] Filtro por responsável (mostrar só ONS ou só Axia)
- [ ] Legenda de cores
- [ ] Clique no evento para editar
- [ ] Agrupamento automático de eventos próximos
- [ ] Exportar linha do tempo como imagem

---

**Última atualização:** 2025-11-12
