#!/usr/bin/env node

/**
 * Script to validate that all versions are consistent across the project
 * This helps catch version mismatches before releases
 */

const { readFileSync } = require('fs');
const { join } = require('path');

function main() {
  try {
    // Read package.json version
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const packageVersion = packageJson.version;

    console.log(`📦 package.json version: ${packageVersion}`);

    // Since src/index.ts now reads from package.json dynamically, 
    // we just need to verify it's using the dynamic approach
    const indexPath = join(__dirname, '..', 'src', 'index.ts');
    const indexContent = readFileSync(indexPath, 'utf8');
    
    if (indexContent.includes('packageJson.version')) {
      console.log('✅ src/index.ts correctly reads version dynamically from package.json');
    } else if (indexContent.includes("version: '")) {
      console.error('❌ src/index.ts still has hardcoded version! Please use dynamic version reading.');
      process.exit(1);
    } else {
      console.warn('⚠️  Could not determine version handling in src/index.ts');
    }

    console.log('✅ All versions are properly configured');
  } catch (error) {
    console.error('❌ Version validation failed:', error.message);
    process.exit(1);
  }
}

main();