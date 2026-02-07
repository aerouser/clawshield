# 🛡️ ClawShield MVP v0.1.0

**Security Scanner for OpenClaw Skills**

Detect malware, credential theft, and malicious patterns before installing skills.

---

## 🚀 Quick Start

### Installation
```bash
# Clone or copy to /root/.openclaw/workspace/projects/clawshield
# Commands are automatically linked to /usr/local/bin/
```

### Scan Only (Check security)
```bash
# Quick scan (alias)
cs /path/to/skill

# Full command
clawshield scan /path/to/skill

# With verbose output
clawshield scan /path/to/skill --verbose

# Save JSON report
clawshield scan /path/to/skill --output report.json --format json
```

### Secure Install (Scan + Install)
```bash
# Install with automatic security scan
clawshield-install rememberall

# Dry run (scan only, don't install)
clawshield-install rememberall --dry-run

# Allow CAUTION level (less strict)
clawshield-install some-skill --fail-on CAUTION

# Force install even if blocked (DANGEROUS!)
clawshield-install some-skill --force
```

### Available Commands
| Command | Function |
|---------|----------|
| `cs <path>` | Quick scan (shortcut) |
| `clawshield scan <path>` | Full security scan |
| `clawshield-install <skill>` | Scan + install |
| `clawshield --help` | Show help |
| `clawshield-install --help` | Show install help |

---

## 📊 Risk Score

| Score | Status | Icon | Meaning |
|-------|--------|------|---------|
| 0-30 | 🟢 CLEAN | Safe to install | No significant issues |
| 31-60 | 🟡 CAUTION | Review recommended | Some suspicious patterns |
| 61-85 | 🟠 WARNING | Review required | High-risk patterns detected |
| 86-100 | 🔴 BLOCKED | NOT SAFE | Critical security issues |

---

## 🔍 Security Checks

### Critical (Score +10 each)
- ✅ Exfiltration to external webhooks
- ✅ Credential harvesting (env vars, .env files)
- ✅ Reverse shell / backdoor detection
- ✅ Base64 obfuscation
- ✅ Suspicious download & execute
- ✅ File exfiltration

### High (Score +5 each)
- ⚠️ External network requests
- ⚠️ Shell command execution
- ⚠️ Dynamic code execution (eval, new Function)

### Medium (Score +2 each)
- ℹ️ Sensitive file access (.ssh, .aws, tokens)

---

## 📁 Project Structure

```
clawshield/
├── bin/
│   └── clawshield.js          # CLI entry point
├── src/
│   └── scanner/
│       └── engine.js          # Core scanning engine
├── rules/
│   └── security-rules.yaml    # Rule definitions
├── tests/
│   └── (test files)
├── package.json
└── README.md
```

---

## 🎯 Usage Examples

### Scan a skill
```bash
$ node bin/clawshield.js scan ../skills/suspicious-skill

🛡️  ClawShield Security Scanner v0.1.0
   Scanning: ../skills/suspicious-skill

============================================================
🔴 SECURITY SCAN REPORT
============================================================

Status:        BLOCKED
Risk Score:    95/100
Files Scanned: 3
Issues Found:  5

Breakdown:
  🔴 Critical: 3
  🟠 High:     2
  🟡 Medium:   0

Duration:      45ms

============================================================

📋 DETAILED FINDINGS:

CRITICAL (3):
  [EXFILTRATION_WEBHOOK] Exfiltration to external webhook
    File: index.js:15
    Detected potential data exfiltration to external service

  [CREDENTIAL_HARVESTING] Credential harvesting
    File: run.sh:8
    Attempting to access environment variables

  [REVERSE_SHELL] Reverse shell detection
    File: index.js:42
    Potential reverse shell or backdoor

...

⚠️  This skill is NOT SAFE to install.
   Critical security issues detected.
```

---

## 🛣️ Roadmap

### v0.1.0 (MVP) ✅
- [x] Basic static scanner
- [x] CLI interface
- [x] Risk scoring (0-100)
- [x] 15+ security checks
- [x] JSON/text output

### v0.2.0 (Next)
- [ ] YAML rule configuration
- [ ] Integration with `clawhub install`
- [ ] More file types support
- [ ] AST analysis (deeper inspection)

### v1.0.0 (Pro)
- [ ] Sandbox execution
- [ ] Behavioral analysis
- [ ] Policy engine
- [ ] Dashboard

---

## 🤝 Contributing

This is an MVP. Contributions welcome!

---

## 📜 License

MIT License - See LICENSE file

---

**Built with 🦞 for the OpenClaw community**
