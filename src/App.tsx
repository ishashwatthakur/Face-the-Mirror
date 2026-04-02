import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dimensions, questions, options } from './data';
import { ArrowRight, AlertTriangle, CheckCircle2, RefreshCcw, ArrowLeft } from 'lucide-react';

type AppState = 'landing' | 'assessment' | 'results';

function getFeedbackText(value: number) {
  const feedbacks = {
    1: ["Oof. Brutal.", "Red flag.", "At least you're honest.", "Yikes.", "We need to talk.", "That's rough.", "Self-sabotage?", "Danger zone.", "Not ideal.", "Wake up call."],
    2: ["Barely hanging on.", "Needs work.", "Slipping.", "Not a great look.", "Room for improvement.", "Careful there.", "Could be better.", "On thin ice."],
    3: ["Playing it safe.", "Right in the middle.", "Average.", "Neutral territory.", "Fence-sitting.", "Okay, but...", "Standard.", "Middle of the pack."],
    4: ["Solid.", "Good self-awareness.", "Respectable.", "Nice.", "Strong move.", "Well handled.", "Professional.", "On the right track."],
    5: ["Elite.", "Textbook.", "Nailed it.", "Top tier.", "Ice in the veins.", "Masterclass.", "Flawless.", "Peak performance.", "Absolute pro."]
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
    }, 900);
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
  const [activeTab, setActiveTab] = useState<'overview' | 'methodology' | 'action'>('overview');
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const maxScore = questions.length * 5;
  
  // Calculate dimension scores FIRST so we can use them for dynamic descriptions
  const dimensionScores = dimensions.map(dim => {
    const dimQuestions = questions.filter(q => q.dimension === dim.id);
    const score = dimQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    const max = dimQuestions.length * 5;
    return { ...dim, score, max, percentage: (score / max) * 100 };
  });

  const highestDim = dimensionScores.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current);
  const lowestDim = dimensionScores.reduce((prev, current) => (prev.percentage < current.percentage) ? prev : current);
  
  let title = '';
  let subtitle = '';
  let description = '';
  let colorClass = '';

  if (totalScore >= 140) {
    title = 'HIGH EI';
    colorClass = 'text-emerald-400';
    if (highestDim.id === 'self-regulation') {
      subtitle = 'THE ZEN MASTER';
      description = "You possess an elite level of emotional control. When others panic, you anchor the team. Your ability to process before reacting is your superpower, making you a natural, trusted leader in high-stakes situations.";
    } else if (highestDim.id === 'empathy') {
      subtitle = 'THE EMPATHETIC LEADER';
      description = "Your emotional radar is unmatched. You don't just hear people; you understand their underlying struggles. This makes you an incredible collaborator and a deeply respected colleague who builds unbreakable trust.";
    } else {
      subtitle = 'THE ANCHOR';
      description = "You actually get it. You handle your business, you read the room, and people actively want to work with you. You're the glue keeping the team from falling apart. Keep refining this—it's your biggest career asset.";
    }
  } else if (totalScore >= 105) {
    title = 'MODERATE EI';
    colorClass = 'text-yellow-400';
    if (lowestDim.id === 'self-awareness') {
      subtitle = 'THE BLIND SPOT';
      description = "You're functional and capable, but you have a massive blind spot regarding how you come across to others. You might be unintentionally stepping on toes. It's time to start asking for brutal feedback and actually listening to it.";
    } else if (lowestDim.id === 'social-skills') {
      subtitle = 'THE LONE WORKER';
      description = "You can manage your own emotions, but translating that into effective teamwork is where you stumble. You're leaving potential on the table by not bridging the gap between your work and the people around you.";
    } else {
      subtitle = 'THE WILDCARD';
      description = "You're a mixed bag. On a good day, you're a great teammate. On a stressful day, your emotional intelligence slips, and you become a bottleneck. Consistency is your next major hurdle. Identify your triggers.";
    }
  } else {
    title = 'LOW EI';
    colorClass = 'text-red-500';
    if (lowestDim.id === 'self-regulation') {
      subtitle = 'THE VOLCANO';
      description = "Your reactions are controlling your career. When stress hits, you become a liability to team morale. You need to urgently learn the pause between feeling an emotion and acting on it, before you burn bridges permanently.";
    } else if (lowestDim.id === 'empathy') {
      subtitle = 'THE BULLDOZER';
      description = "You are completely missing the human element of your work. By ignoring or misreading the emotions of your colleagues, you are creating friction that slows everything down. Empathy isn't weakness; it's data. Start using it.";
    } else {
      subtitle = 'THE LIABILITY';
      description = "Time for some brutal honesty. Your emotional intelligence is actively holding you back. This is why things are harder than they need to be, and why you feel misunderstood. The good news? It's a skill you can learn, starting today.";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-6 py-16 md:py-24"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-zinc-500 font-bold tracking-widest uppercase mb-4">Your Reality Check</h2>
        <div className="text-7xl md:text-8xl font-black mb-4">{totalScore} <span className="text-3xl md:text-4xl text-zinc-600">/ {maxScore}</span></div>
        <h3 className={`text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2 ${colorClass}`}>{title}</h3>
        <div className="text-xl font-bold tracking-widest text-zinc-400 uppercase mb-8">{subtitle}</div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 border-b border-zinc-800 pb-4">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Overview & Breakdown
        </button>
        <button 
          onClick={() => setActiveTab('methodology')} 
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'methodology' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Scoring Methodology
        </button>
        <button 
          onClick={() => setActiveTab('action')} 
          className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'action' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Action Plan
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              <p className="text-xl text-zinc-300 leading-relaxed text-center max-w-2xl mx-auto">{description}</p>
              <div className="space-y-8 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
                <h4 className="text-xl font-bold border-b border-zinc-800 pb-4">Dimension Breakdown</h4>
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
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full ${dim.percentage >= 80 ? 'bg-emerald-500' : dim.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'methodology' && (
            <motion.div key="methodology" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
              <h4 className="text-2xl font-bold flex items-center gap-3"><CheckCircle2 className="text-yellow-500" /> How Marks Are Awarded</h4>
              <p className="text-zinc-400 leading-relaxed">Each of the 35 questions is graded on a 1-5 Likert scale. The higher the number, the higher the emotional intelligence demonstrated in that specific scenario. The combination of your answers across 5 dimensions creates your unique profile.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-white font-bold mb-4 uppercase tracking-wide text-sm border-b border-zinc-800 pb-2">Point System Breakdown</h5>
                  <ul className="space-y-4 text-zinc-400">
                    <li className="flex flex-col gap-1">
                      <div className="flex justify-between"><span className="text-zinc-200 font-bold">Strongly Agree</span> <span className="font-mono text-yellow-500">5 pts</span></div>
                      <span className="text-sm">Indicates mastery and consistent application of EI principles in high-stress situations.</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <div className="flex justify-between"><span className="text-zinc-300 font-semibold">Agree</span> <span className="font-mono text-yellow-500">4 pts</span></div>
                      <span className="text-sm">Shows strong capability, though occasionally susceptible to pressure.</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <div className="flex justify-between"><span className="text-zinc-400">Neutral</span> <span className="font-mono text-yellow-500">3 pts</span></div>
                      <span className="text-sm">Inconsistent behavior. Highly dependent on the environment or mood.</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <div className="flex justify-between"><span className="text-zinc-500">Disagree</span> <span className="font-mono text-yellow-500">2 pts</span></div>
                      <span className="text-sm">Struggles with this dimension. Often reacts poorly to workplace triggers.</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <div className="flex justify-between"><span className="text-zinc-600">Strongly Disagree</span> <span className="font-mono text-yellow-500">1 pt</span></div>
                      <span className="text-sm">Complete absence of this EI trait. Actively detrimental to team dynamics.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-white font-bold mb-4 uppercase tracking-wide text-sm border-b border-zinc-800 pb-2">Score Brackets Explained</h5>
                  <ul className="space-y-6 text-zinc-400">
                    <li>
                      <div className="flex justify-between mb-2"><span className="text-emerald-400 font-bold text-lg">High EI</span> <span className="font-mono text-white">140 - 175</span></div>
                      <div className="text-sm leading-relaxed"><strong>The Ideal Colleague:</strong> Individuals in this bracket exhibit exceptional self-awareness and emotional control. They do not let temporary setbacks dictate their behavior. They are adept at reading the room, de-escalating conflicts, and inspiring trust. They treat empathy as a strategic tool, not a weakness.</div>
                    </li>
                    <li>
                      <div className="flex justify-between mb-2"><span className="text-yellow-400 font-bold text-lg">Moderate EI</span> <span className="font-mono text-white">105 - 139</span></div>
                      <div className="text-sm leading-relaxed"><strong>The Work in Progress:</strong> People in this bracket are functional but inconsistent. They may excel in self-motivation but lack social tact, or they may be highly empathetic but struggle to regulate their own stress. They require focused development on their specific blind spots.</div>
                    </li>
                    <li>
                      <div className="flex justify-between mb-2"><span className="text-red-500 font-bold text-lg">Low EI</span> <span className="font-mono text-white">35 - 104</span></div>
                      <div className="text-sm leading-relaxed"><strong>The Bottleneck:</strong> This bracket indicates a highly reactive approach to the workplace. These individuals often let their emotions hijack their decision-making, struggle to understand colleagues' perspectives, and may inadvertently create toxic environments. Immediate self-reflection is required.</div>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'action' && (
            <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50">
              <h4 className="text-2xl font-bold flex items-center gap-3"><ArrowRight className="text-yellow-500" /> Your Growth Roadmap</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-400">
                <div className="space-y-6">
                  <div>
                    <h5 className="text-yellow-500 font-bold mb-2 uppercase tracking-wide text-sm">1. Immediate Next Steps</h5>
                    <p className="leading-relaxed text-sm mb-3">Don't just read this and move on. Take action today.</p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li><strong>Identify your lowest dimension</strong> from the overview tab. This is your primary target.</li>
                      <li><strong>Ask for brutal feedback.</strong> Send this assessment to a trusted colleague and ask them to grade you. Compare the gap between your perception and their reality.</li>
                      <li><strong>Acknowledge past mistakes.</strong> If you realize you've been "The Volcano" or "The Bulldozer", apologize to the people you've impacted. Ownership builds trust.</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-yellow-500 font-bold mb-2 uppercase tracking-wide text-sm">2. Long-Term Development</h5>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li><strong>The 3-Second Rule:</strong> If your lowest score is Self-Regulation, commit to a mandatory 3-second pause before responding to any stressful email or comment.</li>
                      <li><strong>Active Listening:</strong> If Empathy is low, practice entering meetings with the sole goal of understanding others, not just waiting for your turn to speak.</li>
                      <li><strong>Find a Mentor:</strong> Seek out someone in your organization who handles pressure beautifully. Ask them how they process stress.</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6 bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50">
                  <div>
                    <h5 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">For HR & Leadership</h5>
                    <p className="leading-relaxed text-sm mb-4">How to manage this specific profile:</p>
                    <ul className="space-y-4 text-sm">
                      <li className="border-l-2 border-emerald-500 pl-3">
                        <strong className="text-emerald-400 block mb-1">Managing High EI:</strong>
                        Don't take them for granted. Give them complex, cross-functional projects. Let them mentor others, but ensure they aren't absorbing all the team's emotional baggage.
                      </li>
                      <li className="border-l-2 border-yellow-500 pl-3">
                        <strong className="text-yellow-400 block mb-1">Managing Moderate EI:</strong>
                        Stop sending them to generic leadership seminars. Look at their specific dimension gaps. Pair them with complementary teammates (e.g., pair a highly motivated but low-empathy worker with a highly empathetic project manager).
                      </li>
                      <li className="border-l-2 border-red-500 pl-3">
                        <strong className="text-red-500 block mb-1">Managing Low EI:</strong>
                        Set extremely clear behavioral boundaries. Technical brilliance does not excuse toxic behavior. Implement strict feedback loops and consider professional coaching before promoting them.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-yellow-500 transition-colors"
        >
          <RefreshCcw size={18} />
          Retake Assessment
        </button>
      </div>
    </motion.div>
  );
}
