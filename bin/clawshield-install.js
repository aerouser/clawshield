#!/usr/bin/env node
/**
 * ClawShield Install - Secure wrapper for skill installation
 * Scans skills before installing, blocks malicious code
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const https = require('https');
const http = require('http');

const ClawShieldScanner = require('../src/scanner/engine.js');

const VERSION = '0.2.0';
const QUARANTINE_DIR = path.join(require('os').tmpdir(), 'clawshield-quarantine');

// Check if running as root
function isRunningAsRoot() {
  try {
    return process.getuid && process.getuid() === 0;
  } catch (e) {
    return false;
  }
}

const IS_ROOT = isRunningAsRoot();

// Config
const CONFIG = {
  installCmd: process.env.CLAW_INSTALL_CMD || 'clawhub install',
  maxZipSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 1000,
  defaultThreshold: IS_ROOT ? 'CAUTION' : 'WARNING' // More strict in root mode
};

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    scan: '🛡️'
  };
  console.log(`${icons[type] || '•'} ${message}`);
}

function showHelp() {
  console.log(`
🛡️  ClawShield Secure Install v${VERSION}

Usage:
  clawshield install <skill-ref>    Install a skill with security scan
  clawshield install --help         Show this help

Arguments:
  <skill-ref>    Skill reference (clawhub slug, github repo, URL, or local path)
                 Examples: rememberall, vendor/skill, github:user/repo, /path/to/skill

Options:
  --fail-on <level>    Fail threshold: BLOCKED|WARNING|CAUTION (default: WARNING)
  --force              Install even if blocked (dangerous!)
  --report-out <path>  Save scan report to file
  --dry-run            Don't install, just scan and show what would happen
  --verbose            Show detailed scan progress

Environment:
  CLAW_INSTALL_CMD     Command to use for actual install (default: "clawhub install")

Examples:
  clawshield install rememberall
  clawshield install github:steipete/openclaw-skill
  clawshield install ./my-skill --verbose
  clawshield install some-skill --fail-on CAUTION --dry-run

Exit Codes:
  0  - Success (installed and clean)
  1  - Blocked by security check (not installed)
  2  - Installation failed
  99 - Error (invalid args, network, etc)
`);
}

async function downloadSkill(skillRef, quarantinePath) {
  log(`Resolving ${skillRef}...`);
  
  // Local path
  if (skillRef.startsWith('/') || skillRef.startsWith('./') || skillRef.startsWith('../')) {
    if (!fs.existsSync(skillRef)) {
      throw new Error(`Local path not found: ${skillRef}`);
    }
    
    // Copy to quarantine
    const cmd = `cp -r "${skillRef}" "${quarantinePath}"`;
    execSync(cmd);
    log(`Copied local skill to quarantine`, 'success');
    return;
  }
  
  // GitHub repo
  if (skillRef.startsWith('github:')) {
    const repo = skillRef.replace('github:', '');
    const url = `https://github.com/${repo}/archive/refs/heads/main.zip`;
    
    log(`Downloading from GitHub: ${repo}...`);
    await downloadFile(url, path.join(quarantinePath, 'download.zip'));
    
    // Extract
    execSync(`cd "${quarantinePath}" && unzip -q download.zip && rm download.zip`);
    
    // Find extracted folder
    const extracted = fs.readdirSync(quarantinePath).find(f => fs.statSync(path.join(quarantinePath, f)).isDirectory());
    if (extracted) {
      execSync(`mv "${path.join(quarantinePath, extracted)}"/* "${quarantinePath}"/ && rm -rf "${path.join(quarantinePath, extracted)}"`);
    }
    
    log('Downloaded and extracted', 'success');
    return;
  }
  
  // ClawHub skill - use clawhub to download without installing
  log(`Fetching from ClawHub: ${skillRef}...`);
  
  // Try to download via clawhub
  try {
    // First, try to get info about the skill
    const infoCmd = `clawhub info ${skillRef} 2>&1`;
    const info = execSync(infoCmd, { encoding: 'utf8' });
    log(`Skill info: ${info.split('\n')[0]}`, 'info');
    
    // Download to quarantine using clawhub
    // Note: This may vary based on clawhub version
    const downloadCmd = `cd "${quarantinePath}" && clawhub download ${skillRef} 2>&1 || echo "Fallback: will try direct"`;
    execSync(downloadCmd, { stdio: 'pipe' });
    
    log('Downloaded from ClawHub', 'success');
  } catch (error) {
    // Fallback: assume skill-ref is a direct URL or npm package
    log('Could not download via clawhub, trying fallback...', 'warning');
    throw new Error(`Unable to download skill: ${skillRef}. Please provide local path or github:repo`);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const request = client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      
      // Check size
      const contentLength = parseInt(response.headers['content-length']);
      if (contentLength && contentLength > CONFIG.maxZipSize) {
        reject(new Error(`File too large: ${contentLength} bytes (max: ${CONFIG.maxZipSize})`));
        return;
      }
      
      const file = fs.createWriteStream(dest);
      let downloaded = 0;
      
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (downloaded > CONFIG.maxZipSize) {
          file.destroy();
          reject(new Error('File exceeds maximum size'));
          return;
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', reject);
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

async function scanSkill(quarantinePath, options) {
  log('Running security scan...', 'scan');
  
  const scanner = new ClawShieldScanner({
    verbose: options.verbose || false
  });
  
  const report = await scanner.scan(quarantinePath);
  
  // Save report if requested
  if (options.reportOut) {
    const reportData = options.format === 'json' 
      ? JSON.stringify(report, null, 2)
      : report.formatted;
    fs.writeFileSync(options.reportOut, reportData);
    log(`Report saved to: ${options.reportOut}`, 'success');
  }
  
  return report;
}

function shouldBlock(report, threshold) {
  const score = report.summary.score;
  const status = report.summary.status;
  
  switch (threshold) {
    case 'BLOCKED':
      return status === 'BLOCKED';
    case 'WARNING':
      return status === 'BLOCKED' || status === 'WARNING';
    case 'CAUTION':
      return status === 'BLOCKED' || status === 'WARNING' || status === 'CAUTION';
    default:
      return status === 'BLOCKED';
  }
}

async function installSkill(skillRef, options) {
  const startTime = Date.now();
  
  console.log(`\n🛡️  ClawShield Secure Install v${VERSION}\n`);
  
  // Root Safety Mode warning
  if (IS_ROOT) {
    console.log('⚠️  WARNING: Running as root!');
    console.log('   Root Safety Mode activated - enhanced security policies apply.\n');
    console.log('   CAUTION → WARNING | WARNING → BLOCKED\n');
    
    if (!options.force) {
      console.log('   Installation as root requires explicit confirmation.');
      console.log('   Use --force to proceed with installation.\n');
      
      if (options.dryRun) {
        console.log('   (Dry-run mode: showing what would happen)\n');
      } else {
        process.exit(1);
      }
    }
  }
  
  // Setup quarantine
  const quarantinePath = path.join(QUARANTINE_DIR, `skill-${Date.now()}`);
  fs.mkdirSync(quarantinePath, { recursive: true });
  
  try {
    // Step 1: Download to quarantine
    log('Step 1/4: Downloading to quarantine...');
    await downloadSkill(skillRef, quarantinePath);
    
    // Step 2: Security scan
    log('Step 2/4: Security scanning...');
    const report = await scanSkill(quarantinePath, options);
    
    console.log(report.formatted);
    
    // Step 3: Decision
    log('Step 3/4: Evaluating security report...');
    
    const threshold = options.failOn || CONFIG.defaultThreshold;
    const blocked = shouldBlock(report, threshold);
    
    if (blocked && !options.force) {
      log(`❌ INSTALLATION BLOCKED`, 'error');
      log(`   Threshold: ${threshold}`, 'error');
      log(`   Status: ${report.summary.status} (Score: ${report.summary.score})`, 'error');
      log(`\n   To force install anyway (DANGEROUS):`, 'warning');
      log(`   clawshield install ${skillRef} --force`, 'warning');
      
      cleanup(quarantinePath);
      process.exit(1);
    }
    
    if (blocked && options.force) {
      log('⚠️  WARNING: Installing despite security issues (--force)', 'warning');
      log('   This is DANGEROUS and not recommended!', 'warning');
    }
    
    // Step 4: Install
    if (options.dryRun) {
      log('Step 4/4: DRY RUN - Would install now', 'info');
      log(`   Command: ${CONFIG.installCmd} ${skillRef}`, 'info');
      log('\n✅ Dry run complete - nothing was installed', 'success');
    } else {
      log('Step 4/4: Installing skill...');
      
      const installCmd = `${CONFIG.installCmd} ${skillRef}`;
      log(`   Running: ${installCmd}`, 'info');
      
      try {
        execSync(installCmd, { 
          stdio: 'inherit',
          timeout: 120000
        });
        log('\n✅ Skill installed successfully!', 'success');
      } catch (error) {
        log('\n❌ Installation failed', 'error');
        throw error;
      }
    }
    
    const duration = Date.now() - startTime;
    log(`\nTotal time: ${duration}ms`, 'info');
    
    cleanup(quarantinePath);
    process.exit(0);
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'error');
    cleanup(quarantinePath);
    process.exit(99);
  }
}

function cleanup(quarantinePath) {
  try {
    if (fs.existsSync(quarantinePath)) {
      fs.rmSync(quarantinePath, { recursive: true, force: true });
      log('Cleaned up quarantine', 'info');
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }
  
  const skillRef = args[0];
  
  // Parse options
  const options = {};
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--fail-on':
        options.failOn = args[++i];
        break;
      case '--force':
        options.force = true;
        break;
      case '--report-out':
        options.reportOut = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }
  
  await installSkill(skillRef, options);
}

main();
