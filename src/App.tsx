import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dimensions, questions, options } from './data';
import { ArrowRight, AlertTriangle, CheckCircle2, RefreshCcw, ArrowLeft } from 'lucide-react';

type AppState = 'landing' | 'assessment' | 'results';

function getFeedbackText(value: number) {
  const feedbacks = {
    1: ["Oof. Brutal.", "Red flag.", "At least you're honest.", "Yikes.", "We need to talk."],
    2: ["Barely hanging on.", "Needs work.", "Slipping.", "Not a great look."],
    3: ["Playing it safe.", "Right in the middle.", "Average.", "Neutral territory."],
    4: ["Solid.", "Good self-awareness.", "Respectable.", "Nice."],
    5: ["Elite.", "Textbook.", "Nailed it.", "Top tier.", "Ice in the veins."]
  };
  const opts = feedbacks[value as keyof typeof feedbacks];
  return opts[Math.floor(Math.random() * opts.length)];
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, value: number } | null>(null);

  const handleStart = () => {
    setAppState('assessment');
    window.scrollTo(0, 0);
  };

  const handleAnswer = (value: number) => {
    // Only allow answering if not currently showing feedback
    if (feedback) return;

    setAnswers(prev => ({ ...prev, [questions[currentQuestionIndex].id]: value }));
    
    const feedbackText = getFeedbackText(value);
    setFeedback({ text: feedbackText, value });

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAppState('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1500);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0 && !feedback) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setAppState('landing');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-yellow-500 selection:text-black">
      <AnimatePresence mode="wait">
        {appState === 'landing' && <Landing key="landing" onStart={handleStart} />}
        {appState === 'assessment' && (
          <Assessment
            key="assessment"
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onAnswer={handleAnswer}
            onBack={handleBack}
            feedback={feedback}
          />
        )}
        {appState === 'results' && <Results key="results" answers={answers} onRestart={handleRestart} />}
      </AnimatePresence>
    </div>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-6 py-24 md:py-32"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium mb-8 border border-yellow-500/20">
        <AlertTriangle size={16} />
        <span>Brutal Honesty Required</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
        THE BRUTAL REALITY <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
          OF THE WORKPLACE.
        </span>
      </h1>
      
      <div className="space-y-6 text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-12">
        <p>
          Let's drop the corporate mask for a second. We all know that one person who is an absolute genius with spreadsheets or code, but a complete nightmare to be in a room with.
        </p>
        <p>
          Maybe they snap when feedback is given. Maybe they are completely oblivious to the fact that the rest of the team is drowning. Or maybe... just maybe... <strong className="text-zinc-100 font-semibold">that person is you on a bad Tuesday.</strong>
        </p>
        <p>
          This isn't some HR-mandated, fluffy 'feelings' survey. This is a mirror. It's designed to measure the actual, messy, unfiltered reality of how you handle yourself and the people around you when the pressure is on and everything is hitting the fan.
        </p>
        <p className="text-zinc-100 font-medium border-l-4 border-yellow-500 pl-4 py-1">
          Because at the end of the day, your technical skills just get you a seat at the table. Your emotional intelligence decides whether you get kicked out of the room.
        </p>
      </div>

      <button
        onClick={onStart}
        className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-lg font-bold uppercase tracking-wide hover:bg-yellow-500 transition-colors duration-300"
      >
        <span>Face the Mirror</span>
        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function Assessment({
  currentQuestionIndex,
  answers,
  onAnswer,
  onBack,
  feedback
}: {
  currentQuestionIndex: number;
  answers: Record<number, number>;
  onAnswer: (val: number) => void;
  onBack: () => void;
  feedback: { text: string, value: number } | null;
}) {
  const question = questions[currentQuestionIndex];
  const dimension = dimensions.find(d => d.id === question.dimension);
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-zinc-900 fixed top-0 left-0 z-40">
        <motion.div 
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 w-full p-6 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          {currentQuestionIndex > 0 ? (
            <button 
              onClick={onBack}
              disabled={!!feedback}
              className="pointer-events-auto flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">Back</span>
            </button>
          ) : <div />}
        </div>
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm"
          >
            <div className={`px-8 py-6 rounded-2xl border-2 shadow-2xl ${
              feedback.value >= 4 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' :
              feedback.value === 3 ? 'bg-zinc-900/80 border-zinc-500 text-zinc-300' :
              'bg-red-950/80 border-red-500 text-red-400'
            }`}>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center">
                {feedback.text}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Container - Changed from justify-center to pt-32 to fix cutoff issues on small/weird screens */}
      <div className="flex-1 flex flex-col justify-start pt-28 md:pt-32 pb-24 max-w-3xl mx-auto px-6 w-full">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-zinc-500 mb-4">
              <span>{String(currentQuestionIndex + 1).padStart(2, '0')} / {questions.length}</span>
              <span className="w-8 h-px bg-zinc-800"></span>
              <span className="text-yellow-500">{dimension?.title}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-medium leading-tight text-zinc-100">
              {question.text}
            </h2>
          </div>

          <div className="space-y-3 mt-12">
            {options.map((option) => {
              const isSelected = answers[question.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onAnswer(option.value)}
                  disabled={!!feedback}
                  className={`w-full text-left px-6 py-5 rounded-none border transition-all duration-200 flex items-center justify-between group disabled:cursor-not-allowed ${
                    isSelected 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? 'text-black/60' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                      {option.value} — {option.likert}
                    </span>
                    <span className={`font-medium text-lg ${isSelected ? 'font-bold' : ''}`}>{option.label}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${
                    isSelected ? 'border-black' : 'border-zinc-700 group-hover:border-zinc-500'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Results({ answers, onRestart }: { answers: Record<number, number>; onRestart: () => void }) {
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const maxScore = questions.length * 5;
  
  let category = '';
  let title = '';
  let description = '';
  let colorClass = '';

  if (totalScore >= 140) {
    category = 'High EI';
    title = 'THE ANCHOR';
    colorClass = 'text-emerald-400';
    description = "You actually get it. You handle your shit, you read the room, and people don't hate working with you. You're the glue keeping the team from falling apart. But don't get arrogant; emotional intelligence is a daily practice, not a destination.";
  } else if (totalScore >= 105) {
    category = 'Moderate EI';
    title = 'THE WILDCARD';
    colorClass = 'text-yellow-400';
    description = "You're functional, but inconsistent. You might be a great listener but have a terrible temper, or you're super driven but completely oblivious to others. You have blind spots that are actively holding you back. Find them and fix them before they derail you.";
  } else {
    category = 'Low EI';
    title = 'THE LIABILITY';
    colorClass = 'text-red-500';
    description = "Time for some brutal honesty. This is why things are harder than they need to be. This is why you feel misunderstood, passed over, or constantly stressed. The good news? Emotional intelligence can be learned. But you have to stop blaming everyone else first.";
  }

  // Calculate dimension scores
  const dimensionScores = dimensions.map(dim => {
    const dimQuestions = questions.filter(q => q.dimension === dim.id);
    const score = dimQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const max = dimQuestions.length * 5;
    return { ...dim, score, max, percentage: (score / max) * 100 };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-6 py-24"
    >
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <div className="mb-12">
            <h2 className="text-zinc-500 font-bold tracking-widest uppercase mb-4">Your Reality Check</h2>
            <div className="text-7xl font-black mb-2">{totalScore} <span className="text-3xl text-zinc-600">/ {maxScore}</span></div>
            <h3 className={`text-4xl font-bold uppercase tracking-tight mb-6 ${colorClass}`}>{title}</h3>
            <p className="text-xl text-zinc-300 leading-relaxed">{description}</p>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-bold border-b border-zinc-800 pb-4">The Breakdown</h4>
            {dimensionScores.map(dim => (
              <div key={dim.id}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-bold text-zinc-200">{dim.title}</div>
                    <div className="text-sm text-zinc-500">{dim.description}</div>
                  </div>
                  <div className="font-mono text-zinc-400">{dim.score}/{dim.max}</div>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${dim.percentage >= 80 ? 'bg-emerald-500' : dim.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12">
          <h4 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-yellow-500" />
            How to Use This
          </h4>
          
          <div className="space-y-8 text-zinc-400">
            <div>
              <h5 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">For HR & Leadership</h5>
              <p className="leading-relaxed">Stop hiring purely on resumes. Someone with moderate technical skills but high EI will often outperform a brilliant jerk. Use these dimensions to identify who can actually handle the pressure of leadership without breaking the team.</p>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">For Training</h5>
              <p className="leading-relaxed">Generic leadership seminars are a waste of money. Look at your lowest dimension score. That's your curriculum. Low self-regulation? You need stress management. Low empathy? You need perspective-taking exercises.</p>
            </div>
            
            <div>
              <h5 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">For You (Self-Improvement)</h5>
              <p className="leading-relaxed">Look at your weakest dimension. That is not a suggestion—that is your assignment. Find resources, get a mentor, practice deliberately. This isn't touchy-feely stuff; it's the infrastructure of your career.</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-medium uppercase tracking-wider text-sm"
            >
              <RefreshCcw size={16} />
              Take it again
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
