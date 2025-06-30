import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { SecurityUtils, apiRateLimiter } from "@/utils/security";
import { performanceMonitor } from "@/utils/performance";
import { analytics } from "@/utils/analytics";

export const endConversation = async (
  token: string | null,
  conversationId: string,
) => {
  const apiToken = token || config.tavusApiKey;
  
  if (!apiToken) {
    logger.error('Missing API token for ending conversation');
    return null;
  }

  if (!SecurityUtils.validateApiToken(apiToken)) {
    logger.error('Invalid API token format for ending conversation');
    return null;
  }

  if (!apiRateLimiter.canMakeCall()) {
    logger.warn('Rate limit exceeded for ending conversation');
    return null;
  }

  try {
    logger.info('Ending conversation', { conversationId });
    
    const response = await performanceMonitor.measureAsync('tavus_api_end_conversation', async () => {
      return fetch(
        `https://tavusapi.com/v2/conversations/${conversationId}/end`,
        {
          method: "POST",
          headers: {
            "x-api-key": apiToken,
          },
        },
      );
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Failed to end conversation', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        conversationId,
      });
      
      analytics.trackError('end_conversation_failed', 'endConversation');
      throw new Error(`Failed to end conversation: ${response.status} - ${errorText}`);
    }

    logger.info('Conversation ended successfully', { conversationId });
    
    analytics.trackEvent({
      action: 'conversation_ended',
      category: 'therapy',
      label: 'ai_therapy_conversation',
    });

    return null;
  } catch (error) {
    logger.error('Error ending conversation', { error, conversationId });
    analytics.trackError('end_conversation_error', 'endConversation');
    throw error;
  }
};