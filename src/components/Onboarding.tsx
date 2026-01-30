'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleSkip}
          className="absolute top-6 right-6 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          Skip
        </motion.button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === step ? 'bg-purple-400' : 'bg-white/20'
              }`}
              animate={i === step ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 0 && <StepOne key="step1" />}
          {step === 1 && <StepTwo key="step2" />}
          {step === 2 && <StepThree key="step3" />}
        </AnimatePresence>

        {/* Next button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleNext}
          className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98]"
        >
          {step < 2 ? 'Next' : "Let's go! 🚀"}
        </motion.button>
      </div>
    </div>
  );
}

// Step 1: The Problem
function StepOne() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Animated mountain/overwhelm visual */}
      <motion.div
        className="text-8xl mb-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        🏔️
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3"
      >
        Big tasks feel impossible
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-lg"
      >
        Your brain sees a mountain and freezes.
        <br />
        That&apos;s not laziness — it&apos;s task paralysis.
      </motion.p>
    </motion.div>
  );
}

// Step 2: The Solution
function StepTwo() {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Trigger breakdown animation after mount
  useState(() => {
    const timer = setTimeout(() => setShowBreakdown(true), 600);
    return () => clearTimeout(timer);
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Animated task breakdown */}
      <div className="h-32 flex items-center justify-center mb-6 relative">
        <AnimatePresence mode="wait">
          {!showBreakdown ? (
            <motion.div
              key="big-task"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white/10 backdrop-blur rounded-xl px-6 py-3 text-white font-medium"
            >
              📝 Write the entire report
            </motion.div>
          ) : (
            <motion.div
              key="small-tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2"
            >
              {['Open document', 'Write first sentence', 'Add one bullet point'].map((task, i) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur rounded-lg px-4 py-2 text-white/90 text-sm flex items-center gap-2"
                >
                  <span className="text-green-400">✓</span>
                  {task}
                  <span className="text-white/40 text-xs ml-auto">5 min</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3"
      >
        We break it into tiny steps
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-lg"
      >
        5 minutes each. One at a time.
        <br />
        Small wins build momentum.
      </motion.p>
    </motion.div>
  );
}

// Step 3: The Stuck Button
function StepThree() {
  const [isStuck, setIsStuck] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Interactive stuck demo */}
      <div className="h-32 flex flex-col items-center justify-center mb-6 gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={isStuck ? 'smaller' : 'original'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-white"
          >
            {isStuck ? '👀 Just open the document' : '📝 Start writing the intro'}
          </motion.div>
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsStuck(!isStuck)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isStuck 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
          }`}
        >
          {isStuck ? '✨ Much better!' : "😵 I'm stuck"}
        </motion.button>
      </div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-3"
      >
        Stuck? We make it smaller
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-lg"
      >
        No step is too small.
        <br />
        The only goal is to start.
      </motion.p>
    </motion.div>
  );
}
