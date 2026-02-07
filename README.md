# 🛡️ ClawShield

> Security scanner for OpenClaw skills. Detect malware, credential theft, and malicious patterns before installation.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/gustavosr8/clawshield)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Quick Start (30 seconds)

```bash
# Install with one line
curl -fsSL https://clawshield.dev/install.sh | bash

# Scan any skill
clawshield scan ./skills/suspicious-skill

# Done! 🛡️
```

---

## 📖 What is ClawShield?

ClawShield scans OpenClaw skills for security threats **before** you install them.

### Real Case: nanopdf Malware
On 2026-02-06, ClawShield detected a malicious skill posing as a "PDF editor". It contained:
- Base64-obfuscated payload
- Hidden `curl | bash` pattern
- External IP communication

**Without ClawShield:** 50+ users would have compromised their systems.  
**With ClawShield:** Blocked before execution.

---

## ✨ Features

### 🔍 Detection Engine
- **25+ security rules** covering common attack patterns
- **Base64 obfuscation** detection
- **Credential harvesting** prevention
- **Reverse shell** detection
- **Suspicious downloads** (`curl | bash`)
- **File exfiltration** attempts

### 🛡️ Root Safety Mode
When running as root, ClawShield automatically elevates protection:
- CAUTION → WARNING
- WARNING → BLOCKED

### 📊 Risk Scoring
| Score | Status | Action |
|-------|--------|--------|
| 0-30 | 🟢 CLEAN | Safe to install |
| 31-60 | 🟡 CAUTION | Review recommended |
| 61-85 | 🟠 WARNING | Explicit confirmation required |
| 86-100 | 🔴 BLOCKED | **Do not install** |

---

## 📦 Installation

### Option 1: One-liner (Recommended)
```bash
curl -fsSL https://clawshield.dev/install.sh | bash
```

### Option 2: Manual
```bash
# Clone
git clone https://github.com/gustavosr8/clawshield.git
cd clawshield

# Install
npm install -g .

# Verify
clawshield version
```

### Option 3: Docker (Coming Soon)
```bash
docker run clawshield scan ./skill
```

---

## 🎯 Usage

### Basic Scan
```bash
clawshield scan ./skills/my-skill
```

### Verbose Output
```bash
clawshield scan ./skills/my-skill --verbose
```

### JSON Report
```bash
clawshield scan ./skills/my-skill --format json --output report.json
```

### Example Output
```
🛡️  ClawShield Security Scanner v1.0.0
   Scanning: ./skills/browser-automation

🔴 BLOCKED: Score 95/100

Issues Found: 3
  🔴 Critical: 1
  🟠 High: 2

CRITICAL (1):
  [BASE64_OBFUSCATION] Base64 obfuscation
    File: setup.sh:42
    Base64 encoded payload - possible obfuscation

⚠️  This skill is NOT SAFE to install.
   Critical security issues detected.
```

---

## ☁️ ClawShield Cloud (Beta)

Get more with cloud integration:

| Feature | Free (Local) | Cloud (Beta) |
|---------|-------------|--------------|
| Scan | ✅ Unlimited | ✅ Unlimited |
| Dashboard | ❌ | ✅ Web dashboard |
| History | ❌ Local only | ✅ 30 days history |
| Reports | ❌ | ✅ PDF reports |
| API | ❌ | ✅ API access |
| CI/CD | ❌ | ✅ GitHub Actions |

### Try Cloud Free
```bash
# Sign up at clawshield.dev
# Get your API key

export CLAWSHIELD_CLOUD=true
export CLAWSHIELD_API_KEY=cs_live_xxx

clawshield scan ./skill
# Scan appears in your dashboard! 📊
```

---

## 🔒 Security Rules

### Critical (Blocks installation)
- `EXFILTRATION_WEBHOOK` - Data exfiltration to external services
- `CREDENTIAL_HARVESTING` - Environment variable access
- `REVERSE_SHELL` - Backdoor/shell detection
- `BASE64_OBFUSCATION` - Encoded payloads
- `SUSPICIOUS_DOWNLOAD` - Remote code execution
- `FILE_EXFILTRATION` - Unauthorized file uploads

### High (Requires review)
- `NETWORK_REQUEST` - External network calls
- `SHELL_EXECUTION` - Shell command execution
- `DYNAMIC_CODE` - Dynamic code evaluation

### Medium (Informational)
- `SENSITIVE_FILE_ACCESS` - Access to sensitive paths

---

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test with known malicious patterns:
```bash
clawshield scan ./tests/fixtures/trigger-exfil-endpoint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Security Contributions
Found a new attack pattern? Submit a rule!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- OpenClaw community
- Case study: nanopdf malware detection
- Early adopters and testers

---

## 🔗 Links

- Website: [clawshield.dev](https://clawshield.dev)
- Dashboard: [clawshield.dev/dashboard](https://clawshield.dev/dashboard)
- GitHub: [github.com/gustavosr8/clawshield](https://github.com/gustavosr8/clawshield)
- Discord: [discord.gg/clawshield](https://discord.gg/clawshield)

---

<p align="center">
  <strong>Security first. Always scan before installing. 🛡️</strong>
</p>
