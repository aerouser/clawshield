# 🏢 CLAWSHIELD ENTERPRISE - Arquitetura On-Prem First

> **"Zero-trust by design. Seus dados nunca saem do seu servidor."**

---

## 🎯 Princípios Fundamentais

1. **On-Prem by Default** - Tudo roda no servidor do cliente
2. **Zero Data Exposure** - Nunca recebemos skills, logs, credenciais
3. **Optional Cloud** - Console/cloud só distribui regras, não coleta dados
4. **Supply Chain Security** - Updates assinados, verificáveis, rollback automático

---

## 🏗️ Arquitetura em 3 Camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 3: CONTROL PLANE (OPCIONAL)                │
│                      Zero-Trust Cloud Services                        │
├─────────────────────────────────────────────────────────────────────┤
│  🌐 Lovable Console                                                 │
│     ├── Catálogo de regras (IOC/heurísticas)                        │
│     ├── Licenças e assinaturas                                      │
│     ├── Releases assinados (ed25519)                                │
│     └── Whitelist/Blacklist comunitária                             │
│                                                                     │
│  📊 Dashboard Agregado (opt-in)                                     │
│     ├── Métricas anonimizadas                                       │
│     ├── Hash de pacotes + scores                                    │
│     └── Regras disparadas (sem payload)                             │
│                                                                     │
│  🧠 ML Training (dados sintéticos apenas)                           │
│     ├── Honeypots próprios                                          │
│     ├── Repositórios públicos                                       │
│     └── Casos sintéticos                                            │
└─────────────────────────────────────────────────────────────────────┘
                              🔒 HTTPS + Signatures
                              (apenas regras/updates)
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 2: CLAWSHIELD AGENT                        │
│                      Core Security Engine                             │
├─────────────────────────────────────────────────────────────────────┤
│  🔍 Static Scanner                                                  │
│     ├── AST analysis local                                          │
│     ├── Heurísticas (50+ checks)                                    │
│     └── Score de risco (0-100)                                      │
│                                                                     │
│  🧪 Sandbox/Detonação                                               │
│     ├── Container isolado                                           │
│     ├── Ferramentas mockadas                                        │
│     └── Análise comportamental                                      │
│                                                                     │
│  🛡️ Policy Engine                                                   │
│     ├── Regras YAML locais                                          │
│     ├── Firewall de ferramentas                                     │
│     └── Enforcement em tempo real                                   │
│                                                                     │
│  📡 Event Collector                                                 │
│     ├── Logs locais (nunca saem)                                    │
│     ├── Telemetria mínima (opt-in)                                  │
│     └── Anonimização automática                                     │
└─────────────────────────────────────────────────────────────────────┘
                              🔒 Local Only
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 1: RUNTIME HOOKS                           │
│                      OpenClaw Integration                             │
├─────────────────────────────────────────────────────────────────────┤
│  🪝 Pre-Tool Execution Hook                                         │
│     └── Intercepta toda chamada de ferramenta                       │
│                                                                     │
│  🪝 Pre-Skill Install Hook                                          │
│     └── Scana antes de instalar                                     │
│                                                                     │
│  🪝 Policy Enforcement Point                                        │
│     └── Decide: ALLOW / BLOCK / SANDBOX / ALERT                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 O Que NUNCA Sai do Servidor do Cliente

| Dado | Fica Local? | Por quê |
|------|-------------|---------|
| Skills instaladas | ✅ Sim | IP do cliente |
| Código analisado | ✅ Sim | Propriedade intelectual |
| Logs de execução | ✅ Sim | Dados sensíveis |
| Credenciais (.env) | ✅ Sim | Segredo |
| Conteúdo do workspace | ✅ Sim | Dados de negócio |
| Relatórios de segurança | ✅ Sim | Compliance |

---

## 🌐 O Que o Cloud (Lovable) Recebe

### Modo Padrão (Zero-Trust)
```
❌ NADA
O cliente roda 100% isolado, sem conectar na nuvem
```

### Modo Console (Opt-in)
```
✅ Apenas:
- Hash SHA256 do pacote da skill
- Indicadores agregados (contagens)
- "Regra X disparou" (sem payload)
- Score final + timestamps
- Versão do ClawShield
```

**Exemplo de telemetria mínima:**
```json
{
  "skill_hash": "a1b2c3...",
  "rule_triggered": "exfiltration_pattern_07",
  "severity": "high",
  "score": 78,
  "timestamp": "2026-02-05T18:30:00Z",
  "clawshield_version": "1.2.0"
}
```

---

## 🔄 Fluxo de Update Seguro (Supply Chain)

```
1. ClawShield Team publica update
   ├── Código fonte auditado
   ├── Build reproducible
   └── Assinatura ed25519
   
2. Cliente recebe notificação (opcional)
   └── "Nova versão 1.3.0 disponível"
   
3. Cliente baixa update
   ├── Canal HTTPS apenas
   ├── Verifica checksum
   └── Verifica assinatura (pin de chave pública local)
   
4. Cliente aplica update
   ├── Backup automático da versão anterior
   ├── Rollback automático se falhar
   └── Janela de manutenção configurável
   
5. Confirmação
   └── "Update 1.3.0 aplicado com sucesso"
```

### Checklist de Segurança do Update

| Requisito | Implementação |
|-----------|---------------|
| Assinatura digital | ed25519 |
| Pin de chave pública | Hardcoded no agente |
| Checksum verification | SHA256 |
| Rollback automático | Timeout + health check |
| Canal seguro | HTTPS apenas |
| Modo dry-run | Baixar sem aplicar |

---

## 🧠 ML Training (Sem Dados do Cliente)

### O Que Usamos para Treinar

| Fonte | Tipo |
|-------|------|
| Honeypots próprios | Skills maliciosas sintéticas |
| Repositórios públicos | Código open source |
| Regras internas | Heurísticas manuais |
| Simulações | Cenários de ataque |
| Dados sintéticos | Gerados automaticamente |

### O Que o Cliente Recebe

- Novas regras de detecção
- Novas heurísticas
- Modelos de correlação
- Updates do motor

**Nunca:**
- Dados de outros clientes
- Logs brutos
- Skills reais

---

## 📦 Modos de Operação

### Modo 1: On-Prem Isolado (Padrão)
```yaml
conexão_cloud: nenhuma
atualizações: manual (download do portal)
licença: arquivo local
regras: YAML local
```
**Para:** Clientes paranóicos, air-gapped, compliance rígido

### Modo 2: On-Prem + Updates
```yaml
conexão_cloud: apenas updates
atualizações: automática (assinada)
licença: verificação online (cache local)
regras: sync com cloud (assinado)
```
**Para:** Maioria dos clientes enterprise

### Modo 3: On-Prem + Console
```yaml
conexão_cloud: updates + dashboard
atualizações: automática
licença: online
regras: sync
analytics: opt-in (telemetria mínima)
```
**Para:** Clientes que querem visibilidade centralizada

---

## 🔌 Integração com OpenClaw

### Hook de Runtime

```javascript
// openclaw-gateway.yaml
security:
  clawshield:
    enabled: true
    mode: "strict"  # strict | permissive | audit-only
    
    hooks:
      pre_tool_execution: 
        - /opt/clawshield/hooks/pre-exec.sh
      pre_skill_install:
        - /opt/clawshield/hooks/pre-install.sh
      post_skill_install:
        - /opt/clawshield/hooks/post-install.sh
    
    policy:
      path: /etc/clawshield/policies/
      auto_reload: true
    
    updates:
      enabled: true
      channel: https://updates.clawshield.ai
      verify_signatures: true
      auto_apply: false  # manual por padrão
      window: "02:00-04:00"
```

### Exemplo de Policy Enforcement

```yaml
# /etc/clawshield/policies/default.yaml
version: "1.0"

rules:
  - id: block_external_post
    name: "Bloquear POST externo"
    condition:
      tool: web_fetch
      method: POST
      url_pattern: "!*.internal.company.com"
    action: BLOCK
    alert: true
    
  - id: sandbox_new_skills
    name: "Sandbox skills desconhecidas"
    condition:
      event: skill_install
      reputation: "unknown"
    action: SANDBOX
    
  - id: alert_env_access
    name: "Alertar acesso a .env"
    condition:
      tool: read
      path: "*.env*"
    action: ALLOW
    alert: true
```

---

## 🏢 Componentes do Sistema

