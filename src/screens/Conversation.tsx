import { DialogWrapper } from "@/components/DialogWrapper";
import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useState } from "react";
import Video from "@/components/Video";
import { conversationAtom } from "@/store/conversation";
import { useAtom, useAtomValue } from "jotai";
import { screenAtom } from "@/store/screens";
import { Button } from "@/components/ui/button";
import { endConversation } from "@/api/endConversation";
import { createConversation } from "@/api";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
} from "lucide-react";
import { apiTokenAtom } from "@/store/tokens";
import { quantum } from 'ldrs';
import { cn } from "@/lib/utils";

quantum.register();

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const token = useAtomValue(apiTokenAtom);
  const [isLoading, setIsLoading] = useState(true);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Auto-create conversation when component mounts
  useEffect(() => {
    const initConversation = async () => {
      if (!token || conversation) return;
      
      try {
        const newConversation = await createConversation(token);
        setConversation(newConversation);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, [token, conversation, setConversation]);

  useEffect(() => {
    if (conversation?.conversation_url) {
      daily
        ?.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        })
        .then(() => {
          daily?.setLocalVideo(true);
          daily?.setLocalAudio(false);
          setIsLoading(false);
        });
    }
  }, [conversation?.conversation_url, daily]);

  useEffect(() => {
    if (remoteParticipantIds.length && !localAudio.isOff) return;
    
    if (remoteParticipantIds.length) {
      setTimeout(() => daily?.setLocalAudio(true), 2000);
    }
  }, [remoteParticipantIds, daily, localAudio.isOff]);

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(() => {
    daily?.leave();
    daily?.destroy();
    if (conversation?.conversation_id && token) {
      endConversation(token, conversation.conversation_id);
    }
    setConversation(null);
    setScreenState({ currentScreen: "finalScreen" });
  }, [daily, token, conversation, setConversation, setScreenState]);

  if (isLoading || !conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
          <l-quantum
            size="45"
            speed="1.75"
            color="white"
          ></l-quantum>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="relative w-full max-w-4xl aspect-video bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
        {remoteParticipantIds?.length > 0 ? (
          <Video
            id={remoteParticipantIds[0]}
            className="size-full"
            tileClassName="!object-cover rounded-3xl"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <l-quantum
              size="45"
              speed="1.75"
              color="white"
            ></l-quantum>
          </div>
        )}
        
        {localSessionId && (
          <Video
            id={localSessionId}
            tileClassName="!object-cover"
            className={cn(
              "absolute bottom-4 right-4 aspect-video h-32 w-48 overflow-hidden rounded-lg border-2 border-blue-500"
            )}
          />
        )}
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            size="icon"
            className="bg-black/50 border border-white/20 hover:bg-black/70"
            onClick={toggleAudio}
          >
            {!isMicEnabled ? (
              <MicOffIcon className="size-6" />
            ) : (
              <MicIcon className="size-6" />
            )}
          </Button>
          <Button
            size="icon"
            className="bg-black/50 border border-white/20 hover:bg-black/70"
            onClick={toggleVideo}
          >
            {!isCameraEnabled ? (
              <VideoOffIcon className="size-6" />
            ) : (
              <VideoIcon className="size-6" />
            )}
          </Button>
          <Button
            size="icon"
            className="bg-red-600 hover:bg-red-700"
            onClick={leaveConversation}
          >
            <PhoneIcon className="size-6 rotate-[135deg]" />
          </Button>
        </div>
        
        <DailyAudio />
      </div>
    </div>
  );
};