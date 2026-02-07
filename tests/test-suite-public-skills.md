# ClawShield Test Suite - Skills Públicas do ClawHub (REAL)

## 📋 Lista de Skills para Teste (15 skills reais do ClawHub)

Baseado em `clawhub explore` - 2026-02-06

### Categoria 1: Produtividade & Automação (5 skills)
1. **table-image-generator** v1.1.1 - Gerador de imagens de tabelas
2. **google-play** v1.0.1 - Google Play Developer API
3. **google-slides** v1.0.1 - Google Slides API
4. **mailchimp** v1.0.1 - Mailchimp Marketing API
5. **klaviyo** v1.0.1 - Klaviyo API integration

### Categoria 2: Busca & Pesquisa (2 skills)
6. **perplexity-search-skill** v1.0.0 - Busca web via Perplexity
7. **desktop-control** v1.0.0 - Automação de desktop (mouse, teclado)

### Categoria 3: Agentes & Autonomia (4 skills)
8. **agent-council** v1.0.0 - Toolkit para agentes autônomos
9. **agent-autonomy-kit** v1.0.0 - "Stop waiting for prompts. Keep working."
10. **agent-memory-kit** v2.1.0 - Kit de memória para agentes
11. **proactive-agent-1-2-4** v1.0.0 - Transforma agentes em proativos

### Categoria 4: Emoção & Perfil (2 skills)
12. **emotion-state** v1.2.0 - NL emotion tracking
13. **elicitation** v1.0.4 - Psychological profiling

### Categoria 5: Frameworks & Agentes Avançados (2 skills)
14. **agentic-ai-gold** v4.0.0 - Framework self-improving
15. **computer-use-1-0-1** v1.0.0 - Full desktop computer use

---

## 🎯 Critérios de Seleção

| Critério | Justificativa |
|----------|---------------|
| **Diversidade** | APIs, automação, desktop, emoção, frameworks |
| **Complexidade variada** | Simples (tabelas) até complexas (desktop control) |
| **API calls** | Google, Mailchimp, Klaviyo, Perplexity (testar patterns de rede) |
| **Potencialmente sensíveis** | Desktop control, computer use, psychological profiling |
| **Populares/Recentes** | Todas atualizadas há 1 minuto (ativas) |

---

## ⚠️ Atenção durante testes

### O que observar:
1. **Falsos positivos**: Alguma skill legítima disparou WARNING/BLOCKED?
2. **Scores**: Skills com API calls vão ter score > 0 (esperado)
3. **Padrões sensíveis**: Desktop control provavelmente terá shell/exec patterns
4. **Tempo de scan**: Skills maiores podem demorar mais

### Skills que provavelmente terão alerts (e isso é OK):
- `desktop-control` - Shell exec, input automation (esperado)
- `computer-use-1-0-1` - Desktop automation (esperado)
- `emotion-state` - Prompt injection mention (verificar se é documentado)
- `elicitation` - Psychological profiling (padrões de análise)

---

## 🛡️ Procedimento de Teste

```bash
# Para cada skill:
1. clawhub inspect <skill> --download /tmp/test-skill
2. cs /tmp/test-skill
3. Anotar: Score, Status, Issues encontrados
4. Verificar: Detecções fazem sentido para essa skill?
5. Decisão: Falso positivo ou detecção legítima?
```

---

## 📊 Tabela de Resultados (preencher durante testes)

| # | Skill | Score | Status | Issues | Esperado? | Observações |
|---|-------|-------|--------|--------|-----------|-------------|
| 1 | table-image-generator | | | | API calls OK | |
| 2 | google-play | | | | API calls OK | |
| 3 | google-slides | | | | API calls OK | |
| 4 | mailchimp | | | | API calls OK | |
| 5 | klaviyo | | | | API calls OK | |
| 6 | perplexity-search-skill | | | | Network OK | |
| 7 | desktop-control | | | | Shell exec OK? | Verificar se é documentado |
| 8 | agent-council | | | | Framework | |
| 9 | agent-autonomy-kit | | | | Autonomy | |
| 10 | agent-memory-kit | | | | Memory mgmt | |
| 11 | proactive-agent-1-2-4 | | | | Proactive | |
| 12 | emotion-state | | | | ⚠️ Prompt injection mention | Verificar contexto |
| 13 | elicitation | | | | Psychological | |
| 14 | agentic-ai-gold | | | | Self-improving | |
| 15 | computer-use-1-0-1 | | | | ⚠️ Desktop control | Shell/exec patterns |

---

## ✅ Critérios de Sucesso

Após os 15 testes:
- [ ] **80%+ CLEAN/CAUTION** (skills legítimas passam)
- [ ] **Zero BLOCKED injustos** (detecções fazem sentido)
- [ ] **Issues documentadas** (skills com alerts têm justificativa)
- [ ] **Score previsível** (mesmo tipo de skill = score similar)

---

## 🚨 Flags de Atenção

Se alguma skill abaixo disparar BLOCKED, investigar:
- `emotion-state` - Menciona "prompt injection" na descrição (pode ser legítimo)
- `desktop-control` - Shell/exec automation (provavelmente legítimo)
- `computer-use-1-0-1` - Full desktop use (provavelmente legítimo)

Se forem legítimas, avaliar se precisam de `.clawshieldignore` ou ajuste de thresholds.

---

*Lista atualizada com skills reais do ClawHub - 2026-02-06*
