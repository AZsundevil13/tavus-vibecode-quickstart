import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { Suspense } from "react";
import {
  Intro,
  Conversation,
  FinalScreen,
} from "./screens";

// Simple loading component
const LoadingFallback = () => (
  <div className="flex h-svh flex-col items-center justify-center bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    <p className="text-white mt-4">Loading AI Therapy Platform...</p>
  </div>
);

function App() {
  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "intro":
        return <Intro />;
      case "conversation":
        return <Conversation />;
      case "finalScreen":
        return <FinalScreen />;
      default:
        return <Intro />;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <main className="flex h-svh flex-col items-center justify-center bg-black">
        {renderScreen()}
      </main>
    </Suspense>
  );
}

export default App;