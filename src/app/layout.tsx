import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Providers } from "./providers";
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
        <Providers>
          {/* Navigation with active tab highlighting */}
          <Navigation />

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
        </Providers>
      </body>
    </html>
  );
}
