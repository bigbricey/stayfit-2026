'use client';

interface SuggestionChipsProps {
    onChipClick: (text: string) => void;
}

const SUGGESTIONS = [
    { icon: '🥗', text: 'Log my breakfast' },
    { icon: '💪', text: 'Plan a workout' },
    { icon: '🥩', text: 'Is this keto safe?' },
    { icon: '📊', text: 'Check my macros' }
];

export default function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto max-w-full pb-2 no-scrollbar">
            {SUGGESTIONS.map((chip, idx) => (
                <button
                    key={idx}
                    onClick={() => onChipClick(chip.text)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1d24] hover:bg-[#22262f] rounded-lg text-sm text-gray-200 transition-colors whitespace-nowrap border border-[#2a2d34] hover:border-[#22c55e]/50"
                >
                    <span>{chip.icon}</span>
                    <span>{chip.text}</span>
                </button>
            ))}
        </div>
    );
}
