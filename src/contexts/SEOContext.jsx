import { HelmetProvider } from 'react-helmet-async'

export const SEOProvider = ({ children }) => {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  )
}
