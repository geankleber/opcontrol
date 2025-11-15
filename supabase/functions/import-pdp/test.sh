#!/bin/bash

# ===================================================
# Script de Teste - Edge Function import-pdp
# ===================================================
#
# Este script testa a Edge Function de importação de PDP
#
# Uso:
#   ./test.sh [data]
#
# Exemplos:
#   ./test.sh                  # Usa data de hoje
#   ./test.sh 2025-01-15       # Usa data específica
#
# ===================================================

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se está na raiz do projeto
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}❌ Execute este script da raiz do projeto opcontrol${NC}"
    exit 1
fi

# Obter data
if [ -z "$1" ]; then
    # Se não passou data, usar hoje
    DATE=$(date +%Y-%m-%d)
    echo -e "${YELLOW}⚠️  Nenhuma data especificada. Usando hoje: ${DATE}${NC}"
else
    DATE=$1
fi

# Validar formato da data
if [[ ! $DATE =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo -e "${RED}❌ Formato de data inválido. Use: YYYY-MM-DD${NC}"
    echo -e "   Exemplo: 2025-01-15"
    exit 1
fi

# Verificar se variáveis de ambiente estão configuradas
echo -e "${BLUE}🔍 Verificando configuração...${NC}"

# Ler PROJECT_REF do .env ou pedir ao usuário
if [ -f ".env.local" ]; then
    source .env.local
fi

if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_PROJECT_REF não encontrado${NC}"
    read -p "Digite o Project Reference ID do Supabase: " SUPABASE_PROJECT_REF
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ANON_KEY não encontrado${NC}"
    read -p "Digite o Anon Key do Supabase: " SUPABASE_ANON_KEY
fi

# URL da Edge Function
FUNCTION_URL="https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/import-pdp"

echo -e "${BLUE}📡 URL da função: ${FUNCTION_URL}${NC}"
echo -e "${BLUE}📅 Data: ${DATE}${NC}"
echo ""

# Fazer requisição
echo -e "${BLUE}🚀 Invocando Edge Function...${NC}"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "$FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"date\": \"${DATE}\"}")

# Separar corpo e status HTTP
HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

# Exibir resposta formatada
echo -e "${BLUE}📦 Resposta:${NC}"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

# Verificar status
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Importação bem-sucedida! (HTTP ${HTTP_STATUS})${NC}"

    # Extrair número de registros
    RECORDS=$(echo "$HTTP_BODY" | jq -r '.records' 2>/dev/null)
    if [ ! -z "$RECORDS" ] && [ "$RECORDS" != "null" ]; then
        echo -e "${GREEN}📊 ${RECORDS} registros importados${NC}"
    fi
elif [ "$HTTP_STATUS" -eq 404 ]; then
    echo -e "${YELLOW}⚠️  Nenhum dado encontrado para esta data (HTTP ${HTTP_STATUS})${NC}"
else
    echo -e "${RED}❌ Erro na importação (HTTP ${HTTP_STATUS})${NC}"

    # Extrair mensagem de erro
    ERROR=$(echo "$HTTP_BODY" | jq -r '.error' 2>/dev/null)
    if [ ! -z "$ERROR" ] && [ "$ERROR" != "null" ]; then
        echo -e "${RED}💬 Erro: ${ERROR}${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📋 Para ver logs completos:${NC}"
echo -e "   supabase functions logs import-pdp"
