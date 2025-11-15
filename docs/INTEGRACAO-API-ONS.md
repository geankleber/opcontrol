# 🔌 Integração com API do ONS - Importação Automática de PDP

Este documento descreve como configurar e usar a **Supabase Edge Function** para importar automaticamente os dados de **Programa Diário de Produção (PDP)** da API do ONS.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Adaptação da Edge Function](#adaptação-da-edge-function)
4. [Deploy da Edge Function](#deploy-da-edge-function)
5. [Como Usar](#como-usar)
6. [Agendamento Automático](#agendamento-automático)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

- [x] Conta no Supabase com projeto criado
- [x] Tabela `pdp_data` criada (script 04 da refatoração)
- [x] Dados migrados (script 05 da refatoração)
- [x] VIEW criada (script 06 da refatoração)
- [x] Supabase CLI instalado
- [x] Credenciais de acesso à API do ONS

### Instalar Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Ou via npm (qualquer SO)
npm install -g supabase
```

Verificar instalação:
```bash
supabase --version
```

---

## ⚙️ Configuração Inicial

### 1. Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### 2. Vincular ao seu projeto

```bash
cd /caminho/do/projeto/opcontrol
supabase link --project-ref [SEU_PROJECT_REF]
```

**Onde encontrar o PROJECT_REF:**
- Vá para o Supabase Dashboard
- Selecione seu projeto
- Em Settings > General > Reference ID

### 3. Configurar Variáveis de Ambiente (Secrets)

Execute os comandos abaixo substituindo pelos valores reais da API do ONS:

```bash
# URL base da API do ONS
supabase secrets set ONS_API_URL=https://api.ons.org.br

# Usuário de autenticação
supabase secrets set ONS_API_USERNAME=seu_usuario_ons

# Senha de autenticação
supabase secrets set ONS_API_PASSWORD=sua_senha_ons
```

**⚠️ IMPORTANTE:** Essas credenciais ficam armazenadas de forma segura no Supabase e **NUNCA** são expostas no código frontend.

Para verificar secrets configurados:
```bash
supabase secrets list
```

---

## 🔧 Adaptação da Edge Function

A Edge Function criada em `supabase/functions/import-pdp/index.ts` contém exemplos genéricos que **precisam ser adaptados** conforme a API real do ONS.

### O que adaptar:

#### 1. **Autenticação (função `authenticateONS`)**

Ajuste o endpoint e formato de autenticação:

```typescript
// ANTES (exemplo genérico)
const authResponse = await fetch(`${credentials.apiUrl}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: credentials.username,
    password: credentials.password,
  }),
})

// DEPOIS (ajustar conforme a API do ONS)
const authResponse = await fetch(`${credentials.apiUrl}/v1/authenticate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'valor_se_necessario',
  },
  body: JSON.stringify({
    user: credentials.username,
    pass: credentials.password,
    grant_type: 'password', // se necessário
  }),
})
```

#### 2. **Busca de Dados (função `fetchPDPFromONS`)**

Ajuste o endpoint e parâmetros:

```typescript
// ANTES (exemplo genérico)
const dataResponse = await fetch(
  `${credentials.apiUrl}/pdp?date=${date}&usina=UHE_TELES_PIRES`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
)

// DEPOIS (ajustar conforme a API do ONS)
const dataResponse = await fetch(
  `${credentials.apiUrl}/v2/geracao/programacao-diaria?data=${date}&usina=TELES_PIRES`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  }
)
```

#### 3. **Processamento da Resposta**

Ajuste conforme o formato JSON retornado pela API:

```typescript
// Exemplo: Se a API retorna assim:
// {
//   "data": "2025-01-15",
//   "usina": "TELES_PIRES",
//   "programacao": [
//     { "horario": "00:00", "potencia_mw": 1790 },
//     { "horario": "00:30", "potencia_mw": 1790 },
//     ...
//   ]
// }

// Processar assim:
if (responseData.programacao && Array.isArray(responseData.programacao)) {
  for (const item of responseData.programacao) {
    pdpData.push({
      hora: item.horario,
      pdp: parseFloat(item.potencia_mw),
    })
  }
}
```

### 📚 Documentação necessária da API do ONS:

Para adaptar corretamente, você precisará consultar a documentação da API do ONS e identificar:

1. **Endpoint de autenticação**
   - URL completa
   - Método (POST, GET)
   - Corpo da requisição
   - Formato da resposta (onde está o token?)

2. **Endpoint de dados de PDP**
   - URL completa
   - Parâmetros necessários (data, usina, etc.)
   - Headers necessários
   - Formato da resposta (estrutura JSON)

3. **Identificador da Usina**
   - Como a UHE Teles Pires é identificada na API
   - Exemplos: "UHE_TELES_PIRES", "TELES_PIRES", código numérico, etc.

---

## 🚀 Deploy da Edge Function

Após adaptar o código:

```bash
# Deploy da função
supabase functions deploy import-pdp

# Verificar se foi deployada
supabase functions list
```

Sucesso! A função estará disponível em:
```
https://[SEU_PROJECT_REF].supabase.co/functions/v1/import-pdp
```

---

## 📞 Como Usar

### Opção 1: Via HTTP Request (Postman, Insomnia, curl)

```bash
curl -X POST \
  https://[SEU_PROJECT_REF].supabase.co/functions/v1/import-pdp \
  -H 'Authorization: Bearer [SEU_ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2025-01-15"}'
```

**Onde encontrar o ANON_KEY:**
- Supabase Dashboard > Settings > API > Project API keys > `anon` `public`

### Opção 2: Via JavaScript (Frontend)

Adicione um botão no editor de dados:

```javascript
async function importarPDPDoONS() {
  const reportDate = document.getElementById('reportDate').value;

  if (!reportDate) {
    alert('Selecione uma data primeiro');
    return;
  }

  if (!confirm(`Importar dados de PDP da API do ONS para ${reportDate}?`)) {
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(
      'https://[SEU_PROJECT_REF].supabase.co/functions/v1/import-pdp',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: reportDate }),
      }
    );

    const result = await response.json();

    if (result.success) {
      alert(`✅ ${result.records} registros de PDP importados com sucesso!`);

      // Recarregar dados na tela
      await loadDataFromSupabase(reportDate);
      renderTable();
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
  } catch (error) {
    alert(`❌ Erro ao importar: ${error.message}`);
  } finally {
    showLoading(false);
  }
}
```

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Dados de PDP importados com sucesso",
  "date": "2025-01-15",
  "records": 48,
  "imported_at": "2025-01-15T10:30:00.000Z"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": "Falha na autenticação: 401 Unauthorized"
}
```

