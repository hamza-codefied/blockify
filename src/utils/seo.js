// SEO utility functions and structured data generators

export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Codefied",
    "description": "A modern, professional React application built with Vite, Tailwind CSS, and best practices for scalable development.",
    "url": "https://codefied.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://codefied.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Codefied",
      "url": "https://codefied.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://codefied.com/logo.png"
      }
    }
  }
}

export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Codefied",
    "url": "https://codefied.com",
    "logo": "https://codefied.com/logo.png",
    "description": "A modern, professional React application built with Vite, Tailwind CSS, and best practices for scalable development.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "customer service",
      "email": "hello@codefied.com"
    },
    "sameAs": [
      "https://twitter.com/codefied",
      "https://github.com/codefied"
    ]
  }
}

export const generateBreadcrumbStructuredData = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

export const generateArticleStructuredData = (article) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author || "Codefied Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Codefied",
      "logo": {
        "@type": "ImageObject",
        "url": "https://codefied.com/logo.png"
      }
    },
    "datePublished": article.publishedTime,
    "dateModified": article.modifiedTime || article.publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  }
}

export const generateFAQStructuredData = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

export const generateLocalBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Codefied",
    "description": "Professional React application development services",
    "url": "https://codefied.com",
    "telephone": "+1-555-0123",
    "email": "hello@codefied.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Tech Street",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "37.7749",
      "longitude": "-122.4194"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  }
}

// SEO helper functions
export const generateMetaTitle = (title, siteName = 'Codefied') => {
  return title ? `${title} | ${siteName}` : siteName
}

export const generateMetaDescription = (description, maxLength = 160) => {
  if (!description) return 'A modern, professional React application built with Vite, Tailwind CSS, and best practices for scalable development.'
  
  if (description.length <= maxLength) return description
  
  return description.substring(0, maxLength - 3) + '...'
}

export const generateKeywords = (keywords = []) => {
  const defaultKeywords = [
    'React',
    'Vite',
    'Tailwind CSS',
    'PWA',
    'SEO',
    'Performance',
    'Modern Web Development',
    'JavaScript',
    'Frontend Development'
  ]
  
  return [...new Set([...keywords, ...defaultKeywords])].join(', ')
}
