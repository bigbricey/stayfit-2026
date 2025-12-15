import { MetadataRoute } from 'next';
import locations from '@/data/locations.json';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://stayfitwithai.com';

    const cityUrls = locations.map((loc) => ({
        url: `${baseUrl}/availability/${loc.state.toLowerCase()}/${loc.city.toLowerCase().replace(/ /g, '-')}`, // Note: matching the slug logic in Page
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...cityUrls,
    ];
}
