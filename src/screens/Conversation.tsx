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
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  Heart,
  Volume2,
  HelpCircle
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

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Use the specific conversation URL directly if no conversation exists
  const conversationUrl = "https://tavus.daily.co/ce5f6050ae52d4b4";
  const conversationId = "ce5f6050ae52d4b4";

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

  // Set up the conversation object with the provided details if none exists
  useEffect(() => {
    if (!conversation) {
      const staticConversation = {
        conversation_id: conversationId,
        conversation_name: "Therapeutic Session",
        status: ConversationStatus.ACTIVE,
        conversation_url: conversationUrl,
        created_at: new Date().toLocaleString(),
      };
      setConversation(staticConversation);
    }
  }, [conversation, setConversation]);

  useEffect(() => {
    const urlToUse = conversation?.conversation_url || conversationUrl;
    
    if (!urlToUse || !daily || isJoiningCall) return;

    const joinCall = async () => {
      setIsJoiningCall(true);
      
      try {
        console.log('Joining therapy session', { 
          conversationId: conversation?.conversation_id || conversationId,
          url: urlToUse 
        });
        
        await daily.join({
          url: urlToUse,
          startVideoOff: false,
          startAudioOff: true,
        });
        
        console.log('Successfully joined therapy session');
        daily.setLocalVideo(true);
        daily.setLocalAudio(false);
        setIsLoading(false);
        setError(null);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to join therapy session', { error, conversationId: conversation?.conversation_id || conversationId });
        
        // Provide user-friendly error messages
        let userErrorMessage = errorMessage;
        if (errorMessage.includes('does not exist')) {
          userErrorMessage = 'The therapy session is no longer available. Please start a new session.';
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          userErrorMessage = 'Network connection issue. Please check your internet and try again.';
        } else {
          userErrorMessage = 'Unable to connect to the therapy session. Please try again.';
        }
        
        setError(userErrorMessage);
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
      console.log('AI therapist joined, enabling audio');
      setTimeout(() => daily?.setLocalAudio(true), 2000);
    }
  }, [remoteParticipantIds, daily, localAudio.isOff]);

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
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const leaveConversation = useCallback(() => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    console.log('Leaving conversation', { 
      conversationId: conversation?.conversation_id || conversationId,
      sessionDuration 
    });
    
    daily?.leave();
    daily?.destroy();
    
    if (token && (conversation?.conversation_id || conversationId)) {
      endConversation(token, conversation?.conversation_id || conversationId).catch(error => {
        console.error('Failed to end conversation via API', error);
      });
    }
    
    setConversation(null);
    setScreenState({ currentScreen: "finalScreen" });
  }, [daily, token, conversation?.conversation_id, setConversation, setScreenState, sessionStartTime]);

  const retryConnection = useCallback(() => {
    console.log('Retrying connection');
    setIsLoading(true);
    setError(null);
    setIsJoiningCall(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const helpTips = [
    "Speak naturally - your AI therapist is trained to listen and respond with empathy",
    "It's okay to take pauses - silence is part of the therapeutic process",
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
          <h2 className="text-2xl font-bold text-white mb-4">Preparing Your Session</h2>
          <p className="text-white/80 mb-4">
            {isJoiningCall ? 'Connecting to your AI therapist...' : 'Creating a safe therapeutic space...'}
          </p>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
            <p className="text-blue-200 text-sm">
              ✨ Setting up secure, confidential environment
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
                    <span className="text-white text-sm font-medium">Session Active</span>
                  </div>
                  <div className="text-white/70 text-sm">{formatTime(sessionTime)}</div>
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
                <p className="text-white/60 text-sm mt-2">Creating a safe space for healing</p>
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
                  className={`bg-black/60 border border-white/20 hover:bg-black/80 ${!isMicEnabled ? 'bg-red-600/80 hover:bg-red-700/80' : ''}`}
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
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
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
              className={`bg-black/60 border border-white/20 hover:bg-black/80 h-12 w-12 ${!isMicEnabled ? 'bg-red-600/80 hover:bg-red-700/80' : ''}`}
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