import Link from 'next/link';
import goals from '@/data/goals.json';
import TimelineCalculator from '@/components/TimelineCalculator';

export default function Home() {
  // Feature a few popular goals
  const featuredGoals = goals.slice(0, 20);

  return (
    <main className="min-h-screen bg-black text-slate-200">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-slate-900 to-black border-b border-slate-800 pt-20 pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-900/30 text-emerald-400 text-sm font-bold border border-emerald-500/20 mb-6">
            Free Science-Based Tool
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            The Weight Loss <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Timeline Forecaster</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Stop guessing. Get a science-based prediction of exactly when you'll reach your goal weight—and discover how to get there faster.
          </p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        <TimelineCalculator />
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enter Your Details</h3>
            <p className="text-slate-400">Input your current weight, goal, age, and activity level.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧬</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">We Calculate Your Metabolism</h3>
            <p className="text-slate-400">Using the Mifflin-St Jeor equation—the gold standard in metabolic science.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">See Your Timeline</h3>
            <p className="text-slate-400">Get a visual projection showing two paths to your goal.</p>
          </div>
        </div>
      </div>

      {/* Popular Goals */}
      <div className="max-w-5xl mx-auto px-4 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Popular Weight Loss Goals</h2>
        <p className="text-slate-400 text-center mb-12">Find your specific goal and see your personalized timeline</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredGoals.map((goal) => (
            <Link
              key={goal.slug}
              href={`/plan/${goal.slug}`}
              className="block p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white group-hover:text-emerald-400 transition-colors text-sm">{goal.label}</span>
                <span className="text-slate-600 text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/goals" className="text-emerald-400 hover:text-emerald-300 font-medium">
            View all 100+ weight loss plans →
          </Link>
        </div>
      </div>

      {/* Science Section */}
      <div className="max-w-3xl mx-auto px-4 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-white text-center mb-8">The Science Behind the Calculator</h2>
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
          <p className="text-slate-400 leading-relaxed mb-6">
            Our Weight Loss Timeline Forecaster uses the <strong className="text-white">Mifflin-St Jeor Equation</strong>,
            which clinical studies have shown to be the most accurate predictor of Resting Metabolic Rate (RMR). This equation
            was developed in 1990 and has been validated repeatedly as superior to older formulas like Harris-Benedict.
          </p>
          <p className="text-slate-400 leading-relaxed">
            The calculator projects two scenarios: a standard caloric deficit approach, and an accelerated path that assumes
            optimized metabolic function. The difference between these lines represents the potential impact of supporting
            your body's natural cellular energy production.
          </p>
        </div>
      </div>
    </main>
  );
}
