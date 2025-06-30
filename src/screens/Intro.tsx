import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { apiTokenAtom } from "@/store/tokens";
import { conversationAtom } from "@/store/conversation";
import { motion } from "framer-motion";
import { Heart, Shield, Clock, Users, Brain, Sparkles, AlertTriangle, CheckCircle, Trophy, Zap, Globe } from "lucide-react";
import { ConversationStatus } from "@/types";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);
  const [, setConversation] = useAtom(conversationAtom);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the default API key only if no token exists
  React.useEffect(() => {
    if (!token) {
      const defaultToken = "a585d2b465da47238e21335438dd4d1c";
      setToken(defaultToken);
      localStorage.setItem('tavus-token', defaultToken);
    }
  }, [token, setToken]);

  const handleStartChat = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      // Use your existing active conversation
      const conversationData = {
        conversation_id: "cd2ea0b51b8cb47b",
        conversation_url: "https://tavus.daily.co/cd2ea0b51b8cb47b",
        status: "active",
        persona_id: "p13e9a420a8e",
        replica_id: "r91c80eca351",
        created_at: "June 30, 1:52 pm"
      };
      
      // Store the conversation data
      setConversation({
        conversation_id: conversationData.conversation_id,
        conversation_name: "AI Therapy Session",
        status: ConversationStatus.ACTIVE,
        conversation_url: conversationData.conversation_url,
        created_at: conversationData.created_at,
      });
      
      // Navigate to conversation screen
      setTimeout(() => {
        setScreenState({ currentScreen: "conversation" });
      }, 1000);
      
    } catch (error) {
      console.error("Failed to start therapy session:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
      setError(errorMessage);
      setIsStarting(false);
    }
  };

  const hackathonFeatures = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "Connect to AI therapist in seconds - no appointments, no waiting lists"
    },
    {
      icon: Brain,
      title: "Real AI Interaction",
      description: "Full video conversations with AI that sees, hears, and responds naturally"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Zero data storage, end-to-end encryption, completely anonymous sessions"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "24/7 availability breaks down barriers to mental health care worldwide"
    },
    {
      icon: Heart,
      title: "Professional Quality",
      description: "Evidence-based therapy techniques from CBT, DBT, and trauma-informed care"
    },
    {
      icon: Trophy,
      title: "Revolutionary Tech",
      description: "First interactive video AI therapist using cutting-edge conversational AI"
    }
  ];

  const stats = [
    { number: "24/7", label: "Availability" },
    { number: "0s", label: "Wait Time" },
    { number: "100%", label: "Private" },
    { number: "∞", label: "Scalability" }
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
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-4">Connection Issue</h2>
          <p className="text-white mb-6 text-sm">{error}</p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            <button
              onClick={() => {
                setError(null);
                handleStartChat();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setError(null)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isStarting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
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
            Connecting to AI Therapist
          </h2>
          <p className="text-white/80">
            Launching your interactive therapy session...
          </p>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 mt-4">
            <p className="text-green-200 text-sm">
              🚀 Hackathon Demo Ready
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hackathon Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-yellow-400/30">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 font-semibold">Hackathon Demo</span>
            <span className="text-yellow-300">•</span>
            <span className="text-yellow-200">Live AI Therapy Platform</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Revolutionary
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                AI Therapy Platform
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              The world's first interactive video AI therapist. Get instant, professional mental health support 
              through real-time video conversations. No appointments, no waiting - just immediate, compassionate care.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="text-2xl font-bold text-blue-400 mb-1">{stat.number}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-green-400/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-green-200 font-semibold">Live Demo Ready</p>
              </div>
              <p className="text-green-100/80 text-sm">
                Interactive AI therapist waiting • Full video conversation • Completely private
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChat}
              disabled={isStarting}
              className="px-12 py-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white text-xl font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Start Live Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Hackathon Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            🏆 Why This Will Win
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathonFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Impact Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 mb-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">🌍 Global Impact</h3>
          <p className="text-white/80 text-lg mb-4">
            Mental health care has a 6+ month wait time and costs $100-300 per session. 
            Our platform provides instant, professional therapy for free.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white font-semibold">
              This could help millions of people get mental health support when they need it most.
            </p>
          </div>
        </motion.div>

        {/* Crisis Support */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-400/30 mb-8"
        >
          <h3 className="text-xl font-bold text-red-200 mb-3">🚨 Crisis Support Available</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-red-200 font-semibold">Suicide Prevention: 988</p>
              <p className="text-red-200 font-semibold">Crisis Text: Text HOME to 741741</p>
            </div>
            <div>
              <p className="text-red-200 font-semibold">Domestic Violence: 1-800-799-7233</p>
              <p className="text-red-200 font-semibold">Sexual Assault: 1-800-656-4673</p>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">⚡ Powered By</h3>
            <p className="text-white/70 text-sm">
              React • TypeScript • Tavus AI • Daily.co WebRTC • Framer Motion • Tailwind CSS
            </p>
            <div className="mt-4 text-white/40 text-xs">
              Built for hackathon • Deployed on Netlify • Ready to scale globally
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};