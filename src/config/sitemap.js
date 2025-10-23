// Sitemap configuration for dynamic route generation

export const sitemapRoutes = [
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

export const generateSitemap = (routes = sitemapRoutes) => {
  const baseUrl = 'https://codefied.com'
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return sitemap
}

export const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://codefied.com/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin areas (if any)
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
`
