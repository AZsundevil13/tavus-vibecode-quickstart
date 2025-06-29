import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  // Get settings from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  
  // Add debug logs
  console.log('Creating conversation with settings:', settings);
  console.log('Greeting value:', settings.greeting);
  console.log('Context value:', settings.context);
  
  // Build the context string for friendly conversation
  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with ${settings.name}. You are their best friend - warm, supportive, and always there for them. `;
  } else {
    contextString = "You are the user's best friend - warm, supportive, and always there for them. ";
  }
  
  contextString += "Be casual, friendly, and genuinely interested in their life. Listen actively, offer encouragement, and share in their joys and concerns like a true friend would. ";
  contextString += settings.context || "";
  
  const payload = {
    persona_id: settings.persona || "pd43ffef",
    replica_id: settings.replica || "r91c80eca351", // Using the replica ID from your conversation
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : "Hey there! I'm so glad you're here! I'm your AI best friend, and I'm always excited to chat with you. What's going on in your world today?",
    conversational_context: contextString
  };
  
  console.log('Sending payload to API:', payload);
  
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token ?? "",
    },
    body: JSON.stringify(payload),
  });

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};