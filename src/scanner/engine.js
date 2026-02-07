#!/usr/bin/env node
/**
 * ClawShield - Security Scanner for OpenClaw Skills
 * MVP v0.2.0 - With .clawshieldignore support
 * 
 * Scans skill directories for malicious patterns,
 * credential theft attempts, and security vulnerabilities.
 * Supports security tools with intentional pattern declarations.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load security rules
const RULES = {
  critical: [
    {
      id: 'EXFILTRATION_WEBHOOK',
      name: 'Exfiltration to external webhook',
      pattern: /webhook\.site|requestbin|hookbin|ngrok\.io.*POST|curl.*https:\/\/[^\s]*data/gi,
      severity: 100,
      description: 'Detected potential data exfiltration to external service'
    },
    {
      id: 'CREDENTIAL_HARVESTING',
      name: 'Credential harvesting',
      pattern: /process\.env\[|\.env\.|os\.environ|cat.*\.env|printenv|getenv/gi,
      severity: 95,
      description: 'Attempting to access environment variables or credentials'
    },
    {
      id: 'REVERSE_SHELL',
      name: 'Reverse shell detection',
      pattern: /nc\s+-e|bash\s+-i|\/bin\/sh.*-i|socket.*connect.*shell|subprocess.*shell/gi,
      severity: 100,
      description: 'Potential reverse shell or backdoor'
    },
    {
      id: 'BASE64_OBFUSCATION',
      name: 'Base64 obfuscation',
      pattern: /base64\s+-d|atob\(|Buffer\.from.*['"]base64['"]|b64decode/gi,
      severity: 85,
      description: 'Base64 encoded payload - possible obfuscation'
    },
    {
      id: 'SUSPICIOUS_DOWNLOAD',
      name: 'Suspicious download and execute',
      pattern: /curl.*\|.*bash|wget.*\|.*sh|curl.*\|.*python|download.*execute/gi,
      severity: 95,
      description: 'Downloading and executing code from remote source'
    },
    {
      id: 'FILE_EXFILTRATION',
      name: 'File exfiltration',
      pattern: /curl.*-F.*file|scp.*@|rsync.*@|upload.*http.*file/gi,
      severity: 90,
      description: 'Uploading files to external servers'
    }
  ],
  high: [
    {
      id: 'NETWORK_REQUEST',
      name: 'External network request',
      pattern: /fetch\(|axios\.|request\(|curl|wget|http\.get/gi,
      severity: 70,
      description: 'Making external network requests'
    },
    {
      id: 'SHELL_EXECUTION',
      name: 'Shell command execution',
      pattern: /exec\(|execSync|spawn\(|shell_exec|system\(/gi,
      severity: 65,
      description: 'Executing shell commands'
    },
    {
      id: 'DYNAMIC_CODE',
      name: 'Dynamic code execution',
      pattern: /eval\(|new Function\(|setTimeout\(['"`].*['"`]|setInterval\(['"`]/gi,
      severity: 60,
      description: 'Executing dynamic code'
    }
  ],
  medium: [
    {
      id: 'SENSITIVE_FILE_ACCESS',
      name: 'Sensitive file access',
      pattern: /\.ssh\/|\.aws\/|\.docker\/|token|secret|key|password/gi,
      severity: 45,
      description: 'Accessing potentially sensitive files'
    }
  ]
};

/**
 * Check if running as root
 */
function isRunningAsRoot() {
  try {
    return process.getuid && process.getuid() === 0;
  } catch (e) {
    return false;
  }
}

