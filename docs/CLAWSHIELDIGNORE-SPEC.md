# Especificação .clawshieldignore
## Versão 1.0 - ClawShield Security Tool Declaration

---

## Visão Geral

O arquivo `.clawshieldignore` é um **contrato de segurança** que permite ferramentas de segurança legítimas declararem intencionalmente a presença de padrões que normalmente seriam considerados maliciosos.

> **Princípio fundamental:** Ferramentas de segurança não são isentas de análise — apenas explicam suas exceções.

---

## Propósito

- Permitir que scanners de segurança funcionem sem falsos positivos
- Manter auditoria completa de exceções
- Criar padrão único para o ecossistema OpenClaw
- Garantir que nenhuma exceção seja "invisível"

---

## Formato

O arquivo usa sintaxe **YAML-like** simplificada, priorizando legibilidade humana e parseabilidade automática.

### Localização
```
/skills/nome-da-skill/
├── SKILL.md
├── .clawshieldignore          <-- AQUI
└── src/
```

---

## Campos Obrigatórios

### `tool` (string)
Nome da ferramenta de segurança.
```yaml
tool: skillvet
```

### `type` (string)
Tipo da ferramenta:
- `security-tool`: Ferramenta de segurança geral
- `scanner`: Scanner específico
- `detector`: Detector de padrões
- `educational`: Material educacional com padrões perigosos

### `reason` (string multilinha)
Justificativa completa para as exceções.
```yaml
reason: >
  Esta skill contém intencionalmente padrões considerados maliciosos
  para fins de detecção, educação e análise de segurança.
```

### `ignore` (lista)
Lista **específica** de IDs de regras a ignorar.
```yaml
ignore:
  - EXFILTRATION_WEBHOOK
  - CREDENTIAL_HARVESTING
  - REVERSE_SHELL
```

**⚠️ PROIBIDO:**
- Wildcards (`*`)
- "ignore all"
- Padrões genéricos

---

## Campos Recomendados

### `description` (string multilinha)
Descrição detalhada do que a ferramenta faz.

### `scope.files` (lista)
Arquivos/pastas onde as exceções aplicam.
```yaml
scope:
  files:
    - src/scanners/**
    - docs/examples/**
```

### `verification` (lista)
Declarações verificáveis sobre a ferramenta.
```yaml
verification:
  - "Esta skill é uma ferramenta de segurança"
  - "Padrões são usados apenas para detecção"
  - "Código é aberto e auditável"
```

### `audit` (mapa)
Informações de auditoria.
```yaml
audit:
  created: "2026-02-06"
  reviewed_by: "Nome do Revisor"
  review_date: "2026-02-06"
  purpose: "Security research"
```

---

## Campos Opcionais

### `version` (string)
Versão desta declaração (não da skill).

### `scope.languages` (lista)
Linguagens usadas na ferramenta.

### `scope.exclude` (lista)
Arquivos que NUNCA devem ter exceções.

### `expires` (data)
Data de expiração (revisão anual recomendada).
```yaml
expires: "2027-02-06"
```

---

## Comportamento do ClawShield

Quando o ClawShield encontra um `.clawshieldignore` válido:

1. **Parseia** o arquivo
2. **Verifica** se `is_security_tool: true` está presente
3. **Carrega** a lista de regras ignoradas
4. **Executa** o scan normalmente
5. **Marca** issues ignoradas como `intentional: true`
6. **Remove** severity de issues ignoradas (viram INFO)
7. **Recalcula** o score final
8. **Relata** no output: "Security tool detected with intentional patterns"

---

## Exemplo Completo

```yaml
# .clawshieldignore

tool: skillvet
type: security-tool
version: "1.0"

reason: >
  Security scanner that detects malware patterns in other skills.
  Intentionally includes malicious patterns for detection purposes.

description: |
  Skillvet scans OpenClaw skills for security vulnerabilities,
  malware signatures, and suspicious patterns. It includes
  examples of malicious code for educational purposes.

ignore:
  - EXFILTRATION_WEBHOOK
  - CREDENTIAL_HARVESTING
  - REVERSE_SHELL
  - BASE64_OBFUSCATION
  - SUSPICIOUS_DOWNLOAD

scope:
  files:
    - src/scanners/**
    - scripts/skill-audit.sh
    - SKILL.md
  languages:
    - javascript
    - bash

verification:
  - "Security tool, not malware"
  - "Patterns for detection only"
  - "Open source and auditable"

audit:
  created: "2026-02-06"
  reviewed_by: "Orion"
  review_date: "2026-02-06"
  purpose: "Security research"
```

---

## Validação

Um `.clawshieldignore` é válido se:
- [ ] Possui `tool` definido
- [ ] Possui `reason` não-vazio
- [ ] Lista `ignore` não está vazia
- [ ] Nenhum wildcard (`*`) em `ignore`
- [ ] Possui `is_security_tool: true` ou `type: security-tool`

---

## Segurança

### O que o `.clawshieldignore` NÃO faz:
- ❌ Não isenta a skill de scan
- ❌ Não esconde issues (apenas muda severity)
- ❌ Não permite wildcards
- ❌ Não é "ignore all"

### O que o `.clawshieldignore` FAZ:
- ✅ Declara intenção explicitamente
- ✅ Mantém auditoria completa
- ✅ Requer especificidade
- ✅ Contextualiza findings

---

## Versionamento

Esta especificação segue Semantic Versioning:
- **Major**: Mudanças incompatíveis
- **Minor**: Novos campos opcionais
- **Patch**: Correções de documentação

---

## Referências

- Template: `.clawshieldignore.template`
- Implementação: `src/scanner/engine.js`
- Exemplo real: `/skills/skillvet/.clawshieldignore`

---

*Especificação ClawShield v0.2.0*
