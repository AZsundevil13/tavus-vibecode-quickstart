import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { selectedClientAtom } from "@/store/client";
import { getDefaultStore } from "jotai";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  // Get settings and selected client from Jotai store
  const settings = getDefaultStore().get(settingsAtom);
  const selectedClient = getDefaultStore().get(selectedClientAtom);
  
  // Add debug logs
  console.log('Creating conversation with settings:', settings);
  console.log('Selected client:', selectedClient);
  
  // Build the context string for therapeutic conversation
  let contextString = "";
  
  if (selectedClient) {
    contextString = `You are conducting a therapy session with ${selectedClient.firstName} ${selectedClient.lastName}. `;
    
    if (selectedClient.diagnosis.length > 0) {
      contextString += `Client diagnosis: ${selectedClient.diagnosis.join(', ')}. `;
    }
    
    if (selectedClient.grade) {
      contextString += `Client is in ${selectedClient.grade}. `;
    }
    
    contextString += "You are a supportive, professional AI therapy assistant. ";
    contextString += "Use evidence-based therapeutic techniques appropriate for the client's needs. ";
    contextString += "Be empathetic, encouraging, and maintain professional boundaries. ";
    contextString += "Focus on building rapport, active listening, and providing appropriate therapeutic interventions. ";
    
    if (selectedClient.currentGoals && selectedClient.currentGoals.length > 0) {
      contextString += `Current therapy goals include: ${selectedClient.currentGoals.map(g => g.description).join(', ')}. `;
    }
  } else {
    contextString = "You are a professional AI therapy assistant providing supportive counseling. ";
    contextString += "Use evidence-based therapeutic techniques, be empathetic and encouraging. ";
    contextString += "Maintain professional boundaries while building rapport with the client. ";
  }
  
  contextString += settings.context || "";
  
  const payload = {
    persona_id: settings.persona || "pd43ffef",
    replica_id: settings.replica || "r91c80eca351",
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null 
      ? settings.greeting 
      : selectedClient 
        ? `Hello ${selectedClient.firstName}! I'm glad you're here today. How are you feeling, and what would you like to talk about in our session?`
        : "Hello! I'm your AI therapy assistant. I'm here to provide a safe, supportive space for you. How are you feeling today, and what would you like to explore in our session?",
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