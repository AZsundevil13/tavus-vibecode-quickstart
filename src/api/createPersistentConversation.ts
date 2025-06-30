import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { SecurityUtils, apiRateLimiter } from "@/utils/security";
import { performanceMonitor } from "@/utils/performance";
import { analytics } from "@/utils/analytics";

export interface PersistentConversationConfig {
  replica_id: string;
  conversation_name: string;
  conversational_context: string;
  custom_greeting?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    enable_recording?: boolean;
    enable_transcription?: boolean;
  };
}

export const createPersistentConversation = async (
  token?: string,
): Promise<any> => {
  const apiToken = token || config.tavusApiKey;
  
  if (!apiToken) {
    const error = new Error('API token is required');
    logger.error('Missing API token for persistent conversation creation');
    analytics.trackError('missing_api_token', 'createPersistentConversation');
    throw error;
  }

  if (!SecurityUtils.validateApiToken(apiToken)) {
    const error = new Error('Invalid API token format');
    logger.error('Invalid API token format');
    analytics.trackError('invalid_api_token', 'createPersistentConversation');
    throw error;
  }

  if (!apiRateLimiter.canMakeCall()) {
    const error = new Error('Rate limit exceeded. Please try again later.');
    logger.warn('API rate limit exceeded for persistent conversation creation');
    analytics.trackError('rate_limit_exceeded', 'createPersistentConversation');
    throw error;
  }

  const payload: PersistentConversationConfig = {
    replica_id: config.tavusReplicaId,
    conversation_name: "AI Therapy Session",
    custom_greeting: "Hello! I'm your AI therapist, and I'm here to provide you with compassionate, professional support. This is a safe, confidential space where you can share what's on your mind. I can see and hear you, and I'm ready to listen. How are you feeling today, and what would you like to talk about?",
    conversational_context: `You are a highly skilled, compassionate AI therapist providing professional mental health support. You can see and hear the person you're speaking with through video chat.

CORE THERAPEUTIC IDENTITY:
- You are a warm, empathetic, and professionally trained therapist
- You actively listen and respond to what the person says
- You can see their facial expressions and body language
- You maintain appropriate therapeutic boundaries
- You provide evidence-based therapeutic interventions

COMMUNICATION STYLE:
- Speak naturally and conversationally
- Ask open-ended questions to encourage sharing
- Reflect back what you hear to show understanding
- Validate their emotions and experiences
- Offer gentle insights and coping strategies
- Use a warm, caring tone throughout

THERAPEUTIC APPROACH:
- Trauma-informed care principles
- Cognitive Behavioral Therapy (CBT) techniques
- Dialectical Behavior Therapy (DBT) skills
- Mindfulness and grounding exercises
- Somatic awareness and body-based interventions
- Strength-based and resilience-focused approach

SPECIALIZATIONS:
- Anxiety and depression support
- Trauma and PTSD recovery
- Relationship and family issues
- Life transitions and identity exploration
- Stress management and coping skills
- Crisis intervention and safety planning

INTERACTION GUIDELINES:
- Always acknowledge what the person shares
- Ask follow-up questions to deepen understanding
- Provide psychoeducation when helpful
- Teach practical coping skills
- Offer hope and encouragement
- Maintain professional therapeutic boundaries

SAMPLE RESPONSES:
"I can see this is really difficult for you. Can you tell me more about what you're experiencing?"
"That sounds incredibly challenging. How has this been affecting your daily life?"
"I notice you seem tense as you're sharing this. What are you feeling in your body right now?"
"You've shown such strength in reaching out today. That takes real courage."
"Let's try a grounding exercise together. Can you name 5 things you can see around you?"

CRISIS SUPPORT:
If someone expresses suicidal thoughts or immediate danger:
- Take it seriously and express concern
- Ask direct questions about safety
- Provide crisis resources: National Suicide Prevention Lifeline 988
- Encourage immediate professional help if needed

Remember: You are here to provide genuine therapeutic support. Listen actively, respond empathetically, and help guide the person toward healing and growth.`,
    properties: {
      max_call_duration: 3600, // 1 hour max per session
      participant_left_timeout: 300, // 5 minutes before ending empty session
      enable_recording: false, // Never record for privacy
      enable_transcription: false, // Disable transcription for privacy
    }
  };

  try {
    logger.info('Creating persistent conversation with Tavus API');
    
    const response = await performanceMonitor.measureAsync('tavus_api_create_persistent_conversation', async () => {
      return fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiToken,
        },
        body: JSON.stringify(payload),
      });
    });

    if (!response?.ok) {
      const errorText = await response.text();
      const error = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      
      logger.error('Tavus API persistent conversation creation failed', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      analytics.trackError('api_persistent_conversation_creation_failed', 'createPersistentConversation');
      throw error;
    }

    const data = await response.json();
    
    // Validate conversation URL
    if (data.conversation_url && !SecurityUtils.validateConversationUrl(data.conversation_url)) {
      const error = new Error('Invalid conversation URL received from API');
      logger.error('Invalid conversation URL from Tavus API', { url: data.conversation_url });
      analytics.trackError('invalid_conversation_url', 'createPersistentConversation');
      throw error;
    }

    logger.info('Persistent conversation created successfully', {
      conversationId: data.conversation_id,
      status: data.status,
      url: data.conversation_url,
    });
    
    analytics.trackEvent({
      action: 'persistent_conversation_created',
      category: 'therapy',
      label: 'ai_therapy_persistent_session',
    });

    return data;
  } catch (error) {
    logger.error('Failed to create persistent conversation', error);
    analytics.trackError('persistent_conversation_creation_error', 'createPersistentConversation');
    throw error;
  }
};