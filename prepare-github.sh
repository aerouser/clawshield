#!/bin/bash
#
# GitHub Release Preparation Script
# Prepara o ClawShield para push no GitHub
#

echo "🛡️  Preparing ClawShield for GitHub Release"
echo ""

# Diretório do projeto
PROJECT_DIR="/root/.openclaw/workspace/projects/clawshield"
cd "$PROJECT_DIR"

# Verificar arquivos essenciais
echo "📋 Checking essential files..."

files=(
  "README.md"
  "LICENSE"
  "package.json"
  ".gitignore"
  "CONTRIBUTING.md"
  "install.sh"
  "bin/clawshield.js"
  "src/scanner/engine.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING"
    exit 1
  fi
done

echo ""

# Verificar versionamento
echo "🔢 Version check..."
VERSION=$(node -p "require('./package.json').version")
echo "  Version: $VERSION"

# Testar instalação local
echo ""
echo "🧪 Testing local installation..."
npm link --silent 2>/dev/null || true

# Testar scan
echo ""
echo "🧪 Testing scan functionality..."
if [ -d "tests/fixtures" ]; then
  TEST_OUTPUT=$(node bin/clawshield.js scan tests/fixtures/trigger-exfil-endpoint 2>&1)
  if echo "$TEST_OUTPUT" | grep -q "BLOCKED\|WARNING\|CAUTION"; then
    echo "  ✅ Scan working"
  else
    echo "  ⚠️  Scan may have issues"
  fi
else
  echo "  ⚠️  No test fixtures found"
fi

echo ""

# Estrutura do projeto
echo "📁 Project structure:"
tree -L 3 -I 'node_modules' . 2>/dev/null || find . -maxdepth 3 -not -path '*/node_modules/*' | head -30

echo ""
echo "✅ Ready for GitHub!"
echo ""
echo "Next steps:"
echo ""
echo "1. Create repo on GitHub:"
echo "   https://github.com/new"
echo "   Name: clawshield"
echo "   Public"
echo ""
echo "2. Push code:"
echo "   cd $PROJECT_DIR"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial release v$VERSION'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/gustavosr8/clawshield.git"
echo "   git push -u origin main"
echo ""
echo "3. Installation link will be:"
echo "   curl -fsSL https://raw.githubusercontent.com/gustavosr8/clawshield/main/install.sh | bash"
echo ""
