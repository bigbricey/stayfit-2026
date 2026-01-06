import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'StayFitWithAI - The Metabolic Truth Engine',
    description: 'Your personal AI metabolic coach. Log meals, track goals, and optimize your health with science-backed insights.',
    keywords: ['fitness', 'nutrition', 'metabolic health', 'keto', 'carnivore', 'macro tracking', 'AI health coach'],
    authors: [{ name: 'StayFitWithAI' }],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'StayFit',
        startupImage: [],
    },
    icons: {
        apple: '/icons/icon-192x192.png',
    },
    openGraph: {
        title: 'StayFitWithAI - The Metabolic Truth Engine',
        description: 'The only AI that learns you for a decade',
        type: 'website',
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0a0b0d',
}

// Components
// import SuggestionBox from '@/components/SuggestionBox'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-black text-white antialiased`}>
                {children}
            </body>
        </html>
    )
}
