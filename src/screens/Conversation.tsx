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
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  Heart,
  Volume2,
  HelpCircle,
  AlertTriangle,
  MessageCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { apiTokenAtom } from "@/store/tokens";
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
  const [isTherapistSpeaking, setIsTherapistSpeaking] = useState(false);
  const [showHelpTips, setShowHelpTips] = useState(false);
  const [hasEnabledMic, setHasEnabledMic] = useState(false);
  const [therapistJoined, setTherapistJoined] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('initializing');
  const [debugInfo, setDebugInfo] = useState<any>({});

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  // Get conversation URL and ID from the conversation atom
  const conversationUrl = conversation?.conversation_url;
  const conversationId = conversation?.conversation_id;

  // Update debug info
  useEffect(() => {
    setDebugInfo({
      conversationUrl,
      conversationId,
      hasDaily: !!daily,
      dailyState: daily?.meetingState(),
      localSessionId,
      remoteParticipants: remoteParticipantIds.length,
      connectionStatus,
      timestamp: new Date().toISOString()
    });
  }, [conversationUrl, conversationId, daily, localSessionId, remoteParticipantIds, connectionStatus]);

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
    }, 10000);

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      setTimeout(() => setShowControls(false), 10000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showControls]);

  // Join the conversation when URL is available
  useEffect(() => {
    if (!conversationUrl || !daily || isJoiningCall || !conversation) {
      console.log('Waiting for conversation data...', { conversationUrl: !!conversationUrl, daily: !!daily, isJoiningCall, conversation: !!conversation });
      return;
    }

    const joinCall = async () => {
      setIsJoiningCall(true);
      setError(null);
      setConnectionStatus('connecting');
      
      try {
        console.log("🔗 Joining AI therapy session with URL:", conversationUrl);
        console.log("📊 Debug info:", debugInfo);
        
        // Destroy any existing call first
        if (daily.meetingState() !== 'left-meeting') {
          console.log("🔄 Leaving existing meeting...");
          await daily.leave();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        setConnectionStatus('joining');
        
        // Join the call with optimal settings for AI interaction
        console.log("🚀 Attempting to join call...");
        const joinResult = await daily.join({
          url: conversationUrl,
          startVideoOff: false,
          startAudioOff: false,
          userName: "Therapy Client",
        });
        
        console.log("✅ Join result:", joinResult);
        console.log("🎉 Successfully joined AI therapy session");
        
        setConnectionStatus('connected');
        
        // Wait a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Enable video and audio immediately
        await daily.setLocalVideo(true);
        await daily.setLocalAudio(true);
        
        setHasEnabledMic(true);
        setIsLoading(false);
        setError(null);
        setRetryCount(0);
        setConnectionStatus('ready');
        
        console.log("🎤 Audio and video enabled - ready for AI therapist interaction");
        
      } catch (error) {
        console.error("❌ Failed to join AI therapy session:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
        setConnectionStatus('error');
        
        // Retry logic for connection failures
        if (retryCount < 3) {
          console.log(`🔄 Retrying connection (attempt ${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          setIsJoiningCall(false);
          setConnectionStatus('retrying');
          
          // Wait before retry
          setTimeout(() => {
            if (conversationUrl && daily) {
              joinCall();
            }
          }, 3000);
          return;
        }
        
        setError(`Connection failed after 3 attempts: ${errorMessage}`);
        setIsLoading(false);
      } finally {
        setIsJoiningCall(false);
      }
    };

    // Join immediately when conversation data is available
    joinCall();
    
  }, [daily, isJoiningCall, conversationUrl, conversation, retryCount]);

  // Monitor when AI therapist joins and becomes active
  useEffect(() => {
    if (remoteParticipantIds.length > 0 && !therapistJoined) {
      console.log("🤖 AI therapist has joined the session!");
      setTherapistJoined(true);
      setConnectionStatus('therapist_joined');
      
      // Ensure microphone is enabled when therapist joins
      if (daily && !hasEnabledMic) {
        daily.setLocalAudio(true);
        setHasEnabledMic(true);
        console.log("🎤 Microphone enabled for AI therapist interaction");
      }
      
      // Mark session as ready
      setTimeout(() => {
        setSessionReady(true);
        setConnectionStatus('session_active');
        console.log("✨ Session is fully ready - AI therapist should start speaking");
      }, 2000);
      
    } else if (remoteParticipantIds.length === 0 && therapistJoined) {
      console.log("👋 AI therapist has left the session");
      setTherapistJoined(false);
      setSessionReady(false);
      setConnectionStatus('therapist_left');
    }
  }, [remoteParticipantIds, therapistJoined, daily, hasEnabledMic]);

  // Monitor audio levels for speaking indicator (simulate for now)
  useEffect(() => {
    if (!daily || !therapistJoined) return;

    const interval = setInterval(() => {
      // Simulate speaking detection - in real implementation this would use actual audio levels
      setIsTherapistSpeaking(Math.random() > 0.85);
    }, 2000);

    return () => clearInterval(interval);
  }, [daily, therapistJoined]);

  const toggleVideo = useCallback(() => {
    if (daily) {
      const newVideoState = !isCameraEnabled;
      daily.setLocalVideo(newVideoState);
      console.log(`📹 Camera ${newVideoState ? 'enabled' : 'disabled'}`);
    }
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    if (daily) {
      const newAudioState = !isMicEnabled;
      daily.setLocalAudio(newAudioState);
      setHasEnabledMic(newAudioState);
      
      if (newAudioState) {
        console.log("🎤 Microphone enabled - AI therapist can now hear you");
      } else {
        console.log("🔇 Microphone disabled - AI therapist cannot hear you");
      }
    }
  }, [daily, isMicEnabled]);

  const endConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
        method: "POST",
        headers: {
          "x-api-key": token!,
        },
      });

      if (!response.ok) {
        console.error("Failed to end conversation:", response.status);
      } else {
        console.log("Conversation ended successfully");
      }
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  };

  const leaveConversation = useCallback(async () => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    console.log('👋 Leaving AI therapy conversation', { 
      conversationId: conversationId,
      sessionDuration,
    });
    
    daily?.leave();
    daily?.destroy();
    
    // End the conversation via API if we have the necessary data
    if (conversationId && token) {
      try {
        await endConversation(conversationId);
      } catch (error) {
        console.error('Failed to end conversation:', error);
        // Don't block the user from leaving even if API call fails
      }
    }
    
    setConversation(null);
    setScreenState({ currentScreen: "finalScreen" });
  }, [daily, setConversation, setScreenState, sessionStartTime, conversationId, token]);

  const retryConnection = useCallback(() => {
    console.log('🔄 Retrying AI therapy connection');
    setIsLoading(true);
    setError(null);
    setIsJoiningCall(false);
    setHasEnabledMic(false);
    setTherapistJoined(false);
    setSessionReady(false);
    setRetryCount(0);
    setConnectionStatus('retrying');
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const helpTips = [
    "The AI therapist should greet you first when they join - listen for their voice",
    "Make sure your microphone is enabled (green icon) so the AI can hear your responses",
    "Speak naturally and clearly - the AI is trained to understand conversational speech",
    "The AI can see your facial expressions and body language through the video",
    "If the AI seems unresponsive, check your microphone and try speaking louder",
    "Wait for the AI to finish speaking before responding, just like a real conversation"
  ];

  // Add timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !error) {
        console.log("⏰ Session connection taking longer than expected");
        setError("Connection is taking longer than expected. Please try again.");
        setIsLoading(false);
      }
    }, 45000); // 45 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, error]);

  // Check if we have conversation data
  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-4">No Session Found</h2>
          <p className="text-white mb-6 text-sm">No active therapy session found. Please start a new session.</p>
          
          <button
            onClick={() => setScreenState({ currentScreen: "intro" })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Start New Session
          </button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center max-w-lg w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-4">Connection Issue</h2>
          <p className="text-white mb-6 text-sm">{error}</p>
          
          {/* Debug Information */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-6 text-left">
            <p className="text-gray-300 text-xs mb-2">Debug Info:</p>
            <pre className="text-gray-400 text-xs overflow-auto max-h-32">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          
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

  if (isLoading || !therapistJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center max-w-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {connectionStatus === 'connecting' ? 'Connecting to Session' :
             connectionStatus === 'joining' ? 'Joining Video Call' :
             connectionStatus === 'connected' ? 'Setting Up Video' :
             connectionStatus === 'retrying' ? 'Retrying Connection' :
             !therapistJoined ? 'Waiting for AI Therapist' : 'Preparing Session'}
          </h2>
          <p className="text-white/80 mb-4">
            {connectionStatus === 'connecting' ? 'Establishing secure connection...' :
             connectionStatus === 'joining' ? `Joining your therapy session... ${retryCount > 0 ? `(Retry ${retryCount}/3)` : ''}` :
             connectionStatus === 'connected' ? 'Configuring audio and video...' :
             connectionStatus === 'retrying' ? 'Attempting to reconnect...' :
             !therapistJoined ? 'Your AI therapist is joining the session...' : 'Preparing your therapeutic session...'}
          </p>
          
          {/* Connection Status */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'ready' ? 'bg-green-400' :
                connectionStatus === 'error' ? 'bg-red-400' :
                'bg-yellow-400 animate-pulse'
              }`}></div>
              <p className="text-blue-200 text-sm font-medium">
                Status: {connectionStatus.replace('_', ' ')}
              </p>
            </div>
            <p className="text-blue-200 text-xs">
              Session: {conversationId}
            </p>
          </div>

          {/* Debug info for development */}
          {import.meta.env.MODE === 'development' && (
            <div className="bg-gray-800/50 rounded-lg p-3 text-left">
              <p className="text-gray-300 text-xs mb-2">Debug Info:</p>
              <pre className="text-gray-400 text-xs overflow-auto max-h-24">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
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
                    <div className={`w-2 h-2 rounded-full ${sessionReady ? 'bg-green-400' : therapistJoined ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <span className="text-white text-sm font-medium">
                      {sessionReady ? 'Session Active' : therapistJoined ? 'Therapist Joining' : 'Connecting'}
                    </span>
                    <MessageCircle className="w-3 h-3 text-green-400" />
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

      {/* Microphone Warning */}
      {therapistJoined && !isMicEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="bg-red-500/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-red-400/50">
            <div className="flex items-center gap-3">
              <MicOffIcon className="w-5 h-5 text-red-100" />
              <p className="text-red-100 font-medium">
                Enable microphone - AI therapist cannot hear you!
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

      {/* Main Video Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Desktop Layout */}
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
                    <span className="text-green-100 text-sm font-medium">AI Therapist Speaking</span>
                  </div>
                </motion.div>
              )}
              {/* Session Status */}
              <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 text-blue-100" />
                  <span className="text-blue-100 text-sm font-medium">
                    {sessionReady ? 'Interactive Session' : 'Connecting'}
                  </span>
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
                  They will greet you when ready
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

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden w-full max-w-md space-y-4">
          {/* AI Therapist Video */}
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
                  <MessageCircle className="w-3 h-3 text-blue-100" />
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
              <p className="text-white text-xs font-medium">AI Therapist</p>
            </div>
          </div>

          {/* User Video */}
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