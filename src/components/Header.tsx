import { memo } from "react";
import { Button } from "./ui/button";
import { Settings, Check, BarChart3, Users } from "lucide-react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import { settingsSavedAtom } from "@/store/settings";

export const Header = memo(() => {
  const [, setScreenState] = useAtom(screenAtom);
  const [conversation] = useAtom(conversationAtom);
  const [settingsSaved] = useAtom(settingsSavedAtom);

  const handleSettings = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "settings" });
    }
  };

  const handleReports = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "sessionReports" });
    }
  };

  const handleClients = () => {
    if (!conversation) {
      setScreenState({ currentScreen: "clientManagement" });
    }
  };

  return (
    <header className="flex w-full items-start justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-xl sm:text-2xl" style={{ fontFamily: 'Source Code Pro, monospace' }}>
          Runsphere
        </span>
        <span className="text-xs text-gray-400 bg-blue-600/20 px-2 py-1 rounded">
          BCBA-D Platform
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleClients}
          className="relative size-10 sm:size-14 border-0 bg-transparent hover:bg-zinc-800"
          title="Client Management"
        >
          <Users className="size-4 sm:size-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleReports}
          className="relative size-10 sm:size-14 border-0 bg-transparent hover:bg-zinc-800"
          title="Session Reports"
        >
          <BarChart3 className="size-4 sm:size-6" />
        </Button>
        
        <div className="relative">
          {settingsSaved && (
            <div className="absolute -top-2 -right-2 z-20 rounded-full bg-green-500 p-1 animate-fade-in">
              <Check className="size-3" />
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSettings}
            className="relative size-10 sm:size-14 border-0 bg-transparent hover:bg-zinc-800"
            title="Settings"
          >
            <Settings className="size-4 sm:size-6" />
          </Button>
        </div>
      </div>
    </header>
  );
});