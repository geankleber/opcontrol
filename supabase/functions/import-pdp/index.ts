// ===================================================
// Edge Function: Importar PDP da API do ONS
// ===================================================
//
// Esta função busca dados de Programa Diário de Produção (PDP)
// da API do ONS e armazena na tabela pdp_data do Supabase.
//
// Deploy:
//   supabase functions deploy import-pdp
//
// Invocar:
//   POST https://[PROJECT_REF].supabase.co/functions/v1/import-pdp
//   Headers:
//     Authorization: Bearer [ANON_KEY]
//     Content-Type: application/json
//   Body:
//     { "date": "2025-01-15" }
//
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ONSCredentials {
  username: string
  password: string
  apiUrl: string
}

interface PDPData {
  hora: string
  pdp: number
}

/**
 * Autentica na API do ONS e retorna o token de acesso
 */
async function authenticateONS(credentials: ONSCredentials): Promise<string> {
  try {
    // AJUSTE CONFORME A API DO ONS
    // Exemplo genérico de autenticação
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

    if (!authResponse.ok) {
      throw new Error(`Falha na autenticação: ${authResponse.status} ${authResponse.statusText}`)
    }

    const authData = await authResponse.json()

    // AJUSTE: O campo do token pode ter nome diferente
    // Exemplos comuns: token, access_token, auth_token, jwt
    return authData.token || authData.access_token || authData.auth_token
  } catch (error) {
    console.error('Erro ao autenticar na API do ONS:', error)
    throw error
  }
}

/**
 * Busca dados de PDP da API do ONS para uma data específica
 */
async function fetchPDPFromONS(
  credentials: ONSCredentials,
  token: string,
  date: string
): Promise<PDPData[]> {
  try {
    // AJUSTE CONFORME A API DO ONS
    // Exemplo genérico de busca de dados
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

    if (!dataResponse.ok) {
      throw new Error(`Falha ao buscar dados: ${dataResponse.status} ${dataResponse.statusText}`)
    }

    const responseData = await dataResponse.json()

    // AJUSTE: Processar conforme o formato retornado pela API
    // Este é um exemplo genérico - adapte conforme necessário
    const pdpData: PDPData[] = []

    // Exemplo 1: Se a API retorna array direto
    if (Array.isArray(responseData)) {
      for (const item of responseData) {
        pdpData.push({
          hora: item.hora || item.timestamp || item.time,
          pdp: parseFloat(item.pdp || item.valor || item.value || item.programado),
        })
      }
    }

    // Exemplo 2: Se a API retorna objeto com propriedade 'data'
    else if (responseData.data && Array.isArray(responseData.data)) {
      for (const item of responseData.data) {
        pdpData.push({
          hora: item.hora || item.timestamp || item.time,
          pdp: parseFloat(item.pdp || item.valor || item.value || item.programado),
        })
      }
    }

    // Exemplo 3: Se a API retorna horários como chaves
    else if (typeof responseData === 'object') {
      for (const [hora, valor] of Object.entries(responseData)) {
        if (hora !== 'metadata' && hora !== 'info') { // Ignorar campos de metadados
          pdpData.push({
            hora: hora,
            pdp: parseFloat(String(valor)),
          })
        }
      }
    }

    console.log(`✅ ${pdpData.length} registros de PDP obtidos da API do ONS`)
    return pdpData
  } catch (error) {
    console.error('Erro ao buscar dados da API do ONS:', error)
    throw error
  }
}

/**
 * Salva dados de PDP na tabela pdp_data
 */
async function savePDPToSupabase(
  supabaseClient: any,
  pdpData: PDPData[],
  reportDate: string
): Promise<void> {
  try {
    // Deletar dados existentes da data (para evitar duplicatas)
    const { error: deleteError } = await supabaseClient
      .from('pdp_data')
      .delete()
      .eq('report_date', reportDate)
      .eq('import_source', 'ONS_API')

    if (deleteError) {
      console.warn('Aviso ao deletar dados antigos:', deleteError.message)
    }

    // Preparar dados para inserção
    const records = pdpData.map(item => ({
      hora: item.hora,
      pdp: item.pdp,
      report_date: reportDate,
      import_source: 'ONS_API',
      imported_at: new Date().toISOString(),
    }))

    // Inserir novos dados
    const { data, error } = await supabaseClient
      .from('pdp_data')
      .insert(records)
      .select()

    if (error) {
      throw error
    }

    console.log(`✅ ${records.length} registros salvos no Supabase`)
  } catch (error) {
    console.error('Erro ao salvar dados no Supabase:', error)
    throw error
  }
}

/**
 * Handler principal da Edge Function
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obter credenciais das variáveis de ambiente
    const onsCredentials: ONSCredentials = {
      username: Deno.env.get('ONS_API_USERNAME') || '',
      password: Deno.env.get('ONS_API_PASSWORD') || '',
      apiUrl: Deno.env.get('ONS_API_URL') || '',
    }

    // Validar credenciais
    if (!onsCredentials.username || !onsCredentials.password || !onsCredentials.apiUrl) {
      throw new Error('Credenciais da API do ONS não configuradas. Configure as variáveis de ambiente: ONS_API_USERNAME, ONS_API_PASSWORD, ONS_API_URL')
    }

    // Obter data do corpo da requisição
    const { date } = await req.json()

    if (!date) {
      throw new Error('Parâmetro "date" é obrigatório (formato: YYYY-MM-DD)')
    }

    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Formato de data inválido. Use: YYYY-MM-DD')
    }

    console.log(`📅 Importando PDP para a data: ${date}`)

    // 1. Autenticar na API do ONS
    console.log('🔐 Autenticando na API do ONS...')
    const token = await authenticateONS(onsCredentials)
    console.log('✅ Autenticação bem-sucedida')

    // 2. Buscar dados de PDP
    console.log('📊 Buscando dados de PDP...')
    const pdpData = await fetchPDPFromONS(onsCredentials, token, date)

    if (pdpData.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Nenhum dado de PDP encontrado para esta data',
          date: date,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // 3. Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Salvar dados no Supabase
    console.log('💾 Salvando dados no Supabase...')
    await savePDPToSupabase(supabaseClient, pdpData, date)

    // 5. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dados de PDP importados com sucesso',
        date: date,
        records: pdpData.length,
        imported_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Erro na importação:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
