import { Helmet } from 'react-helmet-async'
import { 
  generateWebsiteStructuredData, 
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData 
} from '@utils/seo'

export const StructuredData = ({ 
  type: _type = 'website',
  breadcrumbs = [],
  organization = true,
  website = true 
}) => {
  const structuredData = []

  if (website) {
    structuredData.push(generateWebsiteStructuredData())
  }

  if (organization) {
    structuredData.push(generateOrganizationStructuredData())
  }

  if (breadcrumbs.length > 0) {
    structuredData.push(generateBreadcrumbStructuredData(breadcrumbs))
  }

  return (
    <Helmet>
      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  )
}
