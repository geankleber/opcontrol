# 🚀 Supabase Edge Functions - OpControl

Esta pasta contém as Edge Functions do projeto OpControl.

## 📁 Estrutura

```
supabase/functions/
├── README.md                  # Este arquivo
└── import-pdp/               # Função de importação de PDP
    └── index.ts              # Código principal
```

## 🔧 Funções Disponíveis

### 1. `import-pdp`

Importa dados de Programa Diário de Produção (PDP) da API do ONS e armazena no Supabase.

**Documentação completa:** [INTEGRACAO-API-ONS.md](../../docs/INTEGRACAO-API-ONS.md)

**Uso:**
```bash
# Deploy
supabase functions deploy import-pdp

# Invocar
curl -X POST \
  https://[PROJECT_REF].supabase.co/functions/v1/import-pdp \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2025-01-15"}'

# Ver logs
supabase functions logs import-pdp
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Verificar instalação
supabase --version
```

### Configuração Inicial

```bash
# 1. Login no Supabase
supabase login

# 2. Vincular ao projeto
supabase link --project-ref [SEU_PROJECT_REF]

# 3. Configurar secrets
supabase secrets set ONS_API_URL=https://api.ons.org.br
supabase secrets set ONS_API_USERNAME=seu_usuario
supabase secrets set ONS_API_PASSWORD=sua_senha
```

### Testar Localmente

```bash
# Iniciar Supabase local (inclui Edge Functions)
supabase start

# Servir função localmente
supabase functions serve import-pdp

# Em outro terminal, testar
curl -X POST \
  http://localhost:54321/functions/v1/import-pdp \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2025-01-15"}'
```

### Deploy

```bash
# Deploy de uma função específica
supabase functions deploy import-pdp

# Deploy de todas as funções
supabase functions deploy

# Listar funções deployadas
supabase functions list
```

## 📊 Monitoramento

### Ver Logs

```bash
# Logs em tempo real
supabase functions logs import-pdp --follow

# Logs das últimas execuções
supabase functions logs import-pdp --limit 100
```

### Dashboard

Acesse o Supabase Dashboard:
- Edge Functions > [nome-da-funcao] > Logs
- Edge Functions > [nome-da-funcao] > Metrics

## 🔐 Segurança

- ✅ Secrets armazenados no Supabase (não no código)
- ✅ Autenticação via Bearer token
- ✅ CORS configurado
- ✅ Execução server-side (backend)

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Última atualização:** 2025-11-14
