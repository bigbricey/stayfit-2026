import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayFitWithAI | Free Calorie Counter, Diet & Exercise Journal",
  description: "Lose weight the healthy way. StayFitWithAI has the biggest food database with accurate calorie counts for every food.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-100`}>
        {/* Top Header - MFP Blue Bar */}
        <header className="bg-[#0073CF] text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-tight">stayfitwithai</span>
              </Link>

              {/* User Links - MFP Style */}
              <div className="flex items-center gap-3 text-sm">
                <span>Hi, <Link href="/profile" className="font-medium hover:underline">User</Link></span>
                <span className="text-white/50">|</span>
                <Link href="/mail" className="hover:underline flex items-center gap-1">
                  <span>✉️</span> <span className="bg-white/20 px-1.5 rounded text-xs">0</span>
                </Link>
                <Link href="/notifications" className="hover:underline flex items-center gap-1">
                  <span>👤</span> <span className="bg-white/20 px-1.5 rounded text-xs">0</span>
                </Link>
                <span className="text-white/50">|</span>
                <Link href="/help" className="hover:underline">Help</Link>
                <Link href="/settings" className="hover:underline">Settings</Link>
                <Link href="/api/auth/signout" className="hover:underline">Log Out</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Navigation - Darker Blue */}
        <nav className="bg-[#005AA7]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex">
              <Link href="/" className="px-4 py-2.5 text-sm font-medium text-white bg-[#004080]">
                MY HOME
              </Link>
              <Link href="/dashboard" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                FOOD
              </Link>
              <Link href="/exercise" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                EXERCISE
              </Link>
              <Link href="/tools" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                REPORTS
              </Link>
              <Link href="/goals" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                APPS
              </Link>
              <Link href="/community" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                COMMUNITY
              </Link>
              <Link href="/blog" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                BLOG
              </Link>
              <Link href="/premium" className="px-5 py-3 text-sm font-medium text-white/90 hover:bg-[#004080] transition-colors">
                PREMIUM
              </Link>
            </div>
          </div>
        </nav>

        {/* Secondary Navigation - Light Blue (MFP Style) */}
        <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-6 text-sm">
              <Link href="/dashboard" className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">Home</Link>
              <Link href="/goals" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Goals</Link>
              <Link href="/check-in" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Check-In</Link>
              <Link href="/mail" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Mail</Link>
              <Link href="/profile" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Profile</Link>
              <Link href="/friends" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Friends</Link>
              <Link href="/settings" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Settings</Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer - MFP Style */}
        <footer className="bg-[#333] text-gray-300 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-white mb-4">StayFitWithAI</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                  <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Tools</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:text-white">Calorie Counter</Link></li>
                  <li><Link href="/tools/bmi-calculator" className="hover:text-white">BMI Calculator</Link></li>
                  <li><Link href="/tools/calorie-calculator" className="hover:text-white">Calorie Calculator</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link href="/community" className="hover:text-white">Community</Link></li>
                  <li><Link href="/recipes" className="hover:text-white">Recipes</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-8 text-center text-sm text-gray-400">
              <p className="mb-2">
                <strong>FTC Disclosure:</strong> We may earn a commission if you purchase through links on our site.
              </p>
              <p className="mb-2">
                <strong>Medical Disclaimer:</strong> Content is for informational purposes only. Always consult your doctor.
              </p>
              <p>© 2025 StayFitWithAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
