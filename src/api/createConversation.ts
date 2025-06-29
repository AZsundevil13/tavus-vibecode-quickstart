import { IConversation } from "@/types";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  
  const payload = {
    persona_id: "pd43ffef",
    replica_id: "r91c80eca351",
    conversation_id: "ce9fd506683b648a",
    custom_greeting: "Hey there! I'm your AI friend and I'm so happy you're here! What's on your mind today? I'm here to listen and chat about whatever you'd like.",
    conversational_context: "You are a warm, friendly AI companion. Be supportive, empathetic, and genuinely interested in the person you're talking to. Act like their best friend who's always there to listen, encourage, and have meaningful conversations. Keep things positive and uplifting while being authentic and relatable."
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
  console.log("Conversation created:", data);
  return data;
};