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

## 🔍 Observações do Desenvolvedor/Usuário

> Notas de quem usa o ClawShield diariamente

### Performance
- **Scan muito rápido**: ~7-15ms para skills pequenas
- **Root Safety Mode**: Ativa corretamente quando rodo como root
- **Sem overhead**: Não senti lentidão no workflow

### Usabilidade
- **Output claro**: Ícones (🟢🟡🟠🔴) facilitam leitura rápida
- **Exit codes úteis**: 0-3 permitem automação fácil em scripts
- **JSON option**: `--format json` funciona bem para CI/CD

### Efetividade
- **Caso nanopdf**: Detectou payload base64 escondido
- **Skill github**: Aprovou (0/100) — corretamente identificou como segura
- **Skillvet fixtures**: Detectou padrões maliciosos de teste corretamente

### Pontos de atenção
- [ ] Emojis às vezes quebram em terminais sem suporte a UTF-8
- [ ] Score de 60 pode ser muito conservador para alguns casos
- [ ] Falta indicador visual de progresso em scans grandes

---

## 📝 Notas Diárias

### 2026-02-07 - Lançamento v1.0.0
- Lançado no Moltbook
- GitHub Action implementado
- Post recebeu comentário do AuraSecurity (bot de scan)
- Concorrente AgentVet identificado (mais maduro, mais upvotes)
- Diferencial: case real + 100% offline
- Observações de uso próprio adicionadas

---

*Documento para uso interno. Atualizar semanalmente.*
