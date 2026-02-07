#!/usr/bin/env node
/**
 * ClawShield CLI
 * Command-line interface for security scanning
 * 
 * NEW: Cloud integration with Supabase
 */

const fs = require('fs');
const path = require('path');
const ClawShieldScanner = require('../src/scanner/engine.js');

const VERSION = '1.0.0';

// Cloud config from environment
const CLOUD_ENABLED = process.env.CLAWSHIELD_CLOUD === 'true';
const CLOUD_API_KEY = process.env.CLAWSHIELD_API_KEY;
const CLOUD_ENDPOINT = process.env.CLAWSHIELD_ENDPOINT || 'https://<project>.supabase.co/functions/v1/scan-report';

function showHelp() {
  console.log(`
🛡️  ClawShield v${VERSION} - Security Scanner for OpenClaw Skills

Usage:
  clawshield scan <skill-path>    Scan a skill directory for security issues
  clawshield version              Show version
  clawshield help                 Show this help

Options:
  --verbose, -v                   Show detailed scanning progress
  --output, -o <file>             Save report to file
  --format <json|text>            Output format (default: text)
  --no-cloud                      Skip sending to cloud (even if enabled)

Cloud Integration:
  Set environment variables:
    CLAWSHIELD_CLOUD=true         Enable cloud reporting
    CLAWSHIELD_API_KEY=sk_xxx     Your API key from dashboard
    CLAWSHIELD_ENDPOINT=url       Optional: custom endpoint

Examples:
  clawshield scan ./skills/my-skill
  clawshield scan ./skills/my-skill --verbose --output report.json
  CLAWSHIELD_CLOUD=true CLAWSHIELD_API_KEY=sk_xxx clawshield scan ./skill

Exit Codes:
  0  - Clean (score 0-30)
  1  - Caution (score 31-60)
  2  - Warning (score 61-85)
  3  - Blocked (score 86-100)
  99 - Error
`);
}

/**
 * Send scan report to cloud
 */
async function sendToCloud(report, skillPath) {
  if (!CLOUD_ENABLED || !CLOUD_API_KEY) {
    return { success: false, reason: 'cloud_not_configured' };
  }

  try {
    const skillName = path.basename(skillPath);
    
    // Prepare payload (only metadata, no source code)
    const payload = {
      skill_name: skillName,
      skill_fingerprint: require('crypto').createHash('sha256').update(skillPath).digest('hex').substring(0, 16),
      status: report.summary.status,
      score: report.summary.score,
      files_scanned: report.summary.filesScanned,
      issues_count: report.summary.issuesFound,
      critical_count: report.summary.criticalIssues,
      high_count: report.summary.highIssues,
      medium_count: report.summary.mediumIssues,
      findings: report.issues.map(i => ({
        rule_id: i.ruleId,
        severity: i.severity,
        file: path.basename(i.file), // Only filename, no full path
        line: i.line
      })),
      scanned_at: new Date().toISOString()
    };

    const response = await fetch(CLOUD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, reason: 'network_error', error: error.message };
  }
}

function showVersion() {
  console.log(`ClawShield v${VERSION}`);
  if (CLOUD_ENABLED) {
    console.log(`☁️  Cloud integration: ENABLED`);
    console.log(`   Endpoint: ${CLOUD_ENDPOINT.replace(/\/\/[^/]+/, '//***')}`);
  }
}

async function scanSkill(skillPath, options = {}) {
  try {
    const resolvedPath = path.resolve(skillPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Error: Path not found: ${skillPath}`);
      process.exit(99);
    }

    const scanner = new ClawShieldScanner({
      verbose: options.verbose || false
    });

    const report = await scanner.scan(resolvedPath);

    // Output report
    if (options.format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(report.formatted);
    }

    // Send to cloud if enabled
    if (!options.noCloud && CLOUD_ENABLED) {
      console.log(`\n☁️  Sending to cloud...`);
      const cloudResult = await sendToCloud(report, skillPath);
      
      if (cloudResult.success) {
        console.log(`   ✅ Report saved to dashboard`);
      } else if (cloudResult.reason === 'cloud_not_configured') {
        console.log(`   ℹ️  Cloud not configured (set CLAWSHIELD_CLOUD=true)`);
      } else {
        console.log(`   ⚠️  Cloud sync failed: ${cloudResult.error}`);
      }
    }

    // Save to file if requested
    if (options.output) {
      const outputData = options.format === 'json' 
        ? JSON.stringify(report, null, 2)
        : report.formatted;
      fs.writeFileSync(options.output, outputData);
      console.log(`\n📄 Report saved to: ${options.output}\n`);
    }

    // Exit with appropriate code
    const score = report.summary.score;
    if (score >= 86) process.exit(3);
    if (score >= 61) process.exit(2);
    if (score >= 31) process.exit(1);
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(99);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    showVersion();
    process.exit(0);
  }

  if (command === 'scan') {
    const skillPath = args[1];
    
    if (!skillPath) {
      console.error('❌ Error: Please specify a skill path to scan');
      console.error('   Usage: clawshield scan <skill-path>');
      process.exit(99);
    }

    // Parse options
    const options = {};
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--verbose' || args[i] === '-v') {
        options.verbose = true;
      } else if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) {
        options.output = args[i + 1];
        i++;
      } else if (args[i] === '--format' && args[i + 1]) {
        options.format = args[i + 1];
        i++;
      } else if (args[i] === '--no-cloud') {
        options.noCloud = true;
      }
    }

    await scanSkill(skillPath, options);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.error('   Run "clawshield help" for usage information');
    process.exit(99);
  }
}

main();
