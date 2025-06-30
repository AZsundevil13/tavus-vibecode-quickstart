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
import { createPersistentConversation } from "@/api/createPersistentConversation";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  Heart,
  Volume2,
  HelpCircle,
  Zap
} from "lucide-react";
import { apiTokenAtom } from "@/store/tokens";
import { ConversationStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const token = useAtomValue(apiTokenAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [showControls, setShowControls] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [isTherapistSpeaking, setIsTherapistSpeaking] = useState(false);
  const [showHelpTips, setShowHelpTips] = useState(false);
  const [hasEnabledMic, setHasEnabledMic] = useState(false);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      setTimeout(() => setShowControls(false), 5000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showControls]);

  // Set up the conversation object - always create a new session if none exists
  useEffect(() => {
    if (!conversation) {
      createNewSession();
    }
  }, [conversation, setConversation]);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Creating new persistent conversation session");
      
      const newConversation = await createPersistentConversation(token || undefined);
      setConversation(newConversation);
      
      console.log("New persistent session created:", newConversation);
    } catch (error) {
      console.error("Failed to create new session:", error);
      setError(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const conversationUrl = conversation?.conversation_url;
    
    if (!conversationUrl || !daily || isJoiningCall) return;

    const joinCall = async () => {
      setIsJoiningCall(true);
      
      try {
        console.log("Joining therapy session with URL:", conversationUrl);
        console.log("Session type: Persistent (Always Available)");
        
        await daily.join({
          url: conversationUrl,
          startVideoOff: false,
          startAudioOff: false, // Start with audio ON for interaction
        });
        
        console.log("Successfully joined therapy session");
        
        // Ensure both video and audio are enabled for proper interaction
        daily.setLocalVideo(true);
        daily.setLocalAudio(true);
        
        setIsLoading(false);
        setError(null);
        setHasEnabledMic(true);
        
        console.log("Audio and video enabled - ready for AI therapist interaction");
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

  // Ensure microphone is enabled when AI therapist joins
  useEffect(() => {
    if (remoteParticipantIds.length > 0 && daily && !hasEnabledMic) {
      console.log("AI therapist joined, ensuring microphone is enabled for interaction");
      
      // Enable microphone immediately when therapist joins
      daily.setLocalAudio(true);
      setHasEnabledMic(true);
      
      // Show a brief notification that the session is ready
      setTimeout(() => {
        console.log("Session is ready - AI therapist can now see and hear you");
      }, 1000);
    }
  }, [remoteParticipantIds, daily, hasEnabledMic]);

  // Monitor audio levels for speaking indicator
  useEffect(() => {
    if (!daily || !remoteParticipantIds.length) return;

    const interval = setInterval(() => {
      // Simulate speaking detection (in real implementation, you'd use actual audio level detection)
      setIsTherapistSpeaking(Math.random() > 0.7);
    }, 1000);

    return () => clearInterval(interval);
  }, [daily, remoteParticipantIds]);

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    const newAudioState = !isMicEnabled;
    daily?.setLocalAudio(newAudioState);
    
    if (newAudioState) {
      setHasEnabledMic(true);
      console.log("Microphone enabled - you can now speak to the AI therapist");
    } else {
      console.log("Microphone disabled - AI therapist cannot hear you");
    }
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(() => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const conversationId = conversation?.conversation_id;
    
    console.log('Leaving conversation', { 
      conversationId: conversationId,
      sessionDuration,
      sessionType: 'persistent'
    });
    
    daily?.leave();
    daily?.destroy();
    
    // Only end conversation if we have a token and conversation ID
    if (token && conversationId) {
      endConversation(token, conversationId).catch(error => {
        console.error('Failed to end conversation via API', error);
      });
    }
    
    setConversation(null);
    setScreenState({ currentScreen: "finalScreen" });
  }, [daily, token, setConversation, setScreenState, sessionStartTime, conversation?.conversation_id]);

  const retryConnection = useCallback(() => {
    console.log('Retrying connection');
    setIsLoading(true);
    setError(null);
    setIsJoiningCall(false);
    setHasEnabledMic(false);
    setConversation(null); // Reset conversation to trigger new session creation
  }, [setConversation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const helpTips = [
    "Speak naturally - your AI therapist can see and hear you, and will respond to what you say",
    "Make sure your microphone is enabled (green microphone icon) so the AI therapist can hear you",
    "The AI therapist will greet you first and ask how you're feeling - respond naturally",
    "It's okay to take pauses - the AI therapist will wait for you to speak",
    "Share what feels comfortable - you control the pace and depth of conversation",
    "If you feel overwhelmed, let your therapist know - they can guide you through grounding exercises",
    "This is your safe space - there's no judgment here, only support and understanding"
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-4">Connection Issue</h2>
          <p className="text-white mb-6">{error}</p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            <button
              onClick={retryConnection}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setScreenState({ currentScreen: "intro" })}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Connecting to Your AI Therapist
          </h2>
          <p className="text-white/80 mb-4">
            {isJoiningCall 
              ? 'Joining the always-available therapeutic space...'
              : 'Creating a safe therapeutic space...'
            }
          </p>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-200" />
              <p className="text-blue-200 text-sm font-medium">
                Always-Available Session
              </p>
            </div>
            <p className="text-blue-200 text-xs">
              ✨ Setting up secure, interactive environment
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Session Info Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-20"
          >
            <div className="flex justify-between items-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connectionQuality === 'good' ? 'bg-green-400' : connectionQuality === 'fair' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <span className="text-white text-sm font-medium">
                      Always-Available Session
                    </span>
                    <Zap className="w-3 h-3 text-green-400" />
                  </div>
                  <div className="text-white/70 text-sm">{formatTime(sessionTime)}</div>
                  {!isMicEnabled && (
                    <div className="bg-red-500/80 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-red-100 text-xs font-medium">Mic Off</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowHelpTips(!showHelpTips)}
                  className="bg-black/60 backdrop-blur-sm rounded-xl p-2 border border-white/20 hover:bg-black/80 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Microphone Reminder */}
      {remoteParticipantIds.length > 0 && !isMicEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="bg-orange-500/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-orange-400/50">
            <div className="flex items-center gap-3">
              <MicOffIcon className="w-5 h-5 text-orange-100" />
              <p className="text-orange-100 font-medium">
                Enable your microphone so the AI therapist can hear you
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Tips Modal */}
      <AnimatePresence>
        {showHelpTips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4"
            onClick={() => setShowHelpTips(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6 text-center">Session Tips</h3>
              <div className="space-y-4">
                {helpTips.map((tip, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-white/90 text-sm leading-relaxed">💡 {tip}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowHelpTips(false)}
                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Video Container - Full screen layout */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Desktop Layout - Side by side */}
        <div className="hidden lg:block relative w-full max-w-6xl aspect-video bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
          {remoteParticipantIds?.length > 0 ? (
            <div className="relative size-full">
              <Video
                id={remoteParticipantIds[0]}
                className="size-full"
                tileClassName="!object-cover rounded-3xl"
              />
              {/* Therapist Speaking Indicator */}
              {isTherapistSpeaking && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 left-4 bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1 border border-green-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                    <span className="text-green-100 text-sm font-medium">AI Therapist</span>
                  </div>
                </motion.div>
              )}
              {/* Always Available Indicator */}
              <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-100" />
                  <span className="text-blue-100 text-sm font-medium">Always Available</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-white text-lg">Your AI therapist is joining...</p>
                <p className="text-white/60 text-sm mt-2">
                  Connecting to always-available support
                </p>
              </div>
            </div>
          )}
          
          {localSessionId && (
            <div className="absolute bottom-4 right-4">
              <Video
                id={localSessionId}
                tileClassName="!object-cover"
                className="aspect-video h-32 w-48 overflow-hidden rounded-lg border-2 border-blue-500"
              />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white text-xs font-medium">You</span>
              </div>
              {isMicEnabled && (
                <div className="absolute top-2 right-2 bg-green-500/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Volume2 className="w-3 h-3 text-green-100" />
                </div>
              )}
            </div>
          )}
          
          {/* Desktop Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4"
              >
                <Button
                  size="icon"
                  className={`bg-black/60 border border-white/20 hover:bg-black/80 ${!isMicEnabled ? 'bg-red-600/80 hover:bg-red-700/80' : 'bg-green-600/80 hover:bg-green-700/80'}`}
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
                  className={`bg-black/60 border border-white/20 hover:bg-black/80 ${!isCameraEnabled ? 'bg-gray-600/80 hover:bg-gray-700/80' : ''}`}
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
                  className="bg-red-600/80 hover:bg-red-700/80 border border-red-400/30"
                  onClick={leaveConversation}
                >
                  <PhoneIcon className="size-6 rotate-[135deg]" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile/Tablet Layout - Stacked vertically */}
        <div className="lg:hidden w-full max-w-md space-y-4">
          {/* AI Therapist Video - Top */}
          <div className="relative w-full aspect-[4/3] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {remoteParticipantIds?.length > 0 ? (
              <div className="relative size-full">
                <Video
                  id={remoteParticipantIds[0]}
                  className="size-full"
                  tileClassName="!object-cover rounded-2xl"
                />
                {isTherapistSpeaking && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 left-3 bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1 border border-green-400"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                      <span className="text-green-100 text-xs font-medium">Speaking</span>
                    </div>
                  </motion.div>
                )}
                <div className="absolute top-3 right-3 bg-blue-500/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Zap className="w-3 h-3 text-blue-100" />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
                  >
                    <Heart className="w-6 h-6 text-white" />
                  </motion.div>
                  <p className="text-white text-sm">AI Therapist joining...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
              <p className="text-white text-xs font-medium">
                Always-Available AI Therapist
              </p>
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
              {isMicEnabled && (
                <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Volume2 className="w-4 h-4 text-green-100" />
                </div>
              )}
            </div>
          )}

          {/* Mobile Controls */}
          <div className="flex justify-center gap-4 mt-4">
            <Button
              size="icon"
              className={`bg-black/60 border border-white/20 hover:bg-black/80 h-12 w-12 ${!isMicEnabled ? 'bg-red-600/80 hover:bg-red-700/80' : 'bg-green-600/80 hover:bg-green-700/80'}`}
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
              className={`bg-black/60 border border-white/20 hover:bg-black/80 h-12 w-12 ${!isCameraEnabled ? 'bg-gray-600/80 hover:bg-gray-700/80' : ''}`}
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
              className="bg-red-600/80 hover:bg-red-700/80 h-12 w-12 border border-red-400/30"
              onClick={leaveConversation}
            >
              <PhoneIcon className="size-5 rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </div>
      
      <DailyAudio />
    </div>
  );
};