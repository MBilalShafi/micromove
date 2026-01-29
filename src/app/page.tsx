"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

type AppState = "start" | "loading" | "session" | "complete";

interface MicroStep {
  id: number;
  text: string;
  completed: boolean;
  skipped: boolean;
  timeSpent: number;
}

interface SessionData {
  task: string;
  steps: MicroStep[];
  currentStepIndex: number;
  timeLeft: number;
  totalTimeSpent: number;
  state: AppState;
}

const TIMER_DURATION = 5 * 60; // 5 minutes in seconds
const STORAGE_KEY = "micromove-session";

// Encouraging messages
const encouragements = [
  "You've got this! 💪",
  "One step at a time.",
  "Small wins add up.",
  "Progress, not perfection.",
  "Keep the momentum going!",
  "You're doing great!",
  "Focus on just this step.",
  "Almost there!",
  "Just 5 minutes. You can do anything for 5 minutes.",
  "The hardest part is starting. You already did that.",
];

const completionMessages = [
  "🎉 You crushed it!",
  "🚀 Mission accomplished!",
  "✨ Look at you go!",
  "🏆 Task demolished!",
  "💫 You made it happen!",
  "🔥 Unstoppable!",
];

const stuckMessages = [
  "No worries! Let's make it smaller.",
  "Happens to everyone. Here's an easier version:",
  "Let's shrink this down:",
  "Sometimes smaller is better:",
];

