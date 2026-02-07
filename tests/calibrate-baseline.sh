#!/bin/bash
# Testa todas as skills instaladas com ClawShield
# Gera relatório de calibração

echo "🛡️ CLAWSHIELD - TESTE DE CALIBRAÇÃO"
echo "===================================="
echo ""
echo "Data: $(date)"
echo ""

SKILLS_DIR="/root/.openclaw/workspace/skills"
REPORT_FILE="/root/.openclaw/workspace/projects/clawshield/tests/calibration-report.md"

echo "# Relatório de Calibração - ClawShield MVP" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Data:** $(date -Iseconds)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Skills Testadas" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| Skill | Score | Status | Tempo |" >> "$REPORT_FILE"
echo "|-------|-------|--------|-------|" >> "$REPORT_FILE"

TOTAL=0
CLEAN=0
WARNING=0
CAUTION=0
BLOCKED=0

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  TOTAL=$((TOTAL + 1))
  
  echo "[$TOTAL] Testando: $skill_name..."
  
  # Run scan
  OUTPUT=$(/usr/local/bin/cs "$skill_dir" 2>&1)
  
  # Extract score
  SCORE=$(echo "$OUTPUT" | grep "Risk Score:" | sed 's/.*Score:[[:space:]]*\([0-9]*\).*/\1/')
  SCORE=${SCORE:-0}
  
  # Extract status
  if echo "$OUTPUT" | grep -q "CLEAN"; then
    STATUS="🟢 CLEAN"
    CLEAN=$((CLEAN + 1))
  elif echo "$OUTPUT" | grep -q "WARNING"; then
    STATUS="🟠 WARNING"
    WARNING=$((WARNING + 1))
  elif echo "$OUTPUT" | grep -q "CAUTION"; then
    STATUS="🟡 CAUTION"
    CAUTION=$((CAUTION + 1))
  elif echo "$OUTPUT" | grep -q "BLOCKED"; then
    STATUS="🔴 BLOCKED"
    BLOCKED=$((BLOCKED + 1))
  else
    STATUS="❓ UNKNOWN"
  fi
  
  # Extract duration
  TIME=$(echo "$OUTPUT" | grep "Duration:" | sed 's/.*Duration:[[:space:]]*\([0-9]*\).*/\1/')
  TIME=${TIME:-0}
  
  echo "    → Score: $SCORE | Status: $STATUS | ${TIME}ms"
  
  # Add to report
  echo "| $skill_name | $SCORE | $STATUS | ${TIME}ms |" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "## Resumo" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Total testado:** $TOTAL" >> "$REPORT_FILE"
echo "- 🟢 CLEAN: $CLEAN" >> "$REPORT_FILE"
echo "- 🟠 WARNING: $WARNING" >> "$REPORT_FILE"
echo "- 🟡 CAUTION: $CAUTION" >> "$REPORT_FILE"
echo "- 🔴 BLOCKED: $BLOCKED" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Análise
if [ $CAUTION -gt 0 ] || [ $BLOCKED -gt 0 ]; then
  echo "⚠️  ALERTA: $CAUTION CAUTION + $BLOCKED BLOCKED" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "Skills legítimas não deveriam disparar CAUTION/BLOCKED." >> "$REPORT_FILE"
  echo "Recomendação: Revisar thresholds ou regras muito agressivas." >> "$REPORT_FILE"
else
  echo "✅ RESULTADO: Todas as skills legítimas passaram (CLEAN/WARNING)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "Thresholds parecem adequados para uso em produção." >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "*Relatório gerado automaticamente pelo ClawShield*" >> "$REPORT_FILE"

echo ""
echo "===================================="
echo "✅ TESTE COMPLETO!"
echo ""
echo "📊 Resumo:"
echo "  Total: $TOTAL"
echo "  🟢 CLEAN: $CLEAN"
echo "  🟠 WARNING: $WARNING"
echo "  🟡 CAUTION: $CAUTION"
echo "  🔴 BLOCKED: $BLOCKED"
echo ""
echo "📄 Relatório salvo em:"
echo "  $REPORT_FILE"
echo ""
