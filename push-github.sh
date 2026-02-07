#!/bin/bash
#
# Script de Push para GitHub
# Uso: ./push-github.sh
#

REPO_URL="https://github.com/gustavosr8/clawshield.git"

echo "🛡️  Pushing ClawShield to GitHub"
echo "   Repo: $REPO_URL"
echo ""

# Inicializar git
git init

# Configurar git (se necessário)
if ! git config user.email > /dev/null; then
    git config user.email "gustavo@orionbrindes.com"
    git config user.name "Gustavo"
fi

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "🛡️ Initial release v1.0.0

- Security scanner for OpenClaw skills
- 25+ detection rules
- Root Safety Mode
- Local scanning (100% offline)
- Cloud integration ready
- Case study: nanopdf malware detection"

# Renomear branch para main
git branch -M main

# Adicionar remote
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

# Push
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done!"
echo ""
echo "Links:"
echo "  Repo:     https://github.com/gustavosr8/clawshield"
echo "  Install:  curl -fsSL https://raw.githubusercontent.com/gustavosr8/clawshield/main/install.sh | bash"
echo ""