---

## ⏰ Agendamento Automático

Para executar a importação automaticamente todos os dias:

### Opção 1: Supabase Cron Job (RECOMENDADO)

Criar tabela de agendamento:

```sql
-- Habilitar extensão pg_cron (apenas uma vez)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar importação diária às 6h da manhã (horário do servidor)
SELECT cron.schedule(
  'import-pdp-daily',
  '0 6 * * *', -- Cron expression: todo dia às 6h
  $$
  SELECT
    net.http_post(
      url := 'https://[SEU_PROJECT_REF].supabase.co/functions/v1/import-pdp',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SEU_ANON_KEY]"}'::jsonb,
      body := concat('{"date": "', CURRENT_DATE::text, '"}')::jsonb
    );
  $$
);

-- Verificar agendamentos
SELECT * FROM cron.job;

-- Desabilitar agendamento
SELECT cron.unschedule('import-pdp-daily');
```

### Opção 2: Serviço Externo (Cron-job.org, EasyCron, etc.)

Configure um serviço externo para chamar a URL da Edge Function diariamente:

- **URL**: `https://[SEU_PROJECT_REF].supabase.co/functions/v1/import-pdp`
- **Método**: POST
- **Headers**:
  - `Authorization: Bearer [SEU_ANON_KEY]`
  - `Content-Type: application/json`
- **Body**: `{"date": "YYYY-MM-DD"}` (data dinâmica)

---

## 🐛 Troubleshooting

### Erro: "Credenciais da API do ONS não configuradas"

**Causa:** Variáveis de ambiente não foram configuradas.

**Solução:**
```bash
supabase secrets set ONS_API_URL=https://api.ons.org.br
supabase secrets set ONS_API_USERNAME=seu_usuario
supabase secrets set ONS_API_PASSWORD=sua_senha
```

### Erro: "Falha na autenticação: 401 Unauthorized"

**Causas possíveis:**
1. Usuário ou senha incorretos
2. Endpoint de autenticação incorreto
3. Formato do corpo da requisição incorreto

**Solução:**
1. Verificar credenciais no secrets
2. Testar autenticação manualmente com curl/Postman
3. Ajustar código conforme documentação da API do ONS

### Erro: "Nenhum dado de PDP encontrado"

**Causas possíveis:**
1. Data no formato incorreto
2. Identificador da usina incorreto
3. Endpoint de dados incorreto

**Solução:**
1. Verificar formato da data (YYYY-MM-DD)
2. Confirmar identificador correto da UHE Teles Pires na API
3. Testar endpoint manualmente

### Ver logs da Edge Function

```bash
# Logs em tempo real
supabase functions logs import-pdp --follow

# Logs das últimas execuções
supabase functions logs import-pdp
```

Ou no Dashboard:
- Edge Functions > import-pdp > Logs

---

## 📊 Verificar Dados Importados

Após importação, verificar no Supabase SQL Editor:

```sql
-- Ver últimos dados importados
SELECT
  hora,
  pdp,
  report_date,
  import_source,
  imported_at
FROM pdp_data
WHERE import_source = 'ONS_API'
ORDER BY imported_at DESC, hora
LIMIT 50;

-- Contar importações por data
SELECT
  report_date,
  COUNT(*) AS total_registros,
  MAX(imported_at) AS ultima_importacao
FROM pdp_data
WHERE import_source = 'ONS_API'
GROUP BY report_date
ORDER BY report_date DESC;
```

---

## 🔄 Próximos Passos

Após implementar a importação automática:

1. ✅ **Testar manualmente** com uma data
2. ✅ **Configurar agendamento** automático
3. ✅ **Adicionar botão no Editor** para reimportar manualmente se necessário
4. ✅ **Monitorar logs** nos primeiros dias
5. ✅ **Implementar notificações** de erro (opcional)

---

## 📚 Referências

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno Deploy](https://deno.com/deploy/docs)
- [pg_cron Extension](https://github.com/citusdata/pg_cron)

---

**Última atualização:** 2025-11-14
**Status:** Pronto para adaptação e deploy
