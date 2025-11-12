# Instalação do Controle da Geração

Este guia mostra como instalar e configurar a funcionalidade de **Controle da Geração** no seu sistema.

## Pré-requisitos

- ✅ Projeto opcontrol já instalado e funcionando
- ✅ Acesso ao Supabase (projeto configurado)
- ✅ Acesso ao SQL Editor do Supabase

## Passo a Passo

### 1. Criar a Tabela no Supabase

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **"New query"**
4. Copie e cole o seguinte SQL:

```sql
-- Criar tabela generation_control
CREATE TABLE generation_control (
  id BIGSERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  hora TIME NOT NULL,
  setpoint DECIMAL(10, 2) NOT NULL,
  responsavel VARCHAR(50) NOT NULL CHECK (responsavel IN ('ONS', 'Axia Energia')),
  detalhe TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_generation_control_report_date ON generation_control(report_date);
CREATE INDEX idx_generation_control_created_at ON generation_control(created_at DESC);
CREATE INDEX idx_generation_control_responsavel ON generation_control(responsavel);

-- Habilitar RLS (Row Level Security)
ALTER TABLE generation_control ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações
CREATE POLICY "Permitir acesso público à generation_control" ON generation_control
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Adicionar comentários
COMMENT ON TABLE generation_control IS 'Registro temporal de alterações de set-point de geração';
COMMENT ON COLUMN generation_control.report_date IS 'Data do relatório';
COMMENT ON COLUMN generation_control.hora IS 'Horário da modificação';
COMMENT ON COLUMN generation_control.setpoint IS 'Novo valor de geração (MW)';
COMMENT ON COLUMN generation_control.responsavel IS 'Responsável pela alteração (ONS ou Axia Energia)';
COMMENT ON COLUMN generation_control.detalhe IS 'Detalhamento da solicitação';
COMMENT ON COLUMN generation_control.created_at IS 'Timestamp de quando o registro foi criado';
```

5. Clique em **"Run"** (ou pressione Ctrl/Cmd + Enter)
6. Verifique se apareceu "Success. No rows returned"

### 2. Verificar a Tabela

Execute o seguinte comando no SQL Editor para confirmar:

```sql
SELECT * FROM generation_control LIMIT 1;
```

Deve retornar: "No rows returned" (isto é normal, pois a tabela está vazia)

### 3. Verificar os Arquivos do Projeto

Certifique-se de que os seguintes arquivos foram adicionados/atualizados:

#### Novos arquivos:
- ✅ `js/generation-control.js` - Funções do controle
- ✅ `docs/GENERATION-CONTROL-SETUP.md` - Setup técnico
- ✅ `docs/CONTROLE-GERACAO-MANUAL.md` - Manual de uso
- ✅ `docs/INSTALACAO-CONTROLE-GERACAO.md` - Este arquivo

#### Arquivos modificados:
- ✅ `index.html` - Adicionada seção e modal
- ✅ `css/styles.css` - Adicionados estilos
- ✅ `js/script.js` - Integração com funções

### 4. Testar a Instalação

1. Abra o arquivo `index.html` no navegador
2. Verifique se há uma seção **"Controle da Geração (0)"** na página
3. Clique no botão **"➕ Adicionar Controle"**
4. Preencha o formulário de teste:
   - Hora: 14:00
   - Set-point: 1800
   - Responsável: ONS
   - Detalhe: Teste de instalação
5. Clique em **"Salvar"**
6. Verifique se o registro aparece na lista

### 5. Verificar no Supabase

1. Volte ao SQL Editor do Supabase
2. Execute:

```sql
SELECT * FROM generation_control ORDER BY created_at DESC LIMIT 5;
```

3. Você deve ver o registro de teste criado

## Estrutura da Tabela

```
generation_control
├── id              BIGSERIAL (PK)
├── report_date     DATE (NOT NULL)
├── hora            TIME (NOT NULL)
├── setpoint        DECIMAL(10,2) (NOT NULL)
├── responsavel     VARCHAR(50) (NOT NULL) CHECK: 'ONS' | 'Axia Energia'
├── detalhe         TEXT
└── created_at      TIMESTAMP WITH TIME ZONE
```

## Troubleshooting

### Erro: "relation generation_control does not exist"
**Solução:** Execute o SQL de criação da tabela novamente

### Erro: "permission denied for table generation_control"
**Solução:** Verifique se a política RLS foi criada corretamente. Execute:

```sql
SELECT * FROM pg_policies WHERE tablename = 'generation_control';
```

Deve retornar uma política chamada "Permitir acesso público à generation_control"

### Erro: "new row violates check constraint"
**Solução:** Certifique-se de que o campo "Responsável" contém exatamente "ONS" ou "Axia Energia"

### Botão "Adicionar Controle" não aparece
**Solução:**
1. Verifique se o arquivo `js/generation-control.js` está carregado
2. Abra o console do navegador (F12) e verifique erros
3. Certifique-se de que o HTML está correto

### Registros não aparecem após salvar
**Solução:**
1. Abra o console do navegador (F12)
2. Verifique se há erros de conexão com Supabase
3. Confirme que `SUPABASE_CONFIG` está configurado corretamente

## Limpeza (Desinstalação)

Se precisar remover a funcionalidade:

```sql
-- Remover tabela e todos os dados
DROP TABLE IF EXISTS generation_control CASCADE;
```

⚠️ **ATENÇÃO:** Isso apagará permanentemente todos os registros!

## Próximos Passos

1. 📖 Leia o [Manual de Uso](CONTROLE-GERACAO-MANUAL.md)
2. 🔧 Configure permissões mais restritivas no Supabase (opcional)
3. 📊 Comece a registrar alterações de set-point
4. 💾 Configure backups regulares do Supabase

## Suporte

Para mais informações:
- 📄 Documentação técnica: `docs/GENERATION-CONTROL-SETUP.md`
- 📚 Manual do usuário: `docs/CONTROLE-GERACAO-MANUAL.md`
- 🔧 Setup do Supabase: `docs/SUPABASE-SETUP.md`

---

**Versão:** 1.0.0
**Data:** 2025-11-12
**Status:** Pronto para uso
