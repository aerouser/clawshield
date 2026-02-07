#!/bin/bash
# Relatório Semanal ClawShield - Dia 13/02/2026
# Gera relatório de uso e métricas para avaliação

REPORT_DATE="2026-02-13"
REPORT_FILE="/root/.openclaw/workspace/projects/clawshield/reports/weekly-report-${REPORT_DATE}.md"
LOG_FILE="/root/.openclaw/workspace/logs/clawshield-usage.log"

echo "Gerando relatório ClawShield para ${REPORT_DATE}..."

# Criar diretório se não existir
mkdir -p /root/.openclaw/workspace/projects/clawshield/reports

# Coletar métricas do log (se existir)
TOTAL_SCANS=$(grep -c "SECURITY SCAN REPORT" "$LOG_FILE" 2>/dev/null || echo "0")
CLEAN_COUNT=$(grep -c "Status:.*CLEAN" "$LOG_FILE" 2>/dev/null || echo "0")
CAUTION_COUNT=$(grep -c "Status:.*CAUTION" "$LOG_FILE" 2>/dev/null || echo "0")
WARNING_COUNT=$(grep -c "Status:.*WARNING" "$LOG_FILE" 2>/dev/null || echo "0")
BLOCKED_COUNT=$(grep -c "Status:.*BLOCKED" "$LOG_FILE" 2>/dev/null || echo "0")
FORCE_USED=$(grep -c "\-\-force" "$LOG_FILE" 2>/dev/null || echo "0")

cat > "$REPORT_FILE" << EOF
# 📊 Relatório Semanal ClawShield

**Período:** 06/02/2026 - 13/02/2026  
**Gerado em:** $(date '+%d/%m/%Y %H:%M')  
**Versão:** v0.2.1

---

## 🎯 Resumo Executivo

Uso do ClawShield como "usuário zero" - observação de comportamento real em ambiente de produção (Orion Brindes).

---

## 📈 Métricas de Uso

| Métrica | Valor | Observação |
|---------|-------|------------|
| **Total de scans** | ${TOTAL_SCANS} | Número total de skills verificadas |
| 🟢 **CLEAN** | ${CLEAN_COUNT} | Skills sem issues significativas |
| 🟡 **CAUTION** | ${CAUTION_COUNT} | Skills com patterns suspeitos (monitorar) |
| 🟠 **WARNING** | ${WARNING_COUNT} | Skills com issues reais (revisar antes) |
| 🔴 **BLOCKED** | ${BLOCKED_COUNT} | Skills perigosas (não instalar) |
| **--force usado** | ${FORCE_USED} | Quantas vezes forçou instalação |

---

## 🧪 Skills Testadas Nesta Semana

### Internas (Orion):
- [ ] rememberall
- [ ] skillvet  
- [ ] google-weather
- [ ] pdf-text-extractor
- [ ] table-image-generator
- [ ] travel-manager
- [ ] wacli
- [ ] markdown-formatter

### Públicas (ClawHub):
- [ ] table-image-generator
- [ ] google-play
- [ ] google-slides
- [ ] mailchimp
- [ ] klaviyo
- [ ] perplexity-search-skill
- [ ] desktop-control
- [ ] agent-council (**BLOCKED** - caso documentado)
- [ ] agent-autonomy-kit
- [ ] agent-memory-kit
- [ ] proactive-agent-1-2-4
- [ ] emotion-state
- [ ] elicitation
- [ ] agentic-ai-gold
- [ ] computer-use-1-0-1

---

## 📝 Observações de Uso Real

### Friction Points (O que me incomodou):
1. *(Preencher durante a semana)*
2. 
3. 

### Proteções Realizadas (O que me salvou):
1. **agent-council bloqueado em root** - Skill legítima mas poderosa, bloqueio foi correto
2. *(Adicionar durante a semana)*
3. 

### Decisões Difíceis:
- *(Alguma vez pensei: "Aff, vou dar --force só pra passar?")*
- 

---

## 🔍 Padrões Observados

### Falsos Positivos:
- *Nenhum identificado ainda*

### Detecções Legítimas:
- **agent-council**: Caso canônico de "legítimo mas perigoso em root"
- Skills de API (Google, Mailchimp): Score ~39, CREDENTIAL_HARVESTING por OAuth (esperado)

---

## 🛡️ Root Safety Mode

**Status:** ✅ Ativo e funcionando

**Comportamento observado:**
- CAUTION → WARNING: Funcionando
- WARNING → BLOCKED: Funcionando
- Aumenta fricção consciente quando necessário

---

## ✅ Checklist de Validação

- [ ] Usei ClawShield em TODO install/update
- [ ] Não forcei sem motivo
- [ ] Anotei fricções reais
- [ ] Anotei proteções realizadas
- [ ] Revisei o caso agent-council

---

## 🎯 Recomendações para Discussão (GPT)

### Pontos para avaliação:
1. **Thresholds estão adequados?** Score de 39 para APIs OAuth faz sentido?
2. **agent-council:** Manter BLOCK em root ou reconsiderar?
3. **Próximo passo:** Continuar observação ou abrir para mais usuários?
4. **Features pendentes:** Priorizar dashboard, honeypots, ou manter foco?

---

## 📊 Conclusão Provisória

**Status do produto:** *(Preencher na sexta)*

- [ ] Pronto para soft launch
- [ ] Precisa de ajustes finos
- [ ] Manter observação por mais tempo

---

*Relatório gerado automaticamente pelo sistema ClawShield*  
*Para avaliação conjunta: Gustavo + Orion + GPT*
EOF

echo "✅ Relatório gerado: $REPORT_FILE"
echo ""
echo "📋 Resumo das métricas:"
echo "   Total scans: $TOTAL_SCANS"
echo "   CLEAN: $CLEAN_COUNT"
echo "   CAUTION: $CAUTION_COUNT"
echo "   WARNING: $WARNING_COUNT"
echo "   BLOCKED: $BLOCKED_COUNT"
echo "   --force usado: $FORCE_USED"
