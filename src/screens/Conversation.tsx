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

quantum.register();

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const token = useAtomValue(apiTokenAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [showTokenError, setShowTokenError] = useState(false);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Create a fresh conversation for each user session
  useEffect(() => {
    const initConversation = async () => {
      if (!token) {
        setError("No API token available");
        setIsLoading(false);
        return;
      }
      
      if (conversation || isCreatingConversation) return;
      
      setIsCreatingConversation(true);
      
      try {
        console.log("Creating new therapy session with token:", token);
        const newConversation = await createConversation(token);
        console.log("Therapy session created successfully:", newConversation);
        setConversation(newConversation);
        setError(null);
        setShowTokenError(false);
      } catch (error) {
        console.error("Failed to create therapy session:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a concurrent conversations error
        if (errorMessage.includes('maximum concurrent conversations') || errorMessage.includes('status: 400')) {
          setShowTokenError(true);
          setError('The shared API token has reached its limit. Please use your own Tavus API token to continue.');
        } else {
          setError(`Failed to start session: ${errorMessage}`);
        }
        setIsLoading(false);
      } finally {
        setIsCreatingConversation(false);
      }
    };

    initConversation();
  }, [token, conversation, setConversation, isCreatingConversation]);

  useEffect(() => {
    if (!conversation?.conversation_url || !daily || isJoiningCall) return;

    const joinCall = async () => {
      setIsJoiningCall(true);
      
      try {
        console.log("Joining therapy session with URL:", conversation.conversation_url);
        
        await daily.join({
          url: conversation.conversation_url,
          startVideoOff: false,
          startAudioOff: true,
        });
        
        console.log("Successfully joined therapy session");
        daily.setLocalVideo(true);
        daily.setLocalAudio(false);
        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error("Failed to join therapy session:", error);
        setError(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      } finally {
        setIsJoiningCall(false);
      }
    };

    joinCall();
  }, [conversation?.conversation_url, daily, isJoiningCall]);

  useEffect(() => {
    if (remoteParticipantIds.length && !localAudio.isOff) return;
    
    if (remoteParticipantIds.length) {
      console.log("AI therapist joined, enabling audio");
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

  const retryConnection = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setConversation(null);
    setIsCreatingConversation(false);
    setIsJoiningCall(false);
    setShowTokenError(false);
  }, [setConversation]);

  const goBackToSetupToken = useCallback(() => {
    setScreenState({ currentScreen: "intro" });
  }, [setScreenState]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-red-400 mb-4">
            {showTokenError ? "API Token Limit Reached" : "Connection Error"}
          </h2>
          <p className="text-white mb-6">{error}</p>
          
          {showTokenError && (
            <div className="mb-6 p-4 bg-yellow-500/20 rounded-xl border border-yellow-400/30">
              <p className="text-yellow-200 text-sm mb-2">
                💡 <strong>Solution:</strong>
              </p>
              <p className="text-yellow-200 text-sm">
                Get your free API token from{" "}
                <a 
                  href="https://platform.tavus.io/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-100 underline hover:text-white"
                >
                  Tavus Platform
                </a>
                {" "}and use it in the app.
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            {showTokenError ? (
              <button
                onClick={goBackToSetupToken}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Setup Your Token
              </button>
            ) : (
              <button
                onClick={retryConnection}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => setScreenState({ currentScreen: "intro" })}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center">
          <l-quantum
            size="45"
            speed="1.75"
            color="white"
          ></l-quantum>
          <p className="text-white mt-4">
            {isCreatingConversation ? 'Creating your therapy session...' : 
             isJoiningCall ? 'Connecting to your AI therapist...' : 
             'Preparing your session...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:block relative w-full max-w-6xl aspect-video bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
        {remoteParticipantIds?.length > 0 ? (
          <Video
            id={remoteParticipantIds[0]}
            className="size-full"
            tileClassName="!object-cover rounded-3xl"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <l-quantum
                size="45"
                speed="1.75"
                color="white"
              ></l-quantum>
              <p className="text-white mt-4">Your AI therapist is joining...</p>
            </div>
          </div>
        )}
        
        {localSessionId && (
          <Video
            id={localSessionId}
            tileClassName="!object-cover"
            className="absolute bottom-4 right-4 aspect-video h-32 w-48 overflow-hidden rounded-lg border-2 border-blue-500"
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
      </div>

      {/* Mobile/Tablet Layout - Stacked vertically */}
      <div className="lg:hidden w-full max-w-md flex flex-col gap-4">
        {/* AI Therapist Video - Top */}
        <div className="relative w-full aspect-[4/3] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          {remoteParticipantIds?.length > 0 ? (
            <Video
              id={remoteParticipantIds[0]}
              className="size-full"
              tileClassName="!object-cover rounded-2xl"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <l-quantum
                  size="35"
                  speed="1.75"
                  color="white"
                ></l-quantum>
                <p className="text-white mt-3 text-sm">AI Therapist joining...</p>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
            <p className="text-white text-xs font-medium">AI Therapist</p>
          </div>
        </div>

        {/* User Video - Bottom */}
        {localSessionId && (
          <div className="relative w-full aspect-[4/3] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <Video
              id={localSessionId}
              tileClassName="!object-cover rounded-2xl"
              className="size-full"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
              <p className="text-white text-xs font-medium">You</p>
            </div>
          </div>
        )}

        {/* Controls - Bottom */}
        <div className="flex justify-center gap-4 mt-2">
          <Button
            size="icon"
            className="bg-black/50 border border-white/20 hover:bg-black/70 h-12 w-12"
            onClick={toggleAudio}
          >
            {!isMicEnabled ? (
              <MicOffIcon className="size-5" />
            ) : (
              <MicIcon className="size-5" />
            )}
          </Button>
          <Button
            size="icon"
            className="bg-black/50 border border-white/20 hover:bg-black/70 h-12 w-12"
            onClick={toggleVideo}
          >
            {!isCameraEnabled ? (
              <VideoOffIcon className="size-5" />
            ) : (
              <VideoIcon className="size-5" />
            )}
          </Button>
          <Button
            size="icon"
            className="bg-red-600 hover:bg-red-700 h-12 w-12"
            onClick={leaveConversation}
          >
            <PhoneIcon className="size-5 rotate-[135deg]" />
          </Button>
        </div>
      </div>
      
      <DailyAudio />
    </div>
  );
};