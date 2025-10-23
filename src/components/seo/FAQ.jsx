import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { generateFAQStructuredData } from '@utils/seo'

export const FAQ = ({ faqs = [] }) => {
  const [openItems, setOpenItems] = useState(new Set())

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const structuredData = generateFAQStructuredData(faqs)

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
              onClick={() => toggleItem(index)}
              aria-expanded={openItems.has(index)}
            >
              <h3 className="text-lg font-medium text-gray-900">
                {faq.question}
              </h3>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform ${
                  openItems.has(index) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {openItems.has(index) && (
              <div className="px-6 pb-4">
                <div className="text-gray-600 prose max-w-none">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
