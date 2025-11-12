# Setup do Controle da Geração

Este documento descreve como configurar a tabela `generation_control` no Supabase para registrar alterações nos valores de geração (set-point).

## 1. Criar Tabela no Supabase

Acesse o SQL Editor do seu projeto no Supabase e execute o seguinte comando:

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

-- Criar política para permitir todas as operações (ajuste conforme necessário)
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

## 2. Verificar a Criação

Execute o seguinte comando para verificar se a tabela foi criada:

```sql
SELECT * FROM generation_control LIMIT 1;
```

## 3. Campos da Tabela

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | BIGSERIAL | Sim (auto) | Identificador único |
| `report_date` | DATE | Sim | Data do relatório |
| `hora` | TIME | Sim | Horário da modificação |
| `setpoint` | DECIMAL | Sim | Novo valor de geração em MW |
| `responsavel` | VARCHAR(50) | Sim | ONS ou Axia Energia |
| `detalhe` | TEXT | Não | Detalhamento da solicitação |
| `created_at` | TIMESTAMP | Sim (auto) | Timestamp de criação do registro |

## 4. Estrutura de Permissões

As políticas RLS estão configuradas para acesso público. Em produção, ajuste conforme suas necessidades de segurança.

## 5. Próximos Passos

Após executar o SQL acima:
1. A tabela estará pronta para uso
2. O sistema poderá registrar e consultar alterações de set-point
3. Os registros ficarão vinculados à data do relatório
