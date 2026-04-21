// import React, { useState, useEffect } from 'react';

// const ErrorBoundary = ({ children }) => {
//     const [hasError, setHasError] = useState(false);

//     useEffect(() => {
//         const handleError = (error, errorInfo) => {
//             setHasError(true);
//             // You can log the error to a logging service here
//             console.error('Error caught by ErrorBoundary:', error, errorInfo);
//         };

//         // Register the error handler
//         window.addEventListener('error', handleError);

//         // Clean up the event listener when the component unmounts
//         return () => {
//             window.removeEventListener('error', handleError);
//         };
//     }, []);

//     if (hasError) {
//         // You can render a custom fallback UI here
//         return <h1> </h1>;
//     }

//     return children;
// };

// export default ErrorBoundary;
import React, { useState, useEffect } from "react";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event) => {
      // ✅ Ignore ResizeObserver error (Chrome bug)
      if (
        event?.message &&
        event?.message.includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        event.preventDefault();
        return;
      }

      // ✅ For all other errors, trigger fallback UI
      setHasError(true);

      // Auto-refresh the page after 2 seconds
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  if (hasError) {
    // Show a temporary blank screen before reload
    return <h1 style={{ display: "none" }}></h1>;
  }

  return children;
};

export default ErrorBoundary;
