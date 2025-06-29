import React, { useState } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { apiTokenAtom } from "@/store/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [customToken, setCustomToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Set the default API key only if no token exists
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

  const handleUseCustomToken = () => {
    if (customToken.trim()) {
      setToken(customToken.trim());
      localStorage.setItem('tavus-token', customToken.trim());
      setShowTokenInput(false);
      setCustomToken("");
    }
  };

  const handleShowTokenInput = () => {
    setShowTokenInput(true);
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

        {!showTokenInput ? (
          <div className="space-y-4">
            <button
              onClick={handleStartChat}
              className="w-full px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Start Your Session
            </button>
            <button
              onClick={handleShowTokenInput}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-all duration-200 border border-white/20"
            >
              Use Your Own API Token
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-white text-sm font-medium mb-2">
                Enter Your Tavus API Token
              </label>
              <Input
                type="text"
                placeholder="Your Tavus API token..."
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <p className="text-white/60 text-xs mt-2">
                Get your API token from{" "}
                <a 
                  href="https://platform.tavus.io/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Tavus Platform
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleUseCustomToken}
                disabled={!customToken.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Use Token
              </Button>
              <Button
                onClick={() => {
                  setShowTokenInput(false);
                  setCustomToken("");
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};