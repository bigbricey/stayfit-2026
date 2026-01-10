import FeedbackAuditor from '@/components/chat/FeedbackAuditor';

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <FeedbackAuditor />
        </>
    );
}
