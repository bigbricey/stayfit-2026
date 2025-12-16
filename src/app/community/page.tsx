import Link from 'next/link';

const categories = [
    {
        name: 'Introduce Yourself',
        description: 'New to the community? Say hello!',
        discussions: 12543,
        icon: '👋'
    },
    {
        name: 'General Health, Fitness and Diet',
        description: 'Discuss all things related to getting fit and healthy',
        discussions: 89421,
        icon: '💪'
    },
    {
        name: 'Food and Nutrition',
        description: 'Talk about food, recipes, and eating habits',
        discussions: 45632,
        icon: '🥗'
    },
    {
        name: 'Fitness and Exercise',
        description: 'Share workout tips, routines, and exercise advice',
        discussions: 34521,
        icon: '🏃'
    },
    {
        name: 'Motivation and Support',
        description: 'Get encouragement and support from the community',
        discussions: 67234,
        icon: '🌟'
    },
    {
        name: 'Success Stories',
        description: 'Share your transformation and celebrate your wins',
        discussions: 23456,
        icon: '🏆'
    },
    {
        name: 'Recipes',
        description: 'Share and discover healthy recipes',
        discussions: 18234,
        icon: '👨‍🍳'
    },
    {
        name: 'Challenges',
        description: 'Join community challenges and competitions',
        discussions: 8934,
        icon: '🎯'
    },
];

const recentDiscussions = [
    { title: 'Day 1 - Starting my journey!', author: 'FitNewbie2025', replies: 23, category: 'Introduce Yourself' },
    { title: 'Best high-protein breakfast ideas?', author: 'ProteinQueen', replies: 45, category: 'Recipes' },
    { title: 'Finally hit my goal weight!', author: 'JourneyComplete', replies: 156, category: 'Success Stories' },
    { title: 'How do you stay motivated?', author: 'NeedMotivation', replies: 89, category: 'Motivation and Support' },
];

export default function CommunityPage() {
    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Secondary Navigation */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        <Link href="/community" className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">Categories</Link>
                        <Link href="/community/recent" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Recent Discussions</Link>
                        <Link href="/community/my-discussions" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">My Discussions</Link>
                        <Link href="/community/my-bookmarks" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Bookmarks</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Community Forums</h1>
                    <button className="bg-[#0073CF] text-white px-4 py-2 rounded font-medium hover:bg-[#005AA7] transition-colors">
                        New Discussion
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Main Content - Categories */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">All Categories</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.name}
                                        href={`/community/${cat.name.toLowerCase().replace(/[\s,]+/g, '-')}`}
                                        className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-[#E8F4FC] rounded-lg flex items-center justify-center text-2xl">
                                            {cat.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-[#0073CF] hover:underline">{cat.name}</div>
                                            <div className="text-sm text-gray-500">{cat.description}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-800">{cat.discussions.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">discussions</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-72 flex-shrink-0">
                        {/* Recent Discussions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">Recent Discussions</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {recentDiscussions.map((disc, idx) => (
                                    <div key={idx} className="px-4 py-3 hover:bg-gray-50">
                                        <Link href="#" className="text-sm text-[#0073CF] hover:underline line-clamp-1">
                                            {disc.title}
                                        </Link>
                                        <div className="text-xs text-gray-500 mt-1">
                                            by {disc.author} • {disc.replies} replies
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Community Guidelines */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Community Guidelines</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Be respectful to others</li>
                                <li>• No spam or self-promotion</li>
                                <li>• Stay on topic</li>
                                <li>• Report inappropriate content</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
