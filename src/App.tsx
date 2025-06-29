import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import {
  Intro,
  Conversation,
  FinalScreen,
} from "./screens";

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
    <main className="flex h-svh flex-col items-center justify-center bg-black">
      {renderScreen()}
    </main>
  );
}

export default App;