import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";

export const FinalScreen: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);

  const handleReturn = () => {
    setScreenState({ currentScreen: "intro" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Thank you for your session</h1>
        <p className="text-white/80 mb-8 text-lg">
          Remember, you're not alone. Take care of yourself, and feel free to return anytime you need support.
        </p>
        <div className="mb-8 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
          <p className="text-green-200 text-sm">
            💚 Your conversation was private and secure
          </p>
        </div>
        <button
          onClick={handleReturn}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-medium rounded-2xl transition-all duration-200 hover:scale-105"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
};