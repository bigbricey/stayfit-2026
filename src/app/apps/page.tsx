import Link from 'next/link';

const categories = [
    'All',
    'Activity Trackers',
    'Step Trackers',
    'Scales',
    'Lifestyle',
    'Wearables',
    'Fitness Apps',
    'Exercise Equipment',
    'Fertility',
];

const featuredApps = [
    { name: 'Fitbit', category: 'Activity Trackers', logo: '⌚' },
    { name: 'Garmin Connect', category: 'Activity Trackers', logo: '🏃' },
    { name: 'Apple Watch', category: 'Wearables', logo: '⌚' },
];

const allApps = [
    { name: 'Fitbit', category: 'Activity Trackers', logo: '⌚' },
    { name: 'Garmin Connect', category: 'Activity Trackers', logo: '🏃' },
    { name: 'Apple Watch', category: 'Wearables', logo: '⌚' },
    { name: 'Strava', category: 'Fitness Apps', logo: '🚴' },
    { name: 'Withings', category: 'Scales', logo: '⚖️' },
    { name: 'Samsung Health', category: 'Activity Trackers', logo: '📱' },
    { name: 'MapMyRun', category: 'Fitness Apps', logo: '🗺️' },
    { name: 'Peloton', category: 'Exercise Equipment', logo: '🚲' },
    { name: 'Whoop', category: 'Wearables', logo: '💪' },
    { name: 'Oura Ring', category: 'Wearables', logo: '💍' },
];

export default function AppsPage() {
    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Secondary Navigation */}
            <div className="bg-[#E8F4FC] border-b border-[#C5DCE9]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-6 text-sm">
                        <Link href="/apps" className="py-2.5 text-[#0073CF] font-medium border-b-2 border-[#0073CF]">App Gallery</Link>
                        <Link href="/apps/mobile" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Mobile</Link>
                        <Link href="/apps/bmr" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">BMR</Link>
                        <Link href="/apps/steps" className="py-2.5 text-gray-600 hover:text-[#0073CF] border-b-2 border-transparent">Steps</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">App Gallery</h1>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-48 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                            <ul className="space-y-2 text-sm">
                                {categories.map((cat) => (
                                    <li key={cat}>
                                        <button className={`text-left w-full hover:text-[#0073CF] ${cat === 'All' ? 'text-[#0073CF] font-medium' : 'text-gray-600'}`}>
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Featured Apps */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">Featured Apps</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {featuredApps.map((app) => (
                                    <AppCard key={app.name} app={app} />
                                ))}
                            </div>
                        </div>

                        {/* All Apps */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">All Apps</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {allApps.map((app) => (
                                    <AppCard key={app.name} app={app} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AppCard({ app }: { app: { name: string; category: string; logo: string } }) {
    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
            {/* App Logo */}
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {app.logo}
            </div>

            {/* App Info */}
            <div className="flex-1">
                <Link href={`/apps/${app.name.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium text-[#0073CF] hover:underline">
                    {app.name}
                </Link>
                <div className="text-sm text-gray-500">{app.category}</div>
            </div>

            {/* GET Button */}
            <button className="bg-[#0073CF] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#005AA7] transition-colors">
                GET
            </button>
        </div>
    );
}
