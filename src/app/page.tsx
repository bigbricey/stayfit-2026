import Link from 'next/link';
import goals from '@/data/goals.json';
import TimelineCalculator from '@/components/TimelineCalculator';

export default function Home() {
  const featuredGoals = goals.slice(0, 12);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* Hero Section */}
      <div className="relative border-b border-slate-800/50 pt-16 pb-32 px-4 overflow-hidden">
        {/* Gradient orbs for visual interest */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-orange-400 text-sm font-medium">Free Science-Based Tools</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
            Weight Loss<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">Timeline Forecaster</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. Get a science-based prediction of exactly when you'll reach your goal weight—and discover how to get there faster.
          </p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20 mb-24">
        <TimelineCalculator />
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">How It Works</h2>
        <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">Our calculator uses the same equations used by doctors and nutritionists</p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-orange-500/50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enter Your Details</h3>
              <p className="text-slate-400 leading-relaxed">Input your current weight, goal, age, and activity level using our intuitive sliders.</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-orange-500/50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                <span className="text-2xl">🧬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">We Analyze Your Metabolism</h3>
              <p className="text-slate-400 leading-relaxed">Using the Mifflin-St Jeor equation—the gold standard in metabolic science.</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-orange-500/50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">See Your Timeline</h3>
              <p className="text-slate-400 leading-relaxed">Get an interactive projection showing two paths: standard vs. accelerated.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-slate-800/50 bg-slate-900/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-1">100+</div>
              <div className="text-slate-400 text-sm">Goal Templates</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-1">5+</div>
              <div className="text-slate-400 text-sm">Free Calculators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-1">1990</div>
              <div className="text-slate-400 text-sm">Science-Backed Since</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-1">Free</div>
              <div className="text-slate-400 text-sm">Forever</div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Goals */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Popular Weight Loss Goals</h2>
        <p className="text-slate-400 text-center mb-12">Find your specific goal and get a personalized timeline</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredGoals.map((goal) => (
            <Link
              key={goal.slug}
              href={`/plan/${goal.slug}`}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all rounded-xl" />
              <div className="relative p-4 bg-slate-900/50 border border-slate-800 rounded-xl group-hover:border-orange-500/50 transition-all">
                <span className="text-slate-200 group-hover:text-orange-400 transition-colors text-sm font-medium">{goal.label}</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{goal.pounds} lbs</span>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/goals"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium group"
          >
            View all 100+ weight loss plans
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Science Section */}
      <div className="border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">The Science Behind It</h2>
          <div className="bg-slate-950/50 rounded-2xl p-8 border border-slate-800">
            <p className="text-slate-300 leading-relaxed mb-6">
              Our Weight Loss Timeline Forecaster uses the <strong className="text-orange-400">Mifflin-St Jeor Equation</strong>,
              which clinical studies have shown to be the most accurate predictor of Resting Metabolic Rate (RMR).
            </p>
            <p className="text-slate-400 leading-relaxed mb-6">
              This equation was developed in 1990 and has been validated repeatedly as superior to older formulas like Harris-Benedict.
              It's the same calculator used by nutritionists, doctors, and fitness professionals worldwide.
            </p>
            <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm text-slate-400">
              <p>BMR (Men) = 10×weight(kg) + 6.25×height(cm) - 5×age + 5</p>
              <p>BMR (Women) = 10×weight(kg) + 6.25×height(cm) - 5×age - 161</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
