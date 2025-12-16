import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayFit With AI | Weight Loss Tools & Calculators",
  description: "Free, science-based weight loss calculators. Timeline forecaster, BMI calculator, calorie calculator and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-slate-950`}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <span className="text-white font-bold text-sm">SF</span>
                </div>
                <span className="font-bold text-white group-hover:text-orange-400 transition-colors">StayFit</span>
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/tools" className="text-sm text-slate-400 hover:text-white transition-colors">Tools</Link>
                <Link href="/goals" className="text-sm text-slate-400 hover:text-white transition-colors">Goals</Link>
                <Link href="/" className="text-sm bg-orange-500/10 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/20 transition-colors">
                  Timeline Calculator
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content with nav offset */}
        <div className="pt-16">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SF</span>
                  </div>
                  <span className="font-bold text-white">StayFitWithAI</span>
                </div>
                <p className="text-slate-500 text-sm">Free, science-based health calculators for your weight loss journey.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Tools</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/" className="hover:text-orange-400 transition-colors">Timeline Forecaster</Link></li>
                  <li><Link href="/tools/bmi-calculator" className="hover:text-orange-400 transition-colors">BMI Calculator</Link></li>
                  <li><Link href="/tools/calorie-calculator" className="hover:text-orange-400 transition-colors">Calorie Calculator</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Popular Goals</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/plan/lose-20-pounds-for-wedding" className="hover:text-orange-400 transition-colors">Lose 20 lbs for Wedding</Link></li>
                  <li><Link href="/plan/lose-50-pounds-timeline" className="hover:text-orange-400 transition-colors">Lose 50 lbs Timeline</Link></li>
                  <li><Link href="/goals" className="hover:text-orange-400 transition-colors">View All Goals →</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Science</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>Mifflin-St Jeor Equation</li>
                  <li>TDEE Calculations</li>
                  <li>Evidence-Based Methods</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800/50 pt-8 space-y-4 text-center text-slate-500 text-sm">
              <p>
                <strong className="text-slate-400">FTC Disclosure:</strong> This website is reader-supported. We may earn a commission if you purchase through links on our site, at no extra cost to you.
              </p>
              <p>
                <strong className="text-slate-400">Medical Disclaimer:</strong> The content on this site is for informational purposes only. StayFitWithAI is not a healthcare provider and does not sell prescription medications. Always consult your doctor before starting any new regimen.
              </p>
              <p className="text-slate-600">© 2025 StayFitWithAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
