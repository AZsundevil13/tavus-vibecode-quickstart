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
    console.log("Starting therapy session with token:", token);
    setScreenState({ currentScreen: "conversation" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center max-w-lg">
        <h1 className="text-4xl font-bold text-white mb-6">AI Therapy Session</h1>
        <p className="text-white/80 mb-8 text-lg leading-relaxed">
          Welcome to your private, judgment-free space. Connect with an AI therapist who's here to listen, 
          support, and help you work through whatever is on your mind.
        </p>
        <div className="mb-8 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
          <p className="text-blue-200 text-sm">
            ✨ Completely confidential • Available 24/7 • No appointments needed
          </p>
        </div>
        <button
          onClick={handleStartChat}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Start Your Session
        </button>
      </div>
    </div>
  );
};