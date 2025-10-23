import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { generateBreadcrumbStructuredData } from '@utils/seo'

export const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation()
  
  // Generate breadcrumbs from current path if not provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbsFromPath(location.pathname)
  
  const structuredData = generateBreadcrumbStructuredData(breadcrumbItems)

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="flex">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg 
                  className="w-6 h-6 text-gray-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
              {index === breadcrumbItems.length - 1 ? (
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

const generateBreadcrumbsFromPath = (pathname) => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [
    { name: 'Home', url: '/' }
  ]

  let currentPath = ''
  pathSegments.forEach((segment, _index) => {
    currentPath += `/${segment}`
    const name = segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({
      name,
      url: currentPath
    })
  })

  return breadcrumbs
}
