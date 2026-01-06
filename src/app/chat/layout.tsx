import SuggestionBox from '@/components/SuggestionBox';

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <SuggestionBox />
        </>
    );
}
