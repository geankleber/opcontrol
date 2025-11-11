#!/bin/bash

# ========================================
# Script de Deploy - GitHub Pages
# UHE Teles Pires - Monitor de Geração
# ========================================

echo "🚀 Deploy para GitHub Pages"
echo "============================"
echo ""

# Verificar se está em um repositório git
if [ ! -d .git ]; then
    echo "❌ Erro: Não é um repositório git"
    exit 1
fi

# Verificar se há alterações não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Há alterações não commitadas"
    echo "📝 Fazendo commit automático..."
    git add .
    git commit -m "chore: preparar para deploy"
fi

# Solicitar usuário do GitHub
echo "📋 Digite seu usuário do GitHub:"
read -p "Usuário: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Usuário não pode estar vazio"
    exit 1
fi

echo ""
echo "✅ Usuário: $GITHUB_USER"
echo "📦 Repositório: opcontrol"
echo "🌐 URL final: https://$GITHUB_USER.github.io/opcontrol/"
echo ""

# Confirmar
read -p "Continuar? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "❌ Deploy cancelado"
    exit 0
fi

echo ""
echo "🔗 Configurando remote..."

# Remover remote antigo se existir
git remote remove origin 2>/dev/null

# Adicionar novo remote
git remote add origin "https://github.com/$GITHUB_USER/opcontrol.git"

echo "✅ Remote configurado"
echo ""

# Verificar se repositório existe
echo "📡 Verificando conexão com GitHub..."
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Abra: https://github.com/new"
echo "2. Nome do repositório: opcontrol"
echo "3. Descrição: Monitor de Geração UHE Teles Pires"
echo "4. Público (Public)"
echo "5. NÃO marque 'Initialize with README'"
echo "6. Clique em 'Create repository'"
echo ""

read -p "Repositório criado no GitHub? (s/n): " REPO_CREATED

if [ "$REPO_CREATED" != "s" ] && [ "$REPO_CREATED" != "S" ]; then
    echo "❌ Crie o repositório primeiro"
    echo "🌐 Acesse: https://github.com/new"
    exit 1
fi

echo ""
echo "📤 Enviando código para GitHub..."

# Push para o GitHub
if git push -u origin main; then
    echo ""
    echo "✅ Código enviado com sucesso!"
    echo ""
    echo "🔧 Próximo passo: Ativar GitHub Pages"
    echo ""
    echo "INSTRUÇÕES:"
    echo "1. Acesse: https://github.com/$GITHUB_USER/opcontrol/settings/pages"
    echo "2. Em 'Source', selecione: Branch 'main' → Folder '/ (root)'"
    echo "3. Clique em 'Save'"
    echo "4. Aguarde 1-2 minutos"
    echo ""
    echo "🌐 Seu site estará em:"
    echo "   https://$GITHUB_USER.github.io/opcontrol/"
    echo ""
    echo "✅ Deploy concluído!"
    echo ""
else
    echo ""
    echo "❌ Erro ao enviar código"
    echo ""
    echo "Possíveis soluções:"
    echo "1. Verificar se o repositório foi criado"
    echo "2. Verificar credenciais do GitHub"
    echo "3. Tentar autenticação:"
    echo "   gh auth login"
    echo ""
fi
