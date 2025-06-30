import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { DailyProvider } from "@daily-co/daily-react";
import { performanceMonitor } from "./utils/performance";
import { logger } from "./utils/logger";
import { config, isProduction } from "./config/environment";

import "./fonts/Christmas and Santona.ttf";
import "./index.css";

// Initialize performance monitoring
performanceMonitor.observeWebVitals();

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise
  });
});

// Security headers check
if (isProduction && !window.location.protocol.startsWith('https')) {
  logger.error('Production app must be served over HTTPS');
}

// Log app initialization
logger.info('AI Therapy Application starting', {
  environment: config.nodeEnv,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DailyProvider>
      <App />
    </DailyProvider>
  </React.StrictMode>,
);