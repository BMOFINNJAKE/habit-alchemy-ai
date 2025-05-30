
// Service Worker Registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful:', registration.scope)
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed:', err)
        })
    })
  }
}
