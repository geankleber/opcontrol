# ⚡ Início Rápido - Supabase

Guia rápido para configurar persistência de observações com Supabase em 5 minutos.

## 🎯 Visão Geral

O projeto agora suporta persistência de observações usando **Supabase** (banco de dados PostgreSQL na nuvem). As observações são salvas automaticamente e organizadas por data.

**Sem Supabase:** Observações são perdidas ao recarregar a página (apenas memória).
**Com Supabase:** Observações ficam salvas permanentemente e sincronizadas.

## 🚀 Setup Rápido (5 minutos)

### 1. Criar Conta e Projeto Supabase

1. Acesse https://supabase.com e faça login (gratuito)
2. Clique em **"New Project"**
3. Preencha:
   - Name: `opcontrol`
   - Database Password: (anote esta senha!)
   - Region: `South America (São Paulo)`
4. Aguarde 2 minutos

### 2. Criar Tabela

1. No Supabase, vá em **"SQL Editor"** → **"New query"**
2. Cole e execute este SQL:

```sql
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

CREATE INDEX idx_observations_report_date ON observations(report_date);

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública" ON observations FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON observations FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON observations FOR UPDATE USING (true);
CREATE POLICY "Permitir deleção pública" ON observations FOR DELETE USING (true);
```

### 3. Copiar Credenciais

1. Vá em **"Project Settings"** (⚙️) → **"API"**
2. Copie:
   - **Project URL** (ex: `https://xxx.supabase.co`)
   - **anon/public key** (começa com `eyJ...`)

### 4. Configurar Aplicação

1. **Copie o template:**
   ```bash
   cp supabase-config.template.js supabase-config.js
   ```

2. **Edite `supabase-config.js`:**
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://SEU-PROJETO.supabase.co',  // ← Cole sua Project URL
       anonKey: 'eyJ...'                        // ← Cole sua anon key
   };
   ```

3. **Abra `index.html` no navegador**

✅ Pronto! As observações agora são salvas automaticamente.

## ✨ Como Usar

### Adicionar Observação
1. Carregue dados (arquivo Excel ou dados padrão)
2. Clique em uma célula do heatmap
3. Digite a observação
4. Clique em **"Salvar"**
5. ✅ Observação salva no Supabase automaticamente!

### Visualizar Observações
- Todas as observações aparecem na seção **"Observações"**
- Observações são filtradas pela data selecionada
- Recarregue a página: observações permanecem!

### Trocar Data
- Selecione outra data no campo **"Data"**
- As observações dessa data serão carregadas automaticamente

### Editar/Deletar
- Clique em ✏️ para editar
- Clique em 🗑️ para deletar
- Alterações sincronizadas automaticamente com Supabase

## 🔍 Verificar se está Funcionando

### No Navegador
1. Abra DevTools (F12) → Console
2. Você deve ver:
   ```
   ✅ Supabase inicializado com sucesso
   ✅ 0 observação(ões) carregada(s) do Supabase
   ```
3. Adicione uma observação
4. Veja no console:
   ```
   ✅ Observação salva no Supabase
   ```

### No Supabase
1. Vá em **"Table Editor"**
2. Clique em **"observations"**
3. Veja suas observações salvas!

## 🐛 Problemas Comuns

### ❌ Erro: "Supabase não configurado"
**Causa:** Arquivo `supabase-config.js` não existe ou está vazio.
**Solução:** Copie o template e preencha com suas credenciais.

### ❌ Observações não aparecem após recarregar
**Causa:** Supabase não está funcionando.
**Solução:**
1. Abra DevTools → Console
2. Veja os erros em vermelho
3. Verifique URL e anon key no `supabase-config.js`

### ❌ Erro: "Failed to fetch"
**Causa:** URL ou key incorreta.
**Solução:** Copie novamente as credenciais do Supabase.

### ❌ Erro: "row-level security policy"
**Causa:** Políticas RLS não foram criadas.
**Solução:** Execute o SQL completo do Passo 2 novamente.

## 📊 Funciona Sem Supabase?

**Sim!** A aplicação funciona perfeitamente sem Supabase, mas:
- ❌ Observações são perdidas ao recarregar a página
- ✅ Você pode exportar/importar observações via Excel

Para usar sem Supabase:
1. Não crie o arquivo `supabase-config.js`
2. A aplicação detecta automaticamente e usa apenas memória

## 🌐 Deploy na Vercel com Supabase

### Opção 1: Hardcoded (Simples)
- Commit o arquivo `supabase-config.js` com as credenciais
- ⚠️ **Seguro:** anon key pode ser exposta (RLS protege)
- Deploy normal na Vercel

### Opção 2: Variáveis de Ambiente (Recomendado)
1. Na Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - `SUPABASE_URL`: `https://xxx.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJ...`
3. Modifique `index.html`:
   ```html
   <script>
   const SUPABASE_CONFIG = {
       url: '__SUPABASE_URL__',
       anonKey: '__SUPABASE_ANON_KEY__'
   };
   </script>
   ```
4. Configure build para substituir placeholders

## 📈 Próximos Passos

- [X] Configurar Supabase ✅
- [ ] Adicionar autenticação (opcional)
- [ ] Configurar backup automático
- [ ] Adicionar filtros por usuário

## 📚 Documentação Completa

Para detalhes avançados, veja: [SUPABASE-SETUP.md](SUPABASE-SETUP.md)

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Tabela `observations` criada
- [ ] Credenciais copiadas
- [ ] Arquivo `supabase-config.js` criado
- [ ] Aplicação testada (observação salva)
- [ ] `.gitignore` atualizado (não commitar credenciais)

---

**Tempo total:** ~5 minutos ⏱️
**Custo:** Gratuito (plano free do Supabase) 💰

Dúvidas? Veja a documentação completa ou abra uma issue!
