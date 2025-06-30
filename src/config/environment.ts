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
  // Get environment variables
  const tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY;
  const tavusReplicaId = import.meta.env.VITE_TAVUS_REPLICA_ID;

  // Use default values if environment variables are not set or are placeholder values
  const defaultApiKey = "a585d2b465da47238e21335438dd4d1c";
  const defaultReplicaId = "r91c80eca351";

  const finalApiKey = (!tavusApiKey || tavusApiKey === 'your_tavus_api_key_here') 
    ? defaultApiKey 
    : tavusApiKey;

  const finalReplicaId = (!tavusReplicaId || tavusReplicaId === 'your_replica_id_here') 
    ? defaultReplicaId 
    : tavusReplicaId;

  console.log('Environment config loaded:', {
    apiKey: finalApiKey ? 'Set' : 'Missing',
    replicaId: finalReplicaId ? 'Set' : 'Missing',
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development'
  });

  return {
    tavusApiKey: finalApiKey,
    tavusReplicaId: finalReplicaId,
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