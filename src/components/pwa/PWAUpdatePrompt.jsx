import { useState, useEffect } from 'react'
import { Button } from '@components/ui/Button'

export const PWAUpdatePrompt = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Reload the page to use the updated service worker
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-primary-600 text-white rounded-lg shadow-lg p-4 animate-slide-down">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">
              Update Available
            </h3>
            <p className="text-sm text-primary-100 mt-1">
              A new version of Codefied is available. Update now for the latest features and improvements.
            </p>
            <div className="flex space-x-2 mt-3">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleUpdate}
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Update Now
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="text-primary-100 hover:text-white hover:bg-primary-700"
              >
                Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-primary-200 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
