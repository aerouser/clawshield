# 🛡️ ClawShield - Field Notes

> Observações de uso real do scanner em produção
> Documento interno - não público

---

## 📅 Data de criação: 2026-02-07
## 📝 Última atualização: 2026-02-07

---

## 🔍 Regras que Mais Disparam

> Preencher conforme uso real do scanner

| Regra | Frequência | Contexto | Notas |
|-------|------------|----------|-------|
| - | - | - | - |

---

## 🔕 Regras que Nunca Disparam

> Preencher para avaliar se regra está obsoleta

| Regra | Último disparo | Avaliação |
|-------|----------------|-----------|
| - | - | - |

---

## ⚠️ Falsos Positivos Detectados

> Registro de quando uma regra acionou indevidamente

| Data | Regra | Skill | Contexto | Ação tomada |
|------|-------|-------|----------|-------------|
| - | - | - | - | - |

---

## 🎯 Padrões Inesperados

> Descobertas que não prevíamos no design

### 2026-02-07
- **Caso nanopdf:** Skill "inofensiva" de PDF com payload base64 + curl
- **Aprendizado:** README bonito ≠ código seguro
- **Impacto:** Reforçou necessidade do scanner

---

## 📊 Estatísticas de Uso

| Métrica | Valor | Data |
|---------|-------|------|
| Total de scans | - | - |
| Bloqueios (score > 85) | - | - |
| Warnings (score 61-85) | - | - |
| Falsos positivos | - | - |

---

## 🔧 Ajustes Necessários

> Ideias para próximas versões baseadas em uso real

### Prioridade Alta
- [ ] Aguardando dados de uso...

### Prioridade Média  
- [ ] Aguardando dados de uso...

### Prioridade Baixa
- [ ] Aguardando dados de uso...

---

## 💬 Feedback da Comunidade

> Comentários, issues, sugestões

| Data | Fonte | Feedback | Ação |
|------|-------|----------|------|
| 2026-02-07 | AuraSecurity (Moltbook) | Score 60/100 por projeto novo | Normal para v1.0.0 |
| 2026-02-07 | AgentVet (concorrente) | Similar, foco em CI/CD | Diferenciar: 100% offline |

---

## 🚀 Decisões para Lançamento Pro

> Notas para quando formos lançar versão paga

### Diferenciais confirmados:
- ✅ 100% offline (não há concorrente assim)
- ✅ Root Safety Mode
- ✅ Case real (nanopdf) provado

### O que falta validar:
- ⏳ Demanda por dashboard
- ⏳ Disposição para pagar $9/mês
- ⏳ Necessidade de API vs CLI

---

## 📝 Notas Diárias

### 2026-02-07 - Lançamento v1.0.0
- Lançado no Moltbook
- GitHub Action implementado
- Post recebeu comentário do AuraSecurity (bot de scan)
- Concorrente AgentVet identificado (mais maduro, mais upvotes)
- Diferencial: case real + 100% offline

---

*Documento para uso interno. Atualizar semanalmente.*
