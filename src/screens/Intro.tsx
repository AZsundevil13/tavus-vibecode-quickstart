import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { apiTokenAtom } from "@/store/tokens";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  // Set the updated API key
  React.useEffect(() => {
    if (!token) {
      const defaultToken = "a585d2b465da47238e21335438dd4d1c";
      setToken(defaultToken);
      localStorage.setItem('tavus-token', defaultToken);
    }
  }, [token, setToken]);

  const handleStartChat = () => {
    console.log("Starting chat with token:", token);
    setScreenState({ currentScreen: "conversation" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center">
        <h1 className="text-3xl font-bold text-white mb-8">Your Best Friend Anytime</h1>
        <p className="text-white/80 mb-8 max-w-md">
          Connect with your AI companion for friendly conversations, support, and meaningful chats anytime you need.
        </p>
        <button
          onClick={handleStartChat}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium rounded-2xl transition-all duration-200 hover:scale-105"
        >
          Talk to A Friend Here
        </button>
      </div>
    </div>
  );
};