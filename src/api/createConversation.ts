import { IConversation } from "@/types";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  
  // Use the existing conversation details provided by the user
  const existingConversation: IConversation = {
    conversation_id: "ce9fd506683b648a",
    conversation_name: "AI Friend Chat",
    status: "active" as any, // Override the ended status to active for new sessions
    conversation_url: "https://tavus.daily.co/ce9fd506683b648a",
    created_at: "June 28, 10:20 pm"
  };
  
  console.log("Using existing conversation:", existingConversation);
  return existingConversation;
};