# 🛡️ CLAWSHIELD - Arquitetura Técnica

## Visão Geral

ClawShield é uma camada de segurança nativa para o ecossistema OpenClaw que fornece **Endpoint Detection and Response (EDR)** para agentes de IA. Transforma segurança reativa em proativa, protegendo contra skills maliciosas, exfiltração de dados e comportamentos anômalos.

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAWSHIELD ENTERPRISE                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Dashboard & Analytics                              │
│  • Métricas de segurança em tempo real                       │
│  • Histórico de ameaças                                      │
│  • Compliance reporting                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Policy Engine (Firewall de Agente)                 │
│  • Regras declarativas (allow/deny/rate-limit)               │
│  • Bloqueio de comportamentos suspeitos                      │
│  • Whitelist/Blacklist dinâmica                              │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Sandbox de Execução                                │
│  • Agent clone isolado                                       │
│  • Workspace descartável                                     │
│  • Ferramentas mockadas                                      │
│  • Análise comportamental                                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Scanner Estático (Static Analysis)                 │
│  • AST parsing de SKILL.md e scripts                         │
│  • Detecção de padrões maliciosos                            │
│  • Análise de dependências                                   │
│  • Score de risco (0-100)                                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Hooks de Runtime                                   │
│  • Interceptação de chamadas de ferramentas                  │
│  • Logging de ações em tempo real                            │
│  • Alertas imediatos                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Componentes Detalhados

### 1. HOOKS DE RUNTIME (Layer 1)

**Propósito:** Interceptar e logar todas as ações do agente em tempo real.

**Implementação:**
```javascript
// clawshield-runtime-hook.js
class ClawShieldRuntimeHook {
  constructor(policy) {
    this.policy = policy;
    this.logger = new SecurityLogger();
  }

  async interceptToolCall(toolName, params) {
    // Verificar contra policy
    const decision = this.policy.evaluate(toolName, params);
    
    if (decision.action === 'BLOCK') {
      this.logger.alert('BLOCKED_CALL', { toolName, params, reason: decision.reason });
      throw new SecurityException(`Blocked: ${decision.reason}`);
    }
    
    if (decision.action === 'RATE_LIMIT') {
      await this.enforceRateLimit(toolName, params);
    }
    
    // Log da ação
    this.logger.log({ toolName, params, timestamp: Date.now() });
    
    return decision.action === 'ALLOW';
  }
}
```

**Eventos Monitorados:**
- `exec` - comandos shell
- `write/edit` - operações em arquivos
- `web_fetch/web_search` - acesso à internet
- `message` - envio de mensagens
- `browser` - automação de browser
- `cron` - agendamento de tarefas

---

### 2. SCANNER ESTÁTICO (Layer 2)

**Propósito:** Analisar código antes da execução.

**Checks Implementados:**

#### 2.1 Detecção de Exfiltração
```bash
# Padrões detectados
- curl/wget com POST para domínios externos
- base64 encoding de dados sensíveis
- upload de arquivos para serviços de terceiros
```

#### 2.2 Análise de Credenciais
```bash
# Padrões detectados  
- Acesso a ~/.env, .env.local
- Leitura de oauth.json, tokens
- Uso de process.env sem sanitização
```

#### 2.3 Comandos Perigosos
```bash
# Padrões detectados
- rm -rf /
- curl | bash (pipe to shell)
- wget + chmod +x + exec
- reverse shells (nc, bash -i)
```

#### 2.4 Escopo de Acesso
```bash
# Padrões detectados
- Escrita fora do workspace
- Acesso a /etc, /root, /home
- Modificação de arquivos de sistema
```

**Score de Risco:**
```
0-30:   🟢 Baixo risco (CLEAN)
31-60:  🟡 Médio risco (CAUTION) 
61-85:  🟠 Alto risco (WARNING)
86-100: 🔴 Crítico (BLOCKED)
```

---

### 3. SANDBOX DE EXECUÇÃO (Layer 3)

**Propósito:** Executar skills em ambiente isolado antes de produção.

**Arquitetura do Sandbox:**
```yaml
Sandbox Config:
  agent:
    type: "clone"           # Clona config do agent principal
    session: "isolated"     # Sessão isolada
    channels: []            # Sem acesso a canais reais
    
  workspace:
    type: "tmpfs"           # Filesystem temporário
    size: "100MB"           # Limite de espaço
    persist: false          # Descartável
    
  network:
    mode: "mock"            # Ferramentas de rede mockadas
    allowlist: []           # Sem acesso externo real
    
  tools:
    exec: "mock"            # Comandos logados mas não executados
    write: "tmp_only"       # Só escreve em /tmp/sandbox
    message: "intercept"    # Intercepta mensagens
```

**Análise Comportamental:**
```javascript
// behavioral-analysis.js
class BehavioralAnalyzer {
  analyze(executionLog) {
    return {
      // Quais ferramentas foram usadas
      toolsUsed: this.extractTools(executionLog),
      
      // Padrão de comportamento
      behaviorPattern: this.classifyBehavior(executionLog),
      
      // Tentativas suspeitas
      suspiciousAttempts: this.detectAnomalies(executionLog),
      
      // Score comportamental (0-100)
      riskScore: this.calculateRisk(executionLog),
      
      // Recomendação
      recommendation: this.generateRecommendation(executionLog)
    };
  }
}
```

---

### 4. POLICY ENGINE (Layer 4)

**Propósito:** Firewall de agente com regras declarativas.

**Sintaxe de Regras:**
```yaml
# clawshield-policy.yaml
version: "1.0"
policies:
  # Bloquear POST para IPs não-whitelisted
  - name: "block_external_post"
    condition:
      tool: "web_fetch"
      method: "POST"
      url: "!whitelist"
    action: "BLOCK"
    severity: "HIGH"
    
  # Limitar base64 encoding > 1KB
  - name: "limit_base64"
    condition:
      tool: "exec"
      command: "*base64*"
      size: "> 1024"
    action: "BLOCK"
    severity: "CRITICAL"
    
  # Rate limit em execuções
  - name: "rate_limit_exec"
    condition:
      tool: "exec"
      count: "> 10/min"
    action: "RATE_LIMIT"
    cooldown: "60s"
    
  # Alertar em acesso a env
  - name: "alert_env_access"
    condition:
      tool: "read"
      path: "*.env*"
    action: "ALERT"
    notify: ["admin"]
```

**Tipos de Ação:**
- `ALLOW` - Permitir execução
- `BLOCK` - Bloquear e alertar
- `RATE_LIMIT` - Limitar frequência
- `ALERT` - Permitir mas notificar
- `SANDBOX` - Executar em sandbox

---

### 5. DASHBOARD & ANALYTICS (Layer 5)

**Métricas Principais:**

```javascript
// dashboard-metrics.js
const SecurityMetrics = {
  // Tempo real
  activeThreats: 0,
  blockedAttempts: 0,
  sandboxExecutions: 0,
  
  // Histórico
  totalScans: 0,
  cleanSkills: 0,
  flaggedSkills: 0,
  blockedSkills: 0,
  
  // Performance
  avgScanTime: "0ms",
  falsePositiveRate: "0%",
  
  // Compliance
  lastAudit: null,
  complianceScore: 0
};
```

**Alertas:**
```javascript
const AlertTypes = {
  CRITICAL: {
    icon: "🚨",
    channels: ["email", "sms", "telegram"],
    escalation: "immediate"
  },
  HIGH: {
    icon: "⚠️",
    channels: ["email", "telegram"],
    escalation: "5min"
  },
  MEDIUM: {
    icon: "⚡",
    channels: ["telegram"],
    escalation: "30min"
  },
  LOW: {
    icon: "ℹ️",
    channels: ["dashboard"],
    escalation: "none"
  }
};
```

---

## 🔄 Fluxo de Trabalho

### Instalação de Nova Skill

```
1. Usuario: clawhub install nova-skill
   ↓
2. ClawShield Hook: Intercepta instalação
   ↓
3. Static Scanner: Analisa código
   ├─ Score < 30 → Aprova imediato
   ├─ Score 30-60 → Alerta, permite com confirmação
   ├─ Score 60-85 → Requer sandbox
   └─ Score > 85 → Bloqueia
   ↓
4. Sandbox (se necessário): Executa em ambiente isolado
   ↓
5. Behavioral Analysis: Gera relatório
   ↓
6. Policy Engine: Aplica regras personalizadas
   ↓
7. Dashboard: Atualiza métricas
   ↓
8. Usuario: Recebe relatório de segurança
```

### Execução em Runtime

```
1. Skill tenta executar ferramenta
   ↓
2. Runtime Hook: Intercepta chamada
   ↓
3. Policy Check: Verifica regras
   ├─ BLOCK → Aborta + Alerta
   ├─ RATE_LIMIT → Delay + Log
   └─ ALLOW → Prossegue
   ↓
4. Logging: Registra ação
   ↓
5. Anomaly Detection: Detecta padrões anômalos
   ↓
6. Dashboard: Atualiza em tempo real
```

---

## 📦 Estrutura do Projeto

```
clawshield/
├── README.md
├── SKILL.md
├── package.json
├── src/
│   ├── core/
│   │   ├── runtime-hook.js      # Layer 1
│   │   ├── static-scanner.js    # Layer 2
│   │   ├── sandbox.js           # Layer 3
│   │   └── policy-engine.js     # Layer 4
│   ├── analyzers/
│   │   ├── ast-analyzer.js
│   │   ├── behavioral-analyzer.js
│   │   └── risk-calculator.js
│   ├── rules/
│   │   ├── exfiltration-rules.yaml
│   │   ├── credential-rules.yaml
│   │   └── system-rules.yaml
│   ├── dashboard/
│   │   ├── server.js
│   │   └── public/
│   └── utils/
│       ├── logger.js
│       └── exceptions.js
├── scripts/
│   ├── install-hooks.sh
│   └── safe-install.sh
└── tests/
    ├── fixtures/
    │   ├── malicious-skills/
    │   └── benign-skills/
    └── integration/
```

---

## 🔌 Integração com OpenClaw

### Hook de Instalação

```javascript
// .openclaw/hooks/pre-skill-install.js
const { ClawShield } = require('clawshield');

module.exports = async function(skillPath) {
  const shield = new ClawShield();
  
  // Scan estático
  const scanResult = await shield.scan(skillPath);
  
  if (scanResult.score > 85) {
    throw new Error(`Skill bloqueada: ${scanResult.reasons.join(', ')}`);
  }
  
  if (scanResult.score > 60) {
    // Sandbox
    const sandboxResult = await shield.sandbox(skillPath);
    if (sandboxResult.riskScore > 70) {
      throw new Error('Comportamento suspeito detectado no sandbox');
    }
  }
  
  return true; // Aprova instalação
};
```

### Configuração do Gateway

```yaml
# openclaw-gateway.yaml
security:
  clawshield:
    enabled: true
    mode: "strict"  # strict | permissive | audit-only
    
    policies:
      - path: "./clawshield-policies.yaml"
      
    alerts:
      telegram:
        bot_token: "${TELEGRAM_BOT_TOKEN}"
        chat_id: "${SECURITY_CHAT_ID}"
      email:
        smtp: "${SMTP_CONFIG}"
        
    dashboard:
      enabled: true
      port: 18790
      auth: true
```

---

## 🚀 Roadmap Técnico

### MVP (2-3 semanas)
- [ ] Scanner estático básico (regras skillvet + extras)
- [ ] Score de risco (0-100)
- [ ] CLI simples: `clawshield scan <skill>`
- [ ] Integração com `clawhub install`

### v1.0 Pro (1-2 meses)
- [ ] Sandbox com agent clone
- [ ] Análise comportamental
- [ ] Policy engine com YAML
- [ ] Dashboard web básico
- [ ] Sistema de alertas (Telegram/Email)

### v2.0 Enterprise (3-6 meses)
- [ ] Firewall de agente completo
- [ ] Análise em tempo real
- [ ] Compliance reporting
- [ ] API REST
- [ ] Multi-tenant (SaaS)
- [ ] Blacklist/Whitelist comunitária

### v3.0 Platform (6-12 meses)
- [ ] Marketplace de regras de segurança
- [ ] ML para detecção de anomalias
- [ ] Integração com SIEMs enterprise
- [ ] Certificações de segurança (SOC2, ISO)

---

## 💡 Diferenciais Competitivos

1. **Nativo OpenClaw** - Não é external, é parte do ecossistema
2. **EDR para Agentes** - Primeiro do tipo focado em IA agents
3. **Comunidade** - Crowd-sourced threat intelligence
4. **Enterprise-ready** - Compliance, relatórios, auditoria
5. **Sem lock-in negativo** - Open source core, SaaS opcional

---

## ⚠️ Considerações de Segurança

### Ameaças ao Próprio ClawShield

| Ameaça | Mitigação |
|--------|-----------|
| Bypass do hook | Assinatura digital de hooks |
| Tampering no scanner | Checksum verification |
| Ataque ao dashboard | Auth 2FA, rate limiting |
| Falso positivo | ML refinement + appeals |

### Privacidade
- Análise local por padrão
- Dados só saem se usuário optar (comunidade)
- Zero knowledge para versão enterprise

---

## 📄 Licença & Modelo de Negócio

```
Core (Open Source):
├── Static Scanner
├── Basic Policy Engine
└── CLI

Pro (SaaS/Paid):
├── Sandbox
├── Dashboard
├── Advanced Policies
├── Compliance Reports
└── Priority Support

Enterprise (Custom):
├── On-premise deployment
├── Custom integrations
├── Dedicated support
└── SLAs
```

---

**Status:** Arquitetura v1.0  
**Autores:** Orion / Gustavo  
**Data:** 2026-02-05
