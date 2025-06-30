import React, { useState } from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { motion } from "framer-motion";
import { Heart, Star, ArrowRight, Download, Share2, Calendar, Phone } from "lucide-react";

export const FinalScreen: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [showResources, setShowResources] = useState(false);

  const handleReturn = () => {
    setScreenState({ currentScreen: "intro" });
  };

  const resources = [
    {
      title: "Crisis Support",
      items: [
        "National Suicide Prevention Lifeline: 988",
        "Crisis Text Line: Text HOME to 741741",
        "National Domestic Violence Hotline: 1-800-799-7233",
        "RAINN Sexual Assault Hotline: 1-800-656-4673"
      ]
    },
    {
      title: "Mental Health Resources",
      items: [
        "NAMI (National Alliance on Mental Illness)",
        "Psychology Today Therapist Directory",
        "SAMHSA Treatment Locator",
        "Local Community Mental Health Centers"
      ]
    },
    {
      title: "Self-Care Apps & Tools",
      items: [
        "Headspace - Meditation & Mindfulness",
        "Calm - Sleep & Relaxation",
        "DBT Coach - Dialectical Behavior Therapy",
        "PTSD Coach - Trauma Recovery Support"
      ]
    }
  ];

  const selfCareReminders = [
    "Practice the grounding techniques we discussed",
    "Remember: healing is not linear - be patient with yourself",
    "Your feelings are valid and your experiences matter",
    "Small steps forward are still progress",
    "You have survived 100% of your difficult days so far",
    "It's okay to ask for help when you need it"
  ];

  return (
    <div className="min-h-screen bg-black overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Thank You Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              Thank You for Your Courage
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              It takes incredible strength to reach out for support. You've taken an important step 
              in your healing journey today, and that matters more than you know.
            </p>

            <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-green-200 font-semibold">Session Complete & Secure</p>
              </div>
              <p className="text-green-100/80 text-sm">
                Your conversation was completely private and confidential. No personal information was stored or shared.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Session Feedback */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How was your session?</h2>
          
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-all duration-200 hover:scale-110"
              >
                <Star 
                  className={`w-8 h-8 ${
                    star <= rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-white/30 hover:text-yellow-400/50'
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Feedback Text */}
          <div className="max-w-md mx-auto">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the session (optional)..."
              className="w-full p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              rows={4}
            />
          </div>
        </motion.div>

        {/* Self-Care Reminders */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Gentle Reminders for Your Journey</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {selfCareReminders.map((reminder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <p className="text-white/90 text-sm leading-relaxed">💙 {reminder}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Additional Support Resources</h2>
            <button
              onClick={() => setShowResources(!showResources)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {showResources ? 'Hide' : 'Show'} Resources
              <ArrowRight className={`w-4 h-4 transition-transform ${showResources ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showResources && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {resources.map((category, index) => (
                <div key={category.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReturn}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
          >
            <Heart className="w-5 h-5" />
            Start New Session
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('tel:988', '_self')}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
          >
            <Phone className="w-5 h-5" />
            Crisis Support: 988
          </motion.button>
        </motion.div>

        {/* Final Message */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
              Remember: You are worthy of love, support, and healing. Your journey matters, 
              and you don't have to walk it alone. Take care of yourself with the same 
              compassion you would offer a dear friend.
            </p>
            <p className="text-white/60 text-sm mt-4 italic">
              "Healing is not linear, but every step forward is a victory worth celebrating." 💙
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};