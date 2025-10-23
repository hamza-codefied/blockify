#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const baseUrl = 'https://codefied.com'
const routes = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  }
]

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  const distDir = path.join(process.cwd(), 'dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)
  console.log('✅ Sitemap generated successfully!')
}

generateSitemap()