class ClawShieldScanner {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      maxFileSize: options.maxFileSize || 1048576, // 1MB
      maxFiles: options.maxFiles || 100,
      rootSafetyMode: options.rootSafetyMode !== false, // Enable by default
      ...options
    };
    
    // Root Safety Mode: Auto-enable when running as root
    this.isRoot = isRunningAsRoot();
    this.rootSafetyActive = this.isRoot && this.options.rootSafetyMode;
    
    this.results = {
      filesScanned: 0,
      issuesFound: [],
      score: 0,
      duration: 0,
      intentionalPatterns: false,
      securityToolInfo: null,
      rootSafetyMode: this.rootSafetyActive
    };
    this.ignoredRules = new Set();
  }

  /**
   * Load .clawshieldignore file
   */
  _loadClawShieldIgnore(skillPath) {
    const ignoreFile = path.join(skillPath, '.clawshieldignore');
    
    if (!fs.existsSync(ignoreFile)) {
      return null;
    }
    
    const content = fs.readFileSync(ignoreFile, 'utf8');
    const config = {
      isSecurityTool: false,
      ignoredRules: [],
      reason: '',
      tool: ''
    };
    
    // Parse YAML-like structure
    const lines = content.split('\n');
    let inIgnoreSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for security tool declaration
      if (trimmed.match(/^is_security_tool:\s*true/i)) {
        config.isSecurityTool = true;
      }
      
      // Get tool name
      if (trimmed.startsWith('tool:')) {
        config.tool = trimmed.replace('tool:', '').trim();
      }
      
      // Get reason
      if (trimmed.startsWith('reason:')) {
        config.reason = trimmed.replace('reason:', '').trim().replace(/^["']|["']$/g, '');
      }
      
      // Check if we're in ignore section
      if (trimmed === 'ignore:') {
        inIgnoreSection = true;
        continue;
      }
      
      // Collect ignored rules
      if (inIgnoreSection && trimmed.startsWith('- ')) {
        const ruleId = trimmed.replace('- ', '').trim().split(/\s+#/)[0].trim();
        config.ignoredRules.push(ruleId);
        this.ignoredRules.add(ruleId);
      }
      
      // End of ignore section
      if (inIgnoreSection && !trimmed.startsWith('- ') && trimmed !== '' && !trimmed.startsWith('#')) {
        inIgnoreSection = false;
      }
    }
    
    return config;
  }

  /**
   * Scan a skill directory
   */
  async scan(skillPath) {
    const startTime = Date.now();
    
    console.log(`\n🛡️  ClawShield Security Scanner v0.2.0`);
    
    // Root Safety Mode banner
    if (this.rootSafetyActive) {
      console.log(`\n   ⚠️  ROOT SAFETY MODE ACTIVE`);
      console.log(`   Running as root with enhanced security policies.`);
      console.log(`   CAUTION → WARNING | WARNING → BLOCKED\n`);
    }
    
    console.log(`   Scanning: ${skillPath}\n`);

    if (!fs.existsSync(skillPath)) {
      throw new Error(`Path not found: ${skillPath}`);
    }

    // Load .clawshieldignore if exists
    const ignoreConfig = this._loadClawShieldIgnore(skillPath);
    if (ignoreConfig && ignoreConfig.isSecurityTool) {
      console.log(`   🔍 Security tool detected: ${ignoreConfig.tool || 'unknown'}`);
      console.log(`   ℹ️  Reason: ${ignoreConfig.reason || 'Intentional security patterns'}\n`);
      this.results.securityToolInfo = ignoreConfig;
    }

    const files = this._getFilesToScan(skillPath);
    
    for (const file of files) {
      await this._scanFile(file);
    }

    this.results.duration = Date.now() - startTime;
    this.results.score = this._calculateScore();
    
    // Mark if this is a security tool with intentional patterns
    if (ignoreConfig && ignoreConfig.isSecurityTool && this.results.issuesFound.length > 0) {
      this.results.intentionalPatterns = true;
    }

    return this._generateReport();
  }

  /**
   * Get list of files to scan
   */
  _getFilesToScan(dir) {
    const files = [];
    const ignorePatterns = ['node_modules', '.git', 'tests', 'test', '__pycache__', '.pytest_cache'];
    
    const walk = (currentDir) => {
      if (files.length >= this.options.maxFiles) return;
      
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          if (!ignorePatterns.includes(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.js', '.ts', '.sh', '.py', '.md', '.json', '.yaml', '.yml'].includes(ext)) {
            const stats = fs.statSync(fullPath);
            if (stats.size <= this.options.maxFileSize) {
              files.push(fullPath);
            }
          }
        }
      }
    };
    
    walk(dir);
    return files;
  }

  /**
   * Scan a single file
   */
  async _scanFile(filePath) {
    this.results.filesScanned++;
    
    if (this.options.verbose) {
      console.log(`   Scanning: ${path.basename(filePath)}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Check all rules
    for (const [severity, rules] of Object.entries(RULES)) {
      for (const rule of rules) {
        // Skip if this rule is in .clawshieldignore
        const isIgnored = this.ignoredRules.has(rule.id);
        
        const matches = content.match(rule.pattern);
        
        if (matches) {
          const issue = {
            ruleId: rule.id,
            ruleName: rule.name,
            severity: isIgnored ? 'INFO' : severity.toUpperCase(),
            originalSeverity: severity.toUpperCase(),
            severityValue: isIgnored ? 0 : rule.severity,
            file: relativePath,
            line: this._getLineNumber(content, matches[0]),
            description: rule.description,
            match: matches[0].substring(0, 100),
            intentional: isIgnored
          };
          
          this.results.issuesFound.push(issue);
        }
      }
    }
  }

  /**
   * Get line number for a match
   */
  _getLineNumber(content, match) {
    const index = content.indexOf(match);
    if (index === -1) return 0;
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Apply Root Safety Mode status transformations
   * In root mode: CAUTION -> WARNING, WARNING -> BLOCKED
   */
  _applyRootSafetyStatus(status) {
    if (status === 'CAUTION') {
      return 'WARNING';
    } else if (status === 'WARNING') {
      return 'BLOCKED';
    }
    return status;
  }

  /**
   * Calculate risk score
   */
  _calculateScore() {
    let score = 0;
    
    for (const issue of this.results.issuesFound) {
      if (issue.intentional) continue; // Don't count intentional patterns
      
      // Root Safety Mode: weight issues more heavily
      const multiplier = this.rootSafetyActive ? 1.5 : 1;
      
      if (issue.severity === 'CRITICAL') score += 10 * multiplier;
      else if (issue.severity === 'HIGH') score += 5 * multiplier;
      else if (issue.severity === 'MEDIUM') score += 2 * multiplier;
      else score += 1 * multiplier;
    }
    
    // Cap at 100
    return Math.min(Math.round(score), 100);
  }

  /**
   * Generate scan report
   */
  _generateReport() {
    let score = this.results.score;
    const hasIntentional = this.results.intentionalPatterns;
    let status, icon, color;
    
    // Apply Root Safety Mode boost FIRST (before status determination)
    // This ensures status reflects the boosted score
    let finalScore = score;
    if (this.rootSafetyActive) {
      finalScore = Math.min(Math.round(score * 1.5), 100);
    }
    
    // Determine status based on FINAL score (after any boost)
    // Note: Order matters - check from highest to lowest
    if (finalScore >= 86) {
      status = 'BLOCKED';
      icon = '🔴';
      color = '\x1b[31m';
    } else if (finalScore >= 61) {
      status = 'WARNING';
      icon = '🟠';
      color = '\x1b[33m';
    } else if (finalScore >= 31) {
      status = 'CAUTION';
      icon = '🟡';
      color = '\x1b[33m';
    } else {
      // finalScore < 31
      status = 'CLEAN';
      icon = hasIntentional ? '🔍' : '🟢';
      color = '\x1b[32m';
    }
    
    // Apply Root Safety Mode status transformations (CAUTION->WARNING, WARNING->BLOCKED)
    const finalStatus = this.rootSafetyActive ? this._applyRootSafetyStatus(status) : status;

    const reset = '\x1b[0m';

    const report = {
      summary: {
        status: finalStatus,
        score: finalScore,
        icon,
        filesScanned: this.results.filesScanned,
        issuesFound: this.results.issuesFound.length,
        intentionalPatterns: this.results.intentionalPatterns,
        securityTool: this.results.securityToolInfo?.tool || null,
        criticalIssues: this.results.issuesFound.filter(i => i.severity === 'CRITICAL' && !i.intentional).length,
        highIssues: this.results.issuesFound.filter(i => i.severity === 'HIGH' && !i.intentional).length,
        mediumIssues: this.results.issuesFound.filter(i => i.severity === 'MEDIUM' && !i.intentional).length,
        infoIssues: this.results.issuesFound.filter(i => i.severity === 'INFO').length,
        duration: `${this.results.duration}ms`,
        rootSafetyMode: this.rootSafetyActive,
        runningAsRoot: this.isRoot
      },
      issues: this.results.issuesFound,
      formatted: this._formatReport(finalStatus, finalScore, icon, color, reset, hasIntentional)
    };

    return report;
  }

  /**
   * Format report for console output
   */
  _formatReport(status, score, icon, color, reset, hasIntentional) {
    let output = '\n' + '='.repeat(60) + '\n';
    output += `${icon} SECURITY SCAN REPORT\n`;
    output += '='.repeat(60) + '\n\n';
    
    // Root Safety Mode indicator
    if (this.rootSafetyActive) {
      output += `⚠️  ROOT SAFETY MODE: ACTIVE\n`;
      output += `   Enhanced security policies applied (running as root)\n\n`;
    }
    
    output += `Status:        ${color}${status}${reset}\n`;
    output += `Risk Score:    ${color}${score}/100${reset}\n`;
    output += `Files Scanned: ${this.results.filesScanned}\n`;
    output += `Issues Found:  ${this.results.issuesFound.length}\n`;
    
    if (hasIntentional) {
      output += `\n🔍 Security tool with intentional patterns detected\n`;
      output += `   Intentional patterns: ${this.results.issuesFound.filter(i => i.intentional).length}\n`;
    }
    
    if (this.results.issuesFound.length > 0) {
      output += `\nBreakdown:\n`;
      const realIssues = this.results.issuesFound.filter(i => !i.intentional);
      output += `  🔴 Critical: ${realIssues.filter(i => i.severity === 'CRITICAL').length}\n`;
      output += `  🟠 High:     ${realIssues.filter(i => i.severity === 'HIGH').length}\n`;
      output += `  🟡 Medium:   ${realIssues.filter(i => i.severity === 'MEDIUM').length}\n`;
      output += `  ℹ️  Info:     ${this.results.issuesFound.filter(i => i.severity === 'INFO').length} (intentional patterns)\n`;
    }
    
    output += `\nDuration:      ${this.results.duration}ms\n`;
    output += '\n' + '='.repeat(60) + '\n';

    if (this.results.issuesFound.length > 0) {
      output += '\n📋 DETAILED FINDINGS:\n\n';
      
      const grouped = this._groupIssuesBySeverity();
      
      for (const severity of ['CRITICAL', 'HIGH', 'MEDIUM', 'INFO']) {
        if (grouped[severity]) {
          const label = severity === 'INFO' ? 'INTENTIONAL SECURITY PATTERNS' : severity;
          output += `${label} (${grouped[severity].length}):\n`;
          for (const issue of grouped[severity]) {
            const intentional = issue.intentional ? ' [intentional]' : '';
            output += `  [${issue.ruleId}] ${issue.ruleName}${intentional}\n`;
            output += `    File: ${issue.file}:${issue.line}\n`;
            output += `    ${issue.description}\n\n`;
          }
        }
      }
    }

    output += '\n' + '='.repeat(60) + '\n';
    
    if (status === 'BLOCKED') {
      output += '\n⚠️  This skill is NOT SAFE to install.\n';
      output += '   Critical security issues detected.\n';
    } else if (status === 'WARNING') {
      output += '\n⚠️  Review required before installing.\n';
      output += '   High-risk patterns detected.\n';
    } else if (status === 'CAUTION') {
      output += '\n⚡ Review recommended.\n';
      output += '   Some suspicious patterns detected.\n';
    } else {
      if (hasIntentional) {
        output += '\n🔍 Security tool detected with intentional patterns.\n';
        output += '   These patterns are used for detection and education.\n';
        output += '   Skill is SAFE to install.\n';
      } else {
        output += '\n✅ No significant security issues found.\n';
      }
    }

    return output;
  }

  /**
   * Group issues by severity
   */
  _groupIssuesBySeverity() {
    return this.results.issuesFound.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});
  }
}

module.exports = ClawShieldScanner;
