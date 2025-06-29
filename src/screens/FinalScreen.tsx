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
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Thanks for chatting!</h1>
        <button
          onClick={handleReturn}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium rounded-2xl transition-all duration-200 hover:scale-105"
        >
          Talk Again
        </button>
      </div>
    </div>
  );
};