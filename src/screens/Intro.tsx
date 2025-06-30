import React, { useState } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { apiTokenAtom } from "@/store/tokens";
import { conversationAtom } from "@/store/conversation";
import { createConversation } from "@/api/createConversation";
import { motion } from "framer-motion";
import { Heart, Shield, Clock, Users, Brain, Sparkles } from "lucide-react";

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
    if (!token) {
      setError("API token is required");
      return;
    }

    setIsStarting(true);
    setError(null);
    
    try {
      console.log("Creating conversation with token:", token);
      const conversation = await createConversation(token);
      console.log("Conversation created:", conversation);
      
      // Store the conversation in the atom
      setConversation(conversation);
      
      // Navigate to conversation screen
      setScreenState({ currentScreen: "conversation" });
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setError(`Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsStarting(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Trauma-informed, culturally sensitive support tailored to your unique needs"
    },
    {
      icon: Shield,
      title: "Safe & Private",
      description: "Completely confidential space with professional therapeutic boundaries"
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Crisis support and therapeutic guidance whenever you need it most"
    },
    {
      icon: Brain,
      title: "Evidence-Based",
      description: "Neuroscience-informed techniques from CBT, DBT, EMDR, and somatic therapies"
    },
    {
      icon: Users,
      title: "Inclusive Support",
      description: "LGBTQ+ affirming, culturally competent care for all identities and backgrounds"
    },
    {
      icon: Sparkles,
      title: "Holistic Healing",
      description: "Mind-body approach addressing trauma, relationships, identity, and life transitions"
    }
  ];

  const specializations = [
    "Trauma & PTSD Recovery",
    "Anxiety & Depression",
    "Neurodivergence Support",
    "Relationship Counseling",
    "Addiction Recovery",
    "Identity Exploration",
    "Crisis Intervention",
    "Grief & Loss Processing"
  ];

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
          <h2 className="text-2xl font-bold text-white mb-4">Preparing Your Session</h2>
          <p className="text-white/80">
            Creating a safe, therapeutic space just for you...
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={() => {
                  setIsStarting(false);
                  setError(null);
                }}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              Professional AI
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                Therapy Sessions
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience comprehensive, evidence-based therapeutic support with an AI therapist 
              trained in trauma-informed care, neurodivergence support, and culturally sensitive healing approaches.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {specializations.map((spec, index) => (
                <motion.span
                  key={spec}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/20"
                >
                  {spec}
                </motion.span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChat}
              disabled={isStarting}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Your Healing Journey
            </motion.button>

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg max-w-md mx-auto">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {features.map((feature, index) => (
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
        </motion.div>

        {/* Therapeutic Approaches */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Evidence-Based Therapeutic Modalities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Cognitive Behavioral Therapy (CBT)",
              "Dialectical Behavior Therapy (DBT)", 
              "EMDR Trauma Processing",
              "Internal Family Systems (IFS)",
              "Somatic Experiencing",
              "Mindfulness-Based Interventions",
              "Acceptance & Commitment Therapy",
              "Narrative Therapy Techniques"
            ].map((approach, index) => (
              <motion.div
                key={approach}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <p className="text-white/90 font-medium text-center">{approach}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Crisis Support Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-400/30 mb-8"
        >
          <h3 className="text-xl font-bold text-red-200 mb-3">Crisis Support Available</h3>
          <p className="text-red-100/80 mb-4">
            If you're experiencing a mental health crisis, immediate support is available:
          </p>
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

        {/* Privacy & Ethics */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-3">Your Privacy & Safety</h3>
            <p className="text-white/70 text-sm max-w-2xl mx-auto">
              This AI therapy session follows professional therapeutic ethics and boundaries. 
              Your conversations are private and confidential. While this provides valuable support, 
              it's not a replacement for professional mental health treatment when needed.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};