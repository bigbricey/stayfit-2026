'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNavItems = [
    { href: '/', label: 'MY HOME' },
    { href: '/food', label: 'FOOD' },
    { href: '/exercise', label: 'EXERCISE' },
    { href: '/reports', label: 'REPORTS' },
    { href: '/apps', label: 'APPS' },
    { href: '/community', label: 'COMMUNITY' },
    { href: '/blog', label: 'BLOG' },
    { href: '/premium', label: 'PREMIUM' },
];

const secondaryNavItems = [
    { href: '/', label: 'Home' },
    { href: '/goals', label: 'Goals' },
    { href: '/check-in', label: 'Check-In' },
    { href: '/mail', label: 'Mail' },
    { href: '/profile', label: 'Profile' },
    { href: '/friends', label: 'Friends' },
    { href: '/settings', label: 'Settings' },
];

export default function Navigation() {
    const pathname = usePathname();

    const isActiveMain = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const isActiveSecondary = (href: string) => {
        if (href === '/') return pathname === '/' || pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Top Header - MFP Blue Bar */}
            <header className="bg-[#0073CF] text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-12">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold tracking-tight">stayfitwithai</span>
                        </Link>

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
                            <Link href="/logout" className="hover:underline">Log Out</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Navigation - Darker Blue */}
            <nav className="bg-[#005AA7]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors ${isActiveMain(item.href)
                                    ? 'text-white bg-[#004080]'
                                    : 'text-white/90 hover:bg-[#004080]'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Secondary Navigation - Light Blue */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        {secondaryNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`py-2.5 border-b-2 transition-colors ${isActiveSecondary(item.href)
                                    ? 'text-[#0073CF] font-medium border-[#0073CF]'
                                    : 'text-gray-600 hover:text-[#0073CF] border-transparent'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
