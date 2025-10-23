#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Building and analyzing Blockify...\n')

try {
  // Build the project
  console.log('📦 Building project...')
  execSync('npm run build', { stdio: 'inherit' })
  
  // Check if stats.html was generated
  const statsPath = path.join(__dirname, '../dist/stats.html')
  if (fs.existsSync(statsPath)) {
    console.log('\n📊 Bundle analysis complete!')
    console.log(`📁 Open dist/stats.html in your browser to view the bundle analysis`)
  }
  
  // Display build size information
  const distPath = path.join(__dirname, '../dist')
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath, { withFileTypes: true })
    const totalSize = files.reduce((total, file) => {
      if (file.isFile()) {
        const filePath = path.join(distPath, file.name)
        const stats = fs.statSync(filePath)
        return total + stats.size
      }
      return total
    }, 0)
    
    console.log(`\n📏 Total build size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  }
  
  console.log('\n✅ Build completed successfully!')
  
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}
