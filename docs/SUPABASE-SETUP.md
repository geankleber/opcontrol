# Configuração do Supabase

Este guia explica como configurar o Supabase para persistência das observações.

## Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com

## Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: opcontrol
   - **Database Password**: (escolha uma senha forte)
   - **Region**: South America (São Paulo) - para menor latência
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser criado

## Passo 2: Criar Tabela

1. No painel lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole o seguinte SQL:

```sql
-- Criar tabela de observações
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hora TEXT NOT NULL,
  geracao NUMERIC,
  pdp NUMERIC,
  desvio NUMERIC,
  texto TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para busca rápida por data
CREATE INDEX idx_observations_report_date ON observations(report_date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura pública
CREATE POLICY "Permitir leitura pública"
ON observations FOR SELECT
USING (true);

-- Política: Permitir inserção pública
CREATE POLICY "Permitir inserção pública"
ON observations FOR INSERT
WITH CHECK (true);

-- Política: Permitir atualização pública
CREATE POLICY "Permitir atualização pública"
ON observations FOR UPDATE
USING (true);

-- Política: Permitir deleção pública
CREATE POLICY "Permitir deleção pública"
ON observations FOR DELETE
USING (true);

-- ==================================================
-- Criar tabela de dados de geração (data.xlsx)
-- ==================================================

CREATE TABLE generation_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hora TEXT NOT NULL,
  pdp NUMERIC NOT NULL,
  geracao NUMERIC,
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hora, report_date)
);

-- Criar índice para busca rápida por data
CREATE INDEX idx_generation_data_report_date ON generation_data(report_date);

-- Criar índice para busca por hora
CREATE INDEX idx_generation_data_hora ON generation_data(hora);

-- Habilitar Row Level Security (RLS)
ALTER TABLE generation_data ENABLE ROW LEVEL SECURITY;

-- Políticas para generation_data
CREATE POLICY "Permitir leitura pública generation_data"
ON generation_data FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção pública generation_data"
ON generation_data FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública generation_data"
ON generation_data FOR UPDATE
USING (true);

CREATE POLICY "Permitir deleção pública generation_data"
ON generation_data FOR DELETE
USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generation_data_updated_at BEFORE UPDATE
ON generation_data FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Você verá "Success. No rows returned"

## Passo 3: Obter Credenciais

1. No painel lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Copie os seguintes valores:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key** (começa com `eyJ...`)

## Passo 4: Configurar Aplicação

1. Crie um arquivo `supabase-config.js` na raiz do projeto:

```javascript
// supabase-config.js
const SUPABASE_CONFIG = {
    url: 'https://SEU-PROJETO.supabase.co',
    anonKey: 'SUA-ANON-KEY-AQUI'
};
```

2. Substitua `https://SEU-PROJETO.supabase.co` pela sua **Project URL**
3. Substitua `SUA-ANON-KEY-AQUI` pela sua **anon/public key**

 **IMPORTANTE**: Adicione `supabase-config.js` ao `.gitignore` para não commitar suas credenciais!

## Passo 5: Configurar .gitignore

Adicione ao `.gitignore`:

```
# Supabase credentials
supabase-config.js
```

## Passo 6: Verificar Funcionamento

1. Abra a aplicação no navegador
2. Carregue um arquivo de dados
3. Adicione uma observação
4. Recarregue a página - a observação deve permanecer!
5. Verifique no Supabase:
   - Vá em **"Table Editor"**
   - Clique em **"observations"**
   - Veja os dados salvos

## Editor de Dados de Geração

A aplicação inclui uma página dedicada para editar dados de geração (PDP e Geração):

### Como Usar o Editor

1. **Acessar o Editor:**
   - Na página principal, clique no botão **" Editar Dados"** no cabeçalho
   - Ou acesse diretamente `editor.html`

2. **Carregar Dados:**
   - Selecione a data no campo "Data"
   - Clique em **"Carregar do Supabase"** para carregar dados existentes
   - Ou clique em **"Gerar 48 Linhas"** para criar estrutura padrão (00:00-23:30)

