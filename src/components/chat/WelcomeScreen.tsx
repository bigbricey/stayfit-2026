'use client';

import SuggestionChips from './SuggestionChips';

interface WelcomeScreenProps {
    userName: string | null;
    onSuggestionClick: (text: string) => void;
}

export default function WelcomeScreen({ userName, onSuggestionClick }: WelcomeScreenProps) {
    return (
        <div className="flex-1 flex flex-col items-start justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700 pl-4">
            <div className="space-y-2 text-left">
                <h1 className="text-3xl font-semibold text-[#e5e7eb]">
                    Ready to log, {userName?.split(' ')[0] || 'there'}?
                </h1>
                <p className="text-lg text-[#9ca3af]">
                    Track meals, plan workouts, or check your macros.
                </p>
            </div>

            <SuggestionChips onChipClick={onSuggestionClick} />
        </div>
    );
}
