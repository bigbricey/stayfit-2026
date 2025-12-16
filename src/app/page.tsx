import Link from 'next/link';
import TimelineCalculator from '@/components/TimelineCalculator';

// MFP-style Today section for logged-in appearance
function TodaySection() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Today Header with Avatar and Streak */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-lg">👤</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Today</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">1</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Day<br />Streak</div>
        </div>
      </div>

      {/* Calories and Macros Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calories Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Calories</h2>
          <p className="text-sm text-gray-500 mb-4">Remaining = Goal - Food + Exercise</p>

          <div className="flex items-center gap-6">
            {/* Calorie Ring */}
            <div className="relative">
              <svg width="120" height="120" className="transform -rotate-90">
                <circle cx="60" cy="60" r="50" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60" r="50"
                  stroke="#3B9FD8"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={0}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">2000</span>
                <span className="text-xs text-gray-500">Remaining</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <div className="text-gray-500">Base Goal</div>
                  <div className="font-semibold text-gray-800">2000</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🍽️</span>
                <div>
                  <div className="text-gray-500">Food</div>
                  <div className="font-semibold text-gray-800">0</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-gray-500">Exercise</div>
                  <div className="font-semibold text-gray-800">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Macros</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <MacroRing label="Carbs" current={0} goal={250} color="#4ECDC4" />
            <MacroRing label="Fat" current={0} goal={67} color="#FF6B6B" />
            <MacroRing label="Protein" current={0} goal={100} color="#45B7D1" />
          </div>
          <Link href="/signup" className="block mt-4 bg-yellow-400 text-gray-800 text-center py-2 rounded font-semibold hover:bg-yellow-500 transition-colors">
            Go Premium 👑
          </Link>
        </div>
      </div>
    </div>
  );
}

function MacroRing({ label, current, goal, color }: { label: string; current: number; goal: number; color: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (goal > 0 ? current / goal : 0));

  return (
    <div>
      <div className="relative inline-block">
        <svg width="80" height="80" className="transform -rotate-90">
          <circle cx="40" cy="40" r={radius} stroke="#E5E7EB" strokeWidth="6" fill="none" />
          <circle
            cx="40" cy="40" r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{current}</span>
          <span className="text-xs text-gray-400">/{goal}g</span>
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-gray-100">
      {/* MFP-style Today Section */}
      <TodaySection />

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Calorie Calculator Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Weight Loss Timeline Forecaster</h2>
          <p className="text-gray-500 text-center mb-8">Science-based predictions using the Mifflin-St Jeor equation</p>
          <TimelineCalculator />
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Why Choose StayFitWithAI?</h2>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Everything you need to reach your fitness goals, completely free.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#0073CF] rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Track Calories</h3>
            <p className="text-gray-600">Log your meals and track calories with our database of 380,000+ foods.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#0073CF] rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏃</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Log Exercise</h3>
            <p className="text-gray-600">Track your workouts and see how many calories you burn each day.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#0073CF] rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">See Progress</h3>
            <p className="text-gray-600">Watch your weight trend over time with beautiful charts and insights.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0073CF] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-6">Join for free and start tracking your nutrition today.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#0073CF] px-8 py-3 rounded font-bold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
