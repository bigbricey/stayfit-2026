import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Health & Fitness Blog | StayFitWithAI',
    description: 'Expert articles on weight loss, nutrition, fitness, and healthy living. Science-backed tips to help you reach your health goals.',
    keywords: 'weight loss blog, nutrition tips, fitness articles, healthy eating, calorie counting',
    openGraph: {
        title: 'Health & Fitness Blog | StayFitWithAI',
        description: 'Expert articles on weight loss, nutrition, fitness, and healthy living.',
        type: 'website',
    },
};

const categories = [
    'All',
    'Weight Loss',
    'Nutrition',
    'Fitness',
    'Recipes',
    'Success Stories',
];

export default function BlogPage() {
    const featuredPost = blogPosts[0];
    const otherPosts = blogPosts.slice(1);

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Secondary Navigation */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 text-sm overflow-x-auto">
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={cat === 'All' ? '/blog' : `/blog?category=${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`py-2.5 whitespace-nowrap border-b-2 ${cat === 'All' ? 'text-[#0073CF] font-medium border-[#0073CF]' : 'text-gray-600 hover:text-[#0073CF] border-transparent'}`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Health & Fitness Blog</h1>

                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Featured Post */}
                        <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-[#0073CF] to-[#005AA7] flex items-center justify-center">
                                <span className="text-6xl">📰</span>
                            </div>
                            <div className="p-5">
                                <span className="text-xs text-[#0073CF] font-medium uppercase">{featuredPost.category}</span>
                                <h2 className="text-xl font-bold text-gray-800 mt-1 mb-2 hover:text-[#0073CF]">
                                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                                </h2>
                                <p className="text-gray-600 mb-3">{featuredPost.excerpt}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{featuredPost.author}</span>
                                    <span>•</span>
                                    <time dateTime={featuredPost.date}>
                                        {new Date(featuredPost.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                    <span>•</span>
                                    <span>{featuredPost.readTime}</span>
                                </div>
                            </div>
                        </article>

                        {/* Blog Posts Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {otherPosts.map((post) => (
                                <article key={post.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                                        <span className="text-3xl">📝</span>
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs text-[#0073CF] font-medium uppercase">{post.category}</span>
                                        <h3 className="font-semibold text-gray-800 mt-1 mb-2 line-clamp-2 hover:text-[#0073CF]">
                                            <Link href={`/blog/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                                        <div className="text-xs text-gray-500">
                                            <time dateTime={post.date}>
                                                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </time>
                                            {' • '}{post.readTime}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* SEO Text */}
                        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-3">Your Source for Health & Fitness Information</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Welcome to the StayFitWithAI blog, your trusted source for science-backed health and fitness information.
                                Our expert writers cover everything from <Link href="/blog/how-many-calories-should-i-eat-to-lose-weight" className="text-[#0073CF] hover:underline">calorie counting for weight loss</Link> to {' '}
                                <Link href="/blog/best-foods-for-weight-loss" className="text-[#0073CF] hover:underline">the best foods for losing weight</Link>.
                                Whether you&apos;re just starting your fitness journey or looking to break through a plateau, our articles provide actionable advice
                                backed by the latest research. Learn about <Link href="/blog/intermittent-fasting-beginners-guide" className="text-[#0073CF] hover:underline">intermittent fasting</Link>,
                                {' '}<Link href="/blog/how-to-calculate-macros-for-weight-loss" className="text-[#0073CF] hover:underline">macro tracking</Link>, and more.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        {/* Categories */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                            <ul className="space-y-2 text-sm">
                                {categories.slice(1).map((cat) => (
                                    <li key={cat}>
                                        <Link href={`/blog?category=${cat.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-600 hover:text-[#0073CF]">
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Popular Posts */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Popular Posts</h3>
                            <ul className="space-y-3 text-sm">
                                {blogPosts.slice(0, 4).map((post) => (
                                    <li key={post.slug}>
                                        <Link href={`/blog/${post.slug}`} className="text-[#0073CF] hover:underline line-clamp-2">
                                            {post.title}
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
