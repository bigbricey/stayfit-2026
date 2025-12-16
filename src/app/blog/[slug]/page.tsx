import { blogPosts } from '@/data/blogPosts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Generate static paths for all blog posts
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

// Generate SEO metadata for each post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${post.title} | StayFitWithAI`,
        description: post.excerpt,
        keywords: post.keywords.join(', '),
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            siteName: 'StayFitWithAI',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        },
        alternates: {
            canonical: `https://stayfitwithai.com/blog/${slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        author: {
            '@type': 'Person',
            name: post.author,
            description: post.authorBio,
        },
        datePublished: post.date,
        dateModified: post.date,
        publisher: {
            '@type': 'Organization',
            name: 'StayFitWithAI',
            url: 'https://stayfitwithai.com',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://stayfitwithai.com/blog/${slug}`,
        },
        keywords: post.keywords.join(', '),
    };

    // Related posts (exclude current)
    const relatedPosts = blogPosts
        .filter((p) => p.slug !== slug)
        .filter((p) => p.category === post.category || p.keywords.some((k) => post.keywords.includes(k)))
        .slice(0, 3);

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="bg-[#F5F5F5] min-h-screen">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-3xl mx-auto px-4 py-3">
                        <nav className="text-sm text-gray-500">
                            <Link href="/" className="hover:text-[#0073CF]">Home</Link>
                            <span className="mx-2">›</span>
                            <Link href="/blog" className="hover:text-[#0073CF]">Blog</Link>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700">{post.category}</span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Header */}
                    <header className="mb-8">
                        <span className="inline-block bg-[#0073CF] text-white text-xs px-2 py-1 rounded uppercase font-medium mb-3">
                            {post.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {post.title}
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{post.author}</span>
                            <span>•</span>
                            <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                            <span>•</span>
                            <span>{post.readTime}</span>
                        </div>
                    </header>

                    {/* Article Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10">
                        <div
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#0073CF] prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                        />
                    </div>

                    {/* Author Box */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-[#E8F4FC] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                                👩‍⚕️
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Written by {post.author}</div>
                                <p className="text-gray-600 text-sm mt-1">{post.authorBio}</p>
                            </div>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-10">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {relatedPosts.map((related) => (
                                    <Link
                                        key={related.slug}
                                        href={`/blog/${related.slug}`}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <span className="text-xs text-[#0073CF] font-medium uppercase">{related.category}</span>
                                        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-[#0073CF]">
                                            {related.title}
                                        </h3>
                                        <div className="text-xs text-gray-500 mt-2">{related.readTime}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="bg-[#0073CF] rounded-lg p-6 text-center text-white mt-10">
                        <h2 className="text-xl font-bold mb-2">Ready to Start Your Journey?</h2>
                        <p className="text-blue-100 mb-4">Track your calories, macros, and progress for free.</p>
                        <Link
                            href="/signup"
                            className="inline-block bg-white text-[#0073CF] px-6 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </article>
        </>
    );
}

// Simple markdown-like formatting
function formatContent(content: string): string {
    return content
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
        .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#0073CF] hover:underline">$1</a>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#0073CF] pl-4 italic text-gray-600 my-4">$1</blockquote>')
        .replace(/\n\n/g, '</p><p class="mb-4">')
        .replace(/^\|(.+)\|$/gim, (match) => {
            const cells = match.split('|').filter(Boolean).map(c => c.trim());
            return `<tr>${cells.map(c => `<td class="border border-gray-200 px-3 py-2">${c}</td>`).join('')}</tr>`;
        });
}
