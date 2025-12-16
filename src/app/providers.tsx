'use client';

import { UserDataProvider } from '@/context/UserDataContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UserDataProvider>
            {children}
        </UserDataProvider>
    );
}
