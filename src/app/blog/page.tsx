import Link from 'next/link';

const categories = [
    'Nutrition',
    'Fitness',
    'Weight Loss',
    'Recipes',
    'Motivation',
    'Success Stories',
    'Tips & Tricks',
];

const featuredPost = {
    title: '10 Science-Backed Ways to Boost Your Metabolism',
    excerpt: 'Discover proven strategies to increase your metabolic rate and burn more calories throughout the day.',
    category: 'Weight Loss',
    author: 'Dr. Sarah Johnson',
    date: 'December 15, 2024',
    readTime: '8 min read',
};

const blogPosts = [
    {
        title: 'The Ultimate Guide to Meal Prep for Beginners',
        excerpt: 'Learn how to save time and eat healthier with our comprehensive meal prep guide.',
        category: 'Nutrition',
        author: 'Emily Chen',
        date: 'December 14, 2024',
        readTime: '6 min read',
    },
    {
        title: '5 Morning Workouts That Will Transform Your Day',
        excerpt: 'Start your day right with these energizing workout routines.',
        category: 'Fitness',
        author: 'Mike Rodriguez',
        date: 'December 13, 2024',
        readTime: '5 min read',
    },
    {
        title: 'How I Lost 50 Pounds Using MyFitnessPal',
        excerpt: 'One member shares their incredible weight loss journey and top tips.',
        category: 'Success Stories',
        author: 'Jessica Williams',
        date: 'December 12, 2024',
        readTime: '7 min read',
    },
    {
        title: 'High-Protein Breakfast Recipes Under 400 Calories',
        excerpt: 'Fuel your morning with these delicious and nutritious breakfast ideas.',
        category: 'Recipes',
        author: 'Chef Maria Garcia',
        date: 'December 11, 2024',
        readTime: '4 min read',
    },
    {
        title: 'Why You\'re Not Losing Weight (And How to Fix It)',
        excerpt: 'Common mistakes that sabotage your weight loss efforts and solutions.',
        category: 'Weight Loss',
        author: 'Dr. Sarah Johnson',
        date: 'December 10, 2024',
        readTime: '9 min read',
    },
    {
        title: 'The Best Ab Exercises You\'re Not Doing',
        excerpt: 'Target your core with these underrated but effective ab movements.',
        category: 'Fitness',
        author: 'Mike Rodriguez',
        date: 'December 9, 2024',
        readTime: '5 min read',
    },
];

export default function BlogPage() {
    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Secondary Navigation */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        <Link href="/blog" className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">All Posts</Link>
                        <Link href="/blog/nutrition" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Nutrition</Link>
                        <Link href="/blog/fitness" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Fitness</Link>
                        <Link href="/blog/recipes" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Recipes</Link>
                        <Link href="/blog/success-stories" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Success Stories</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Blog</h1>

                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Featured Post */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-[#0073CF] to-[#005AA7] flex items-center justify-center">
                                <span className="text-6xl">📰</span>
                            </div>
                            <div className="p-5">
                                <span className="text-xs text-[#0073CF] font-medium uppercase">{featuredPost.category}</span>
                                <h2 className="text-xl font-bold text-gray-800 mt-1 mb-2 hover:text-[#0073CF]">
                                    <Link href="/blog/featured">{featuredPost.title}</Link>
                                </h2>
                                <p className="text-gray-600 mb-3">{featuredPost.excerpt}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{featuredPost.author}</span>
                                    <span>•</span>
                                    <span>{featuredPost.date}</span>
                                    <span>•</span>
                                    <span>{featuredPost.readTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Blog Posts Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {blogPosts.map((post, idx) => (
                                <article key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                                        <span className="text-3xl">📝</span>
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs text-[#0073CF] font-medium uppercase">{post.category}</span>
                                        <h3 className="font-semibold text-gray-800 mt-1 mb-2 line-clamp-2 hover:text-[#0073CF]">
                                            <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                                        <div className="text-xs text-gray-500">
                                            {post.date} • {post.readTime}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="text-center mt-6">
                            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-50 transition-colors">
                                Load More Articles
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        {/* Categories */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                            <ul className="space-y-2 text-sm">
                                {categories.map((cat) => (
                                    <li key={cat}>
                                        <Link href={`/blog/${cat.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-600 hover:text-[#0073CF]">
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="bg-[#E8F4FC] rounded-lg p-4 border border-[#C5DCE9]">
                            <h3 className="font-semibold text-gray-800 mb-2">Newsletter</h3>
                            <p className="text-sm text-gray-600 mb-3">Get the latest health tips delivered to your inbox.</p>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2"
                            />
                            <button className="w-full bg-[#0073CF] text-white py-2 rounded text-sm font-medium hover:bg-[#005AA7] transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
