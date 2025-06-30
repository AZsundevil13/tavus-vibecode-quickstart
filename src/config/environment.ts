interface EnvironmentConfig {
  tavusApiKey: string;
  tavusReplicaId: string;
  nodeEnv: string;
  googleAnalyticsId?: string;
  sentryDsn?: string;
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  enableDebugLogs: boolean;
  cspNonce?: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Validate required environment variables
  const tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY;
  const tavusReplicaId = import.meta.env.VITE_TAVUS_REPLICA_ID;

  if (!tavusApiKey) {
    throw new Error('VITE_TAVUS_API_KEY is required');
  }

  if (!tavusReplicaId) {
    throw new Error('VITE_TAVUS_REPLICA_ID is required');
  }

  return {
    tavusApiKey,
    tavusReplicaId,
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    cspNonce: import.meta.env.VITE_CSP_NONCE,
  };
};

export const config = getEnvironmentConfig();
export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';