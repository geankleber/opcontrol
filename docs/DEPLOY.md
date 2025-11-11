# Guia de Deploy - GitHub Pages

## Opção Recomendada: GitHub Pages

### Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"**
3. Preencha:
   - **Nome**: `opcontrol` (ou outro nome)
   - **Descrição**: "Monitor de Geração UHE Teles Pires"
   - **Visibilidade**: Public (para GitHub Pages grátis)
   - **NÃO** marque "Initialize with README" (já temos)
4. Clique em **"Create repository"**

### Passo 2: Conectar Repositório Local

```bash
# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/opcontrol.git

# Verificar
git remote -v
```

### Passo 3: Fazer Push

```bash
# Enviar código para GitHub
git push -u origin main
```

### Passo 4: Ativar GitHub Pages

#### Opção A: Via Interface Web (Recomendado)

1. Vá para o repositório no GitHub
2. Clique em **Settings** ()
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - Branch: `main`
   - Folder: `/ (root)`
5. Clique em **Save**
6. Aguarde 1-2 minutos
7. Acesse: `https://seu-usuario.github.io/opcontrol/`

#### Opção B: Via GitHub CLI

```bash
# Instalar GitHub CLI (se não tiver)
brew install gh  # macOS
# ou
winget install GitHub.cli  # Windows

# Login
gh auth login

# Ativar Pages
gh repo edit --enable-pages --pages-branch main
```

### Passo 5: Verificar Deploy

```bash
# Ver status do deploy
gh run list

# Ou acesse direto:
# https://seu-usuario.github.io/opcontrol/
```

---

## ⏱ Tempo Total: ~5 minutos

---

## Atualizações Futuras

Sempre que fizer alterações:

```bash
# 1. Fazer mudanças nos arquivos
# 2. Commitar
git add .
git commit -m "descrição da mudança"

# 3. Enviar para GitHub
git push

# 4. Aguardar 1-2 minutos
# Site atualizado automaticamente!
```

---

## URL Final

Seu projeto estará disponível em:

```
https://seu-usuario.github.io/opcontrol/
```

**Exemplo:**
- Usuário: `joaosilva`
- URL: `https://joaosilva.github.io/opcontrol/`

---

## Domínio Personalizado (Opcional)

### Se quiser usar seu próprio domínio:

1. Compre um domínio (ex: Registro.br, GoDaddy)
2. Configure DNS:
   ```
   Tipo: CNAME
   Nome: www
   Valor: seu-usuario.github.io
   ```
3. No GitHub Pages Settings, adicione domínio customizado
4. Aguarde propagação DNS (até 48h)

**Exemplo:**
- `www.monitortelespires.com.br`

---

## Monitoramento

### Verificar Status do Site

```bash
# Via GitHub CLI
gh run list

# Ou acesse:
# https://github.com/seu-usuario/opcontrol/actions
```

### Estatísticas de Acesso

GitHub Pages não oferece analytics nativamente. Opções:

**Opção 1: Google Analytics** (Grátis)
```html
<!-- Adicionar em index.html, antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Opção 2: GitHub Insights**
- Settings → Insights → Traffic
- Veja visitantes, clones, referrers

---

## Segurança

### HTTPS Automático
 GitHub Pages ativa HTTPS automaticamente
 Certificado SSL gratuito
 Renovação automática

### Proteção CORS
Se precisar permitir CORS:
```html
<!-- Não necessário para este projeto -->
<!-- Já funciona 100% no cliente -->
```

---

## 🐛 Troubleshooting

### Problema: Site não carrega após 5 minutos

**Solução:**
```bash
# 1. Verificar se push foi feito
git status

# 2. Verificar Actions
gh run list

# 3. Ver logs
gh run view

# 4. Tentar novamente
git commit --allow-empty -m "trigger deploy"
git push
```

### Problema: 404 Not Found

**Soluções:**
- Verificar se `index.html` está na raiz
- Aguardar 2-3 minutos
- Limpar cache do navegador (Ctrl+Shift+R)
- Verificar URL: deve ter `/opcontrol/` no final

### Problema: Gráfico não aparece

**Causa:** CDN bloqueado
**Solução:** Baixar Chart.js localmente

```bash
# Criar pasta libs
mkdir libs

# Baixar Chart.js
curl -o libs/chart.min.js https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js

# Baixar SheetJS
curl -o libs/xlsx.full.min.js https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
```

Atualizar `index.html`:
```html
<!-- Trocar: -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
<!-- Por: -->
<script src="libs/chart.min.js"></script>
```

---

## Comparação com Outras Opções

| Recurso | GitHub Pages | Netlify | Vercel | Servidor Próprio |
|---------|--------------|---------|--------|------------------|
| **Preço** | Grátis | Grátis | Grátis | R$ 20-100/mês |
| **Setup** | 5 min | 3 min | 3 min | 1-2 horas |
| **SSL** | Automático | Automático | Automático | Manual |
| **Deploy** | git push | git push | git push | FTP/SSH |
| **Domínio Custom** | Sim | Sim | Sim | Sim |
| **Uptime** | 99.9% | 99.9% | 99.9% | Depende |
| **CDN Global** | Sim | Sim | Sim | Não |
| **Ideal para** |  Este projeto | Sites dinâmicos | Apps Next.js | Apps complexos |

---

## Checklist de Deploy

Antes de fazer deploy:

- [ ] Testado localmente (index.html funciona)
- [ ] Todos os arquivos commitados
- [ ] README.md atualizado com URL
- [ ] Screenshots adicionados (opcional)
- [ ] Links do README apontam para repositório correto
- [ ] Dados sensíveis removidos (se houver)

---

## Pronto!

Após seguir estes passos, seu projeto estará **online e acessível globalmente**!

Compartilhe a URL com sua equipe! 

---

## 📞 Suporte

Problemas com deploy?

- 📧 Email: suporte@exemplo.com
- 💬 [GitHub Discussions](https://github.com/seu-usuario/opcontrol/discussions)
-  [GitHub Pages Docs](https://docs.github.com/pages)
