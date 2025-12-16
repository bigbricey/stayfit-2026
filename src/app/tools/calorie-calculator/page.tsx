import CalorieCalculator from '@/components/CalorieCalculator';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calorie Calculator | Daily Calorie Needs for Weight Loss',
    description: 'Calculate exactly how many calories you need per day to lose weight. Uses the Mifflin-St Jeor equation for accurate results.',
};

export default function CaloriePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
            {/* Hero */}
            <div className="relative pt-16 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-orange-400 text-sm font-medium">Free Health Tool</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Calorie <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">
                        Calculate exactly how many calories you need each day to reach your goal.
                    </p>
                </div>
            </div>

            {/* Calculator */}
            <div className="max-w-xl mx-auto px-4 -mt-8 relative z-20 mb-20">
                <CalorieCalculator />
            </div>

            {/* Info Section */}
            <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Understanding TDEE</h2>
                    <p className="text-slate-400 leading-relaxed">
                        Your Total Daily Energy Expenditure (TDEE) is the number of calories your body burns in a day,
                        including all activities. To lose weight, you need to eat fewer calories than your TDEE.
                        A deficit of 500 calories per day leads to about 1 pound of weight loss per week.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">The Science</h2>
                    <p className="text-slate-400 leading-relaxed">
                        This calculator uses the Mifflin-St Jeor equation, which has been shown in clinical studies
                        to be the most accurate formula for calculating Basal Metabolic Rate (BMR). Your BMR is
                        then multiplied by an activity factor to estimate your TDEE.
                    </p>
                </section>
            </div>

            {/* Cross-sell */}
            <div className="border-t border-slate-800/50 bg-slate-900/30 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">See Your Full Timeline</h2>
                    <p className="text-slate-400 mb-8">Find out exactly when you'll reach your goal weight.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/25"
                    >
                        Try the Timeline Forecaster →
                    </Link>
                </div>
            </div>
        </main>
    );
}
