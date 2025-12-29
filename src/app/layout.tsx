import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Stay Fit with AI - Coming Soon',
    description: 'A revolutionary fitness app powered by AI. Coming soon.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
