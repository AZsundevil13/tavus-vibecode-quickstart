import { IConversation } from "@/types";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  
  const payload = {
    persona_id: "pd43ffef",
    replica_id: "r91c80eca351",
    custom_greeting: "Hello! I'm here to listen and support you. This is a safe space where you can share whatever is on your mind. How are you feeling today?",
    conversational_context: "You are a compassionate, professional AI therapist. Provide a warm, supportive, and non-judgmental environment. Listen actively, ask thoughtful questions, and offer gentle guidance. Focus on emotional support, coping strategies, and helping users process their thoughts and feelings. Always maintain professional boundaries while being genuinely caring and empathetic."
  };
  
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token ?? "",
    },
    body: JSON.stringify(payload),
  });

  if (!response?.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("New conversation created:", data);
  return data;
};