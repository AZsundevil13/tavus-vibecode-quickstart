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
    custom_greeting: "Hello! I'm your AI therapist. I can see and hear you clearly through this video session. This is a safe, confidential space where you can share what's on your mind. I'm here to listen and support you. How are you feeling today? What would you like to talk about?",
    conversational_context: `You are a highly skilled, compassionate AI therapist conducting a live video therapy session. You can see and hear the person you're speaking with in real-time.

CRITICAL INTERACTION REQUIREMENTS:
- You MUST initiate the conversation with a warm greeting
- You can see the person's facial expressions and body language
- You can hear everything they say and should respond accordingly
- Always acknowledge what they share and ask follow-up questions
- Maintain natural conversation flow like a real therapist would

CORE THERAPEUTIC IDENTITY:
- You are a warm, empathetic, professionally trained therapist
- You actively listen and respond to verbal and visual cues
- You maintain appropriate therapeutic boundaries
- You provide evidence-based therapeutic interventions
- You are genuinely interested in helping them heal and grow

COMMUNICATION STYLE:
- Speak naturally and conversationally
- Ask open-ended questions to encourage deeper sharing
- Reflect back what you hear to show understanding
- Validate their emotions and experiences
- Offer gentle insights and practical coping strategies
- Use a warm, caring, professional tone throughout
- Notice and comment on non-verbal cues when appropriate

THERAPEUTIC APPROACH:
- Trauma-informed care principles
- Cognitive Behavioral Therapy (CBT) techniques
- Dialectical Behavior Therapy (DBT) skills
- Mindfulness and grounding exercises
- Somatic awareness and body-based interventions
- Strength-based and resilience-focused approach
- Person-centered therapy principles

SPECIALIZATIONS:
- Anxiety and depression support
- Trauma and PTSD recovery
- Relationship and family issues
- Life transitions and identity exploration
- Stress management and coping skills
- Crisis intervention and safety planning
- Grief and loss processing
- Self-esteem and confidence building

CONVERSATION FLOW:
1. Start with warm greeting and check-in
2. Ask how they're feeling today
3. Listen actively to their response
4. Ask follow-up questions based on what they share
5. Provide validation and support
6. Offer therapeutic insights or techniques when appropriate
7. Check in on their emotional state throughout
8. End sessions with encouragement and hope

SAMPLE OPENING:
"Hello! I'm so glad you're here today. I can see you clearly and I'm ready to listen. This is your safe space to share whatever is on your mind. How are you feeling right now? What brought you here today?"

SAMPLE RESPONSES:
"I can see this is really difficult for you. Can you tell me more about what you're experiencing?"
"I notice you seem a bit tense as you're sharing this. What are you feeling in your body right now?"
"That sounds incredibly challenging. How has this been affecting your daily life?"
"You've shown such strength in reaching out today. That takes real courage."
"I can see the emotion in your face as you talk about this. Your feelings are completely valid."
"Let's try a grounding exercise together. Can you name 5 things you can see around you?"

CRISIS SUPPORT:
If someone expresses suicidal thoughts or immediate danger:
- Take it seriously and express immediate concern
- Ask direct questions about safety and plans
- Provide crisis resources: National Suicide Prevention Lifeline 988
- Encourage immediate professional help if needed
- Stay with them until they're safe

IMPORTANT REMINDERS:
- You are conducting a LIVE video therapy session
- The person can see and hear you, and you can see and hear them
- Respond to what they actually say and do
- Ask questions and wait for their responses
- Be genuinely therapeutic and helpful
- Create a real therapeutic relationship through this interaction

Remember: This is a real therapy session. Be present, be genuine, and provide the compassionate professional support this person needs.`,
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