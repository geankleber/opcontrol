// ===================================================
// Edge Function: Importar PDP da API do ONS
// ===================================================
//
// Esta função busca dados de Programa Diário de Produção (PDP)
// da API do ONS (integra.ons.org.br) e armazena na tabela pdp_data do Supabase.
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
  usuario: string
  senha: string
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
    const url = 'https://integra.ons.org.br/api/autenticar'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: credentials.usuario,
        senha: credentials.senha,
      }),
    })

    if (!response.ok) {
      throw new Error(`Falha na autenticação: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // A API do ONS retorna o token no campo 'access_token'
    if (!data.access_token) {
      throw new Error('Token de acesso não encontrado na resposta da API')
    }

    console.log('✅ Autenticação bem-sucedida')
    return data.access_token
  } catch (error) {
    console.error('Erro ao autenticar na API do ONS:', error)
    throw error
  }
}

/**
 * Busca dados de PDP da API do ONS para uma data específica
 */
async function fetchPDPFromONS(
  token: string,
  date: string
): Promise<PDPData[]> {
  try {
    const url = 'https://integra.ons.org.br/api/programacao/usina/ListarGeracaoProposta'

    // Parsear a data (formato: YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number)

    const requestBody = {
      Ano: year,
      Mes: month,
      Dia: day,
      CodigosUsinas: ['N2UHTP'], // Código da UHE Teles Pires
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()

    // Validar estrutura da resposta
    if (!responseData.Usinas || !Array.isArray(responseData.Usinas) || responseData.Usinas.length === 0) {
      throw new Error('Resposta da API não contém dados de usinas')
    }

    // Extrair dados da primeira (e única) usina
    const usina = responseData.Usinas[0]

    if (!usina.DadoInsumoPatamar || !Array.isArray(usina.DadoInsumoPatamar)) {
      throw new Error('Dados de patamar não encontrados na resposta')
    }

    // Processar dados de PDP
    const pdpData: PDPData[] = []

    for (const entry of usina.DadoInsumoPatamar) {
      const horaOriginal = entry.PatamarHora // Formato: "HH:MM"
      const pdpValue = parseFloat(entry.PatamarValor_SUP)

      // Ajustar hora: adicionar 30 minutos (conforme script Python)
      const horaAjustada = adjustTime(horaOriginal)

      pdpData.push({
        hora: horaAjustada,
        pdp: pdpValue,
      })
    }

    // Verificar se todos os valores estão zerados
    const todosZerados = pdpData.every(item => item.pdp === 0)

    if (todosZerados) {
      throw new Error('DADOS_ZERADOS')
    }

    console.log(`✅ ${pdpData.length} registros de PDP obtidos da API do ONS`)
    return pdpData
  } catch (error) {
    console.error('Erro ao buscar dados da API do ONS:', error)
    throw error
  }
}

/**
 * Ajusta a hora adicionando 30 minutos
 * Exemplo: "00:00" -> "00:30", "23:30" -> "24:00"
 */
function adjustTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)

  // Criar data dummy para operação de tempo
  const date = new Date(2000, 0, 1, hours, minutes)

  // Adicionar 30 minutos
  date.setMinutes(date.getMinutes() + 30)

  // Se passou para o próximo dia, retornar "24:00"
  if (date.getDate() > 1) {
    return '24:00'
  }

  // Formatar como HH:MM
  const newHours = String(date.getHours()).padStart(2, '0')
  const newMinutes = String(date.getMinutes()).padStart(2, '0')

  return `${newHours}:${newMinutes}`
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
      usuario: Deno.env.get('ONS_API_USERNAME') || '',
      senha: Deno.env.get('ONS_API_PASSWORD') || '',
    }

    // Validar credenciais
    if (!onsCredentials.usuario || !onsCredentials.senha) {
      throw new Error('Credenciais da API do ONS não configuradas. Configure as variáveis de ambiente: ONS_API_USERNAME, ONS_API_PASSWORD')
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

    // 2. Buscar dados de PDP
    console.log('📊 Buscando dados de PDP...')
    let pdpData

    try {
      pdpData = await fetchPDPFromONS(token, date)
    } catch (error) {
      // Verificar se é erro de dados zerados
      if (error.message === 'DADOS_ZERADOS') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Ainda não existem dados a serem importados.',
            date: date,
            error_type: 'DADOS_ZERADOS',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
      // Outros erros, relançar
      throw error
    }

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
