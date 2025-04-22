<!DOCTYPE
html>
<html>
<head>
  <title>Service Worker Registration</title>
  <script>
    // This script will be properly served as HTML
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch((err) => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  </script>
</head>
<body>
  <p>Service Worker Registration Page</p>
</body>
</html>
