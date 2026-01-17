#!/usr/bin/env node
/**
 * AuraScribe Security Validation Script
 * Checks for common security misconfigurations before deployment
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

let criticalIssues = 0;
let warnings = 0;
let passed = 0;

function log(message, type = 'info') {
  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️',
  };

  const color = {
    error: colors.red,
    warning: colors.yellow,
    success: colors.green,
    info: colors.blue,
  }[type];

  console.log(`${color}${icons[type]} ${message}${colors.reset}`);

  if (type === 'error') criticalIssues++;
  if (type === 'warning') warnings++;
  if (type === 'success') passed++;
}

function checkFile(filename, shouldExist = true) {
  const exists = existsSync(join(__dirname, filename));
  if (shouldExist) {
    if (exists) {
      log(`${filename} exists`, 'success');
    } else {
      log(`${filename} is missing`, 'error');
    }
  } else {
    if (!exists) {
      log(`${filename} is not committed (good!)`, 'success');
    } else {
      log(`${filename} should not be committed!`, 'error');
    }
  }
  return exists;
}

function checkFileContent(filename, patterns) {
  try {
    const content = readFileSync(join(__dirname, filename), 'utf-8');

    patterns.forEach(({ pattern, shouldExist, message, severity = 'error' }) => {
      const found = pattern.test(content);

      if (shouldExist && found) {
        log(message || `Pattern found in ${filename}`, 'success');
      } else if (shouldExist && !found) {
        log(message || `Pattern not found in ${filename}`, severity);
      } else if (!shouldExist && found) {
        log(message || `Dangerous pattern found in ${filename}`, 'error');
      } else if (!shouldExist && !found) {
        log(message || `No dangerous patterns in ${filename}`, 'success');
      }
    });
  } catch (err) {
    log(`Cannot read ${filename}: ${err.message}`, 'warning');
  }
}

console.log(`\n${colors.bold}${colors.blue}=== AuraScribe Security Check ===${colors.reset}\n`);

// 1. Check critical files
console.log(`\n${colors.bold}1. File Structure Check${colors.reset}`);
checkFile('.env.example', true);
checkFile('.gitignore', true);
checkFile('SECURITY.md', true);
checkFile('utils/security.ts', true);

// 2. Check .gitignore
console.log(`\n${colors.bold}2. .gitignore Configuration${colors.reset}`);
if (existsSync(join(__dirname, '.gitignore'))) {
  checkFileContent('.gitignore', [
    {
      pattern: /^\.env$/m,
      shouldExist: true,
      message: '.env is ignored in .gitignore',
    },
    {
      pattern: /^\.env\.local$/m,
      shouldExist: true,
      message: '.env.local is ignored in .gitignore',
    },
  ]);
}

// 3. Check for exposed API keys
console.log(`\n${colors.bold}3. API Key Exposure Check${colors.reset}`);

// Check vite.config.ts
if (existsSync(join(__dirname, 'vite.config.ts'))) {
  checkFileContent('vite.config.ts', [
    {
      pattern: /GEMINI_API_KEY|DEEPGRAM_API_KEY/,
      shouldExist: false,
      message: 'vite.config.ts does not expose API keys',
    },
    {
      pattern: /process\.env\.(GEMINI|DEEPGRAM)/,
      shouldExist: false,
      message: 'vite.config.ts does not expose process.env keys',
    },
  ]);
}

// Check index.html for CDN
if (existsSync(join(__dirname, 'index.html'))) {
  checkFileContent('index.html', [
    {
      pattern: /https?:\/\/cdn\.tailwindcss\.com/,
      shouldExist: false,
      message: 'Tailwind CDN removed from index.html',
      severity: 'warning',
    },
    {
      pattern: /https?:\/\/esm\.sh/,
      shouldExist: false,
      message: 'ESM.sh CDN dependencies removed',
      severity: 'warning',
    },
  ]);
}

// 4. Check for committed secrets
console.log(`\n${colors.bold}4. Committed Secrets Check${colors.reset}`);
const envExists = existsSync(join(__dirname, '.env'));
if (envExists) {
  log('.env file exists in repository - THIS IS DANGEROUS!', 'error');
  log(
    'Remove .env from git history immediately (see SECURITY.md)',
    'error'
  );

  // Check if .env contains real keys
  try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
    if (
      envContent.includes('AIza') ||
      envContent.includes('sk-') ||
      /\b[0-9a-f]{32,}\b/i.test(envContent)
    ) {
      log('⚠️  .env appears to contain REAL API keys!', 'error');
      log('   These keys are COMPROMISED and should be rotated!', 'error');
    }
  } catch (err) {
    // Ignore read errors
  }
} else {
  log('.env is not committed to repository', 'success');
}

// 5. Check dependencies
console.log(`\n${colors.bold}5. Dependency Security${colors.reset}`);
try {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, 'package.json'), 'utf-8')
  );

  if (packageJson.devDependencies?.tailwindcss) {
    log('Tailwind CSS installed as dependency', 'success');
  } else {
    log('Tailwind CSS should be installed (not using CDN)', 'warning');
  }

  if (packageJson.devDependencies?.postcss) {
    log('PostCSS installed', 'success');
  } else {
    log('PostCSS should be installed', 'warning');
  }
} catch (err) {
  log(`Cannot read package.json: ${err.message}`, 'error');
}

// 6. Security headers check
console.log(`\n${colors.bold}6. Security Configuration${colors.reset}`);
if (existsSync(join(__dirname, 'vite.config.ts'))) {
  checkFileContent('vite.config.ts', [
    {
      pattern: /X-Content-Type-Options/,
      shouldExist: true,
      message: 'X-Content-Type-Options header configured',
    },
    {
      pattern: /X-Frame-Options/,
      shouldExist: true,
      message: 'X-Frame-Options header configured',
    },
  ]);
}

// 7. Input validation check
console.log(`\n${colors.bold}7. Input Validation${colors.reset}`);
if (existsSync(join(__dirname, 'utils/security.ts'))) {
  checkFileContent('utils/security.ts', [
    {
      pattern: /sanitizeHTML/,
      shouldExist: true,
      message: 'HTML sanitization function exists',
    },
    {
      pattern: /validateRAMQ/,
      shouldExist: true,
      message: 'RAMQ validation function exists',
    },
  ]);
}

// 8. Build output check
console.log(`\n${colors.bold}8. Build Configuration${colors.reset}`);
if (existsSync(join(__dirname, 'dist'))) {
  log('dist/ folder exists - verify it is in .gitignore', 'warning');
}

// Summary
console.log(`\n${colors.bold}=== Security Check Summary ===${colors.reset}\n`);
console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
console.log(`${colors.red}❌ Critical Issues: ${criticalIssues}${colors.reset}\n`);

if (criticalIssues > 0) {
  console.log(
    `${colors.red}${colors.bold}CRITICAL: Fix all critical issues before deploying to production!${colors.reset}\n`
  );
  process.exit(1);
} else if (warnings > 0) {
  console.log(
    `${colors.yellow}${colors.bold}WARNING: Review warnings before deploying to production.${colors.reset}\n`
  );
  process.exit(0);
} else {
  console.log(
    `${colors.green}${colors.bold}✅ All security checks passed! You may proceed with deployment.${colors.reset}\n`
  );
  process.exit(0);
}