3. **Editar Valores:**
   - Clique nos campos **PDP** ou **Geração** para editar
   - Digite o novo valor
   - Pressione **Enter** para salvar ou **Esc** para cancelar
   - O desvio é calculado automaticamente (Geração - PDP)

4. **Indicadores de Status:**
   -  **Salvo**: Dados sincronizados com Supabase
   -  **Modificado**: Dados editados mas não salvos
   - ⚪ **Novo**: Dados criados mas não salvos

5. **Salvar no Supabase:**
   - Clique em **"Salvar no Supabase"** para persistir todas as alterações
   - Os dados anteriores da mesma data serão substituídos

6. **Limpar Geração:**
   - Clique em **"Limpar Geração"** para remover apenas valores de geração
   - Os valores de PDP são mantidos

7. **Voltar:**
   - Clique em **"← Voltar"** para retornar à página principal
   - A página principal carregará automaticamente os dados salvos

### Fluxo de Trabalho Recomendado

1. Acesse o editor
2. Selecione a data desejada
3. Gere 48 linhas ou carregue dados existentes
4. Edite os valores de PDP e Geração conforme necessário
5. Salve no Supabase
6. Volte para a página principal para visualizar gráficos e análises

### Notas Importantes

- Dados são organizados por data (`report_date`)
- Cada combinação de hora + data é única
- Ao salvar, todos os dados da data são substituídos
- Edições não salvas serão perdidas ao mudar de data ou sair da página

## Deploy na Vercel

### Opção 1: Variáveis de Ambiente (Recomendado)

1. No painel da Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - `SUPABASE_URL`: sua Project URL
   - `SUPABASE_ANON_KEY`: sua anon key
3. Modifique `index.html` para carregar de variáveis:

```html
<script>
    window.SUPABASE_CONFIG = {
        url: 'https://SEU-PROJETO.supabase.co',
        anonKey: 'SUA-KEY-AQUI'
    };
</script>
```

### Opção 2: Hardcoded (Não recomendado para produção)

Você pode deixar as credenciais hardcoded no código, já que a anon key é segura para uso público (RLS protege os dados).

## Segurança

**Observações importantes:**

1.  **anon/public key é SEGURA** para expor no frontend
2.  Row Level Security (RLS) protege os dados
3.  Atualmente, qualquer pessoa pode ler/escrever observações
4.  Para adicionar autenticação:
   - Modifique as políticas RLS
   - Adicione Supabase Auth
   - Apenas usuários autenticados podem editar

## Próximos Passos (Opcional)

### Adicionar Autenticação

```javascript
// Login com email
const { user, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@exemplo.com',
  password: 'senha123'
});

// Atualizar políticas RLS para verificar auth.uid()
```

### Backup Automático

O Supabase faz backup automático diário no plano gratuito.

### Migrar Dados Existentes

```javascript
// Importar observações do Excel para Supabase
async function migrateToSupabase() {
    const localObs = JSON.parse(localStorage.getItem('observations') || '[]');
    const { data, error } = await supabase
        .from('observations')
        .insert(localObs);
    console.log('Migração concluída:', data);
}
```

## Troubleshooting

### Erro: "row-level security policy"
- Verifique se executou as políticas RLS no SQL

### Erro: "Failed to fetch"
- Verifique se a URL e anon key estão corretas
- Verifique se o projeto Supabase está ativo

### Observações não aparecem
- Abra DevTools (F12) → Console
- Procure por erros
- Verifique no Table Editor do Supabase se os dados estão lá

## Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Verificação Final

- [ ] Projeto Supabase criado
- [ ] Tabela `observations` criada
- [ ] Políticas RLS configuradas
- [ ] Credenciais copiadas
- [ ] Arquivo `supabase-config.js` criado
- [ ] `.gitignore` atualizado
- [ ] Aplicação testada localmente
- [ ] Deploy na Vercel (opcional)

---

 **Dica**: Use o plano gratuito do Supabase que oferece:
- 500MB de storage
- 2GB de bandwidth/mês
- Ilimitadas operações de API
- Backups automáticos diários