```
clawshield/
├── bin/
│   ├── clawshield-daemon      # Serviço principal
│   ├── clawshield-cli         # CLI de admin
│   └── clawshield-update      # Updater assinado
├── etc/
│   ├── config.yaml            # Config principal
│   └── policies/              # Regras locais
├── var/
│   ├── log/                   # Logs locais
│   ├── sandbox/               # Tmpfs containers
│   └── quarantine/            # Skills em quarentena
├── lib/
│   ├── scanner/               # Motor de análise
│   ├── sandbox/               # Runtime isolado
│   └── policy/                # Policy engine
└── hooks/
    ├── openclaw-pre-exec.sh   # Hook de execução
    └── openclaw-pre-install.sh # Hook de instalação
```

---

## 🔐 Segurança do Próprio ClawShield

### Ameaças Mitigadas

| Ameaça | Mitigação |
|--------|-----------|
| Tampering no binário | Assinatura + checksum |
| Downgrade attack | Version pinning + mínimo aceitável |
| Config injection | YAML schema validation |
| Privilege escalation | Drop root após inicialização |
| Supply chain | Reproducible builds + SLSA |

### Auditoria

```bash
# Logs de auditoria imutáveis
/var/log/clawshield/audit.log
- Timestamp criptograficamente verificável
- Append-only (auditd)
- Rotação automática
- Export para SIEM (opcional)
```

---

## 📋 Checklist de Deployment Enterprise

### Pre-Install
- [ ] Sistema operacional suportado (Ubuntu 22.04+, RHEL 9+)
- [ ] Recursos mínimos (2 CPU, 4GB RAM, 20GB disco)
- [ ] Acesso root/sudo
- [ ] Portas de rede (se usar cloud: 443 outbound)

### Install
- [ ] Download do pacote assinado
- [ ] Verificação de assinatura
- [ ] Instalação em /opt/clawshield
- [ ] Configuração inicial (wizard)
- [ ] Teste de sandbox

### Post-Install
- [ ] Configurar políticas customizadas
- [ ] Integrar com OpenClaw
- [ ] Testar com skill benigna
- [ ] Testar com skill maliciosa (honeypot)
- [ ] Configurar alertas (email/telegram)
- [ ] Documentar procedimentos

---

## 🚀 Roadmap Técnico - Enterprise Edition

### Fase 1: Core On-Prem (2-3 meses)
- [ ] Static scanner com 50+ checks
- [ ] Sandbox containerizado
- [ ] Policy engine YAML
- [ ] Runtime hooks OpenClaw
- [ ] Update assinado
- [ ] CLI completo

### Fase 2: Console Cloud (1-2 meses)
- [ ] Portal de regras (Lovable)
- [ ] Sistema de licenciamento
- [ ] Updates automáticos
- [ ] Dashboard básico

### Fase 3: ML & Analytics (2-3 meses)
- [ ] Honeypots próprios
- [ ] ML em dados sintéticos
- [ ] Detecção de anomalias
- [ ] Correlação de ameaças

### Fase 4: Enterprise Integrations (3-6 meses)
- [ ] SIEM integrations (Splunk, Datadog)
- [ ] SSO (SAML, OIDC)
- [ ] RBAC granular
- [ ] Compliance reporting
- [ ] API REST completa

---

## 💡 Diferenciais Competitivos

1. **On-Prem by Design** - Não é retrofit, é arquitetura
2. **Zero-Trust Cloud** - Nunca vemos seus dados
3. **Supply Chain Security** - Updates paranóicos
4. **Open Source Core** - Auditável, transparente
5. **Enterprise Integrations** - SIEM, SSO, compliance

---

## 📄 Licença & Preços

### ClawShield Core
- **Licença:** Apache 2.0 (open source)
- **Inclui:** Scanner, Policy Engine, Hooks
- **Custo:** Grátis

### ClawShield Pro
- **Licença:** Commercial
- **Inclui:** Sandbox, Updates automáticos, Suporte
- **Custo:** R$ 299/mês por gateway

### ClawShield Enterprise
- **Licença:** Commercial + SLA
- **Inclui:** Tudo + SIEM, SSO, Compliance, On-prem deploy
- **Custo:** A partir de R$ 2.000/mês

---

**Status:** Arquitetura Enterprise v1.0  
**Autores:** Orion / Gustavo / GPT-4  
**Data:** 2026-02-05  
**Próximo passo:** Implementação do Core On-Prem