export default function Home() {
  const [state, setState] = useState<AppState>("start");
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [encouragement, setEncouragement] = useState(encouragements[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isReframing, setIsReframing] = useState(false);
  const [timerDuration, setTimerDuration] = useState(TIMER_DURATION);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: SessionData = JSON.parse(saved);
        // Only restore if there's an active session
        if (data.state === "session" && data.steps.length > 0) {
          setTask(data.task);
          setSteps(data.steps);
          setCurrentStepIndex(data.currentStepIndex);
          setTimeLeft(data.timeLeft);
          setTotalTimeSpent(data.totalTimeSpent);
          setState("session");
          // Don't auto-start timer - let user resume
        }
      }
    } catch (e) {
      console.error("Failed to load session:", e);
    }
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (state === "session" && steps.length > 0) {
      const data: SessionData = {
        task,
        steps,
        currentStepIndex,
        timeLeft,
        totalTimeSpent,
        state,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [state, task, steps, currentStepIndex, timeLeft, totalTimeSpent]);

  // Clear storage on complete or reset
  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
        setTotalTimeSpent((t) => t + 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      playNotification();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Rotate encouragements
  useEffect(() => {
    const interval = setInterval(() => {
      setEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state === "session") {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleDone();
        } else if (e.key === " " && e.target === document.body) {
          e.preventDefault();
          setIsTimerRunning((r) => !r);
        } else if (e.key === "s" && e.target === document.body) {
          handleStuck();
        }
      } else if (state === "start" && e.key === "Enter" && e.metaKey) {
        breakdownTask();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, currentStepIndex, steps]);

  // Focus input on start
  useEffect(() => {
    if (state === "start" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  const playNotification = () => {
    if (!soundEnabled) return;
    
    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Play sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error("Audio failed:", e);
    }
  };

  const breakdownTask = async () => {
    if (!task.trim()) return;
    setState("loading");
    
    try {
      const response = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      
      const data = await response.json();
      
      if (data.steps && data.steps.length > 0) {
        setSteps(data.steps.map((text: string, i: number) => ({
          id: i,
          text,
          completed: false,
          skipped: false,
          timeSpent: 0,
        })));
        setState("session");
        setIsTimerRunning(true);
        setTimeLeft(timerDuration);
      } else {
        throw new Error("No steps returned");
      }
    } catch (error) {
      console.error("Error breaking down task:", error);
      // Fallback steps
      setSteps([
        { id: 0, text: `Open the files/tools needed for: ${task.slice(0, 40)}`, completed: false, skipped: false, timeSpent: 0 },
        { id: 1, text: "Spend 2 minutes just looking at what's there - no action required", completed: false, skipped: false, timeSpent: 0 },
        { id: 2, text: "Do the absolute smallest thing you can", completed: false, skipped: false, timeSpent: 0 },
        { id: 3, text: "Build on that with one more small piece", completed: false, skipped: false, timeSpent: 0 },
        { id: 4, text: "Review and decide: continue or take a break?", completed: false, skipped: false, timeSpent: 0 },
      ]);
      setState("session");
      setIsTimerRunning(true);
      setTimeLeft(timerDuration);
    }
  };

  const handleDone = () => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].completed = true;
    newSteps[currentStepIndex].timeSpent = timerDuration - timeLeft;
    setSteps(newSteps);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setTimeLeft(timerDuration);
      setEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
      // Small celebration sound
      if (soundEnabled) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 600;
          oscillator.type = "sine";
          gainNode.gain.value = 0.2;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 900;
          }, 100);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {}
      }
    } else {
      setState("complete");
      setIsTimerRunning(false);
      clearStorage();
      // 🎉 Celebration confetti!
      fireConfetti();
    }
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const colors = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b"];
    
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleSkip = () => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].skipped = true;
    setSteps(newSteps);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setTimeLeft(timerDuration);
    } else {
      setState("complete");
      setIsTimerRunning(false);
      clearStorage();
      fireConfetti();
    }
  };

  const handleStuck = async () => {
    setIsReframing(true);
    setIsTimerRunning(false);
    
    try {
      const response = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          originalStep: steps[currentStepIndex].text,
          task 
        }),
      });
      
      const data = await response.json();
      
      if (data.newStep) {
        const newSteps = [...steps];
        newSteps[currentStepIndex].text = data.newStep;
        setSteps(newSteps);
      }
    } catch (error) {
      // Fallback: simplify the step
      const newSteps = [...steps];
      const original = steps[currentStepIndex].text;
      newSteps[currentStepIndex].text = `Just spend 2 minutes on: ${original.slice(0, 50)}${original.length > 50 ? '...' : ''}`;
      setSteps(newSteps);
    }
    
    setIsReframing(false);
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
  };

  const resetApp = () => {
    setState("start");
    setTask("");
    setSteps([]);
    setCurrentStepIndex(0);
    setTimeLeft(timerDuration);
    setIsTimerRunning(false);
    setTotalTimeSpent(0);
    clearStorage();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const skippedSteps = steps.filter(s => s.skipped).length;
  const progress = steps.length > 0 
    ? ((completedSteps + skippedSteps) / steps.length) * 100 
    : 0;

  const timerProgress = timerDuration > 0 ? timeLeft / timerDuration : 0;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* START SCREEN */}
        {state === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg text-center"
          >
            <motion.div 
              className="text-6xl mb-6 animate-float"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              🚀
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-2 gradient-text">MicroMove</h1>
            <p className="text-gray-400 mb-8">Big tasks → tiny wins. 5 minutes at a time.</p>
            
            <div className="card p-6 mb-6">
              <label className="block text-left text-sm text-gray-400 mb-2">
                What are you avoiding?
              </label>
              <textarea
                ref={inputRef}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) {
                    e.preventDefault();
                    breakdownTask();
                  }
                }}
                placeholder="Write my thesis introduction..."
                className="w-full bg-transparent border border-gray-700 rounded-lg p-4 text-lg resize-none focus:outline-none focus:border-purple-500 transition-colors"
                rows={3}
              />
              
              {/* Example tasks */}
              {!task && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Try:</span>
                  {["Write a blog post", "Clean my room", "Reply to emails", "Study for exam"].map((example) => (
                    <button
                      key={example}
                      onClick={() => setTask(example)}
                      className="text-xs px-2 py-1 rounded bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Timer duration selector */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">Time per step:</span>
                <div className="flex gap-2">
                  {[3, 5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setTimerDuration(mins * 60);
                        setTimeLeft(mins * 60);
                      }}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        timerDuration === mins * 60
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={breakdownTask}
              disabled={!task.trim()}
              className="glow-button w-full py-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Break it down →
            </motion.button>
            
            <p className="text-xs text-gray-600 mt-4">
              Tip: Press ⌘+Enter to start
            </p>
          </motion.div>
        )}

        {/* LOADING SCREEN */}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              ⚙️
            </motion.div>
            <p className="text-xl text-gray-300">Breaking down your task...</p>
            <p className="text-gray-500 mt-2">Making it tiny and manageable</p>
          </motion.div>
        )}

        {/* SESSION SCREEN */}
        {state === "session" && steps.length > 0 && (
          <motion.div
            key="session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            {/* Header with settings */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={resetApp}
                className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
              >
                ← New task
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <button 
                  onClick={() => setShowAllSteps(!showAllSteps)}
                  className="hover:text-gray-200 transition-colors"
                >
                  Step {currentStepIndex + 1} of {steps.length} {showAllSteps ? "▲" : "▼"}
                </button>
                <span>{completedSteps} done{skippedSteps > 0 ? `, ${skippedSteps} skipped` : ""}</span>
              </div>
              <div className="progress-bar h-2">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              
              {/* All steps view */}
              <AnimatePresence>
                {showAllSteps && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg space-y-2">
                      {steps.map((step, i) => (
                        <div 
                          key={i}
                          className={`flex items-start gap-2 text-sm p-2 rounded ${
                            i === currentStepIndex ? "bg-purple-900/30 border border-purple-500/30" : ""
                          }`}
                        >
                          <span className="flex-shrink-0">
                            {step.completed ? "✅" : step.skipped ? "⏭️" : i === currentStepIndex ? "👉" : "⬜"}
                          </span>
                          <span className={`${
                            step.completed ? "text-gray-500 line-through" : 
                            step.skipped ? "text-gray-600 line-through" : 
                            i === currentStepIndex ? "text-white" : "text-gray-400"
                          }`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timer */}
            <div className="card p-8 mb-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    className="timer-circle"
                    strokeWidth="8"
                    strokeDasharray={283}
                    animate={{ strokeDashoffset: 283 - (283 * timerProgress) }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-mono font-bold ${timeLeft <= 30 ? "text-red-400" : ""}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-purple-400 mb-3 animate-pulse-glow">{encouragement}</p>
              
              <p className="text-xs text-gray-500 mb-2">CURRENT FOCUS</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={`${currentStepIndex}-${steps[currentStepIndex]?.text}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-xl font-medium text-gray-100"
                >
                  {isReframing ? (
                    <span className="text-gray-400">
                      {stuckMessages[Math.floor(Math.random() * stuckMessages.length)]}
                    </span>
                  ) : (
                    steps[currentStepIndex].text
                  )}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStuck}
                disabled={isReframing}
                className="flex-1 py-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50"
              >
                {isReframing ? "🔄" : "😵"} {isReframing ? "Shrinking..." : "I'm stuck"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDone}
                className="flex-1 py-4 rounded-xl glow-button font-semibold"
              >
                ✅ Done!
              </motion.button>
            </div>

            {/* Secondary actions */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-400 transition-colors text-sm"
              >
                Skip this step →
              </button>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {isTimerRunning ? "⏸ Pause" : "▶ Resume"}
              </button>
            </div>

            {/* Keyboard hints */}
            <p className="text-xs text-gray-700 text-center mt-6">
              Enter = Done • Space = Pause • S = Stuck
            </p>
          </motion.div>
        )}

        {/* COMPLETE SCREEN */}
        {state === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg text-center"
          >
            <motion.div 
              className="text-8xl mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              🎉
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-2 gradient-text">
              {completionMessages[Math.floor(Math.random() * completionMessages.length)]}
            </h1>
            <p className="text-gray-400 mb-8">
              {completedSteps === steps.length 
                ? `You completed all ${steps.length} steps!`
                : `${completedSteps} completed, ${skippedSteps} skipped`}
            </p>

            <div className="card p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-purple-400">{formatTime(totalTimeSpent)}</p>
                  <p className="text-sm text-gray-400">Total time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">{completedSteps}</p>
                  <p className="text-sm text-gray-400">Steps done</p>
                </div>
              </div>
            </div>

            <div className="card p-4 mb-6 text-left">
              <p className="text-sm text-gray-400 mb-2">Original task:</p>
              <p className="text-gray-200">{task}</p>
              
              {/* Step summary */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Steps completed:</p>
                <ul className="space-y-1">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span>{step.completed ? "✅" : step.skipped ? "⏭️" : "⬜"}</span>
                      <span className={step.skipped ? "text-gray-600 line-through" : "text-gray-400"}>
                        {step.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetApp}
              className="glow-button w-full py-4 rounded-xl text-lg font-semibold"
            >
              Start another task →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
