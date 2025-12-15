import React from 'react';
import { notFound } from 'next/navigation';
import locations from '@/data/locations.json';
import CostCalculator from '@/components/CostCalculator';
import type { Metadata } from 'next';

type Props = {
    params: {
        state: string;
        city: string;
    };
};

// Generate segments for all cities in locations.json
export async function generateStaticParams() {
    return locations.map((loc) => ({
        state: loc.state.toLowerCase(),
        city: loc.slug.split('-').slice(0, -1).join('-'), // simple slug parsing or just use the slug field logic if we adjusted the route.
        // Actually, deeper logic: The route is [state]/[city].
        // locations.json has "slug": "new-york-ny".
        // We should probably structure the URL as /availability/ny/new-york
    }));
}

// Improved Logic:
// locations.json has 'slug': 'new-york-ny' and 'state': 'NY'.
// We want /availability/ny/new-york
// Let's refine generateStaticParams to match the route structure exactly.

/*
  Route: /availability/[state]/[city]
  Example: /availability/tx/austin
*/

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const cityData = locations.find(
        (l) => l.state.toLowerCase() === params.state &&
            l.slug.startsWith(params.city) // rough match, reliable enough for prototype
    );

    if (!cityData) return { title: 'Not Found' };

    return {
        title: `Semaglutide in ${cityData.city}, ${cityData.state}: Cost & Availability 2025`,
        description: `Looking for Ozempic or Wegovy in ${cityData.city}? Compare local pharmacy prices vs. compounded semaglutide options. Save up to $1,000/mo.`,
    };
}


export default function CityPage({ params }: Props) {
    // Find the city data
    const cityData = locations.find(
        (l) => l.state.toLowerCase() === params.state &&
            l.slug.startsWith(params.city)
        // Note: In a real app we'd store exact "city slug" in JSON. 
        // For this prototype, parsing "austin" from "austin-tx" is fine.
    );

    if (!cityData) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-slate-200">
            {/* Hero Section */}
            <div className="relative bg-slate-900 border-b border-slate-800 pt-20 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-900/30 text-blue-400 text-sm font-bold border border-blue-500/20 mb-6">
                        Updated for 2025
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
                        Semaglutide in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{cityData.city}, {cityData.state}</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Residents of {cityData.city} are often shocked by the $1,300+ price tag of brand-name GLP-1s.
                        See if you qualify for unmatched pricing on compounded semaglutide.
                    </p>
                </div>
            </div>

            {/* Calculator Section */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
                <CostCalculator defaultCity={cityData.city} defaultState={cityData.state} />
            </div>

            {/* Content Section */}
            <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6">Why is Ozempic so expensive in {cityData.city}?</h2>
                    <p className="text-lg leading-relaxed text-slate-400">
                        If you've tried to fill a prescription at local pharmacies in {cityData.city}, you know the struggle.
                        Commercial insurance denial rates for weight loss medication are currently over 70%. Without coverage,
                        local pharmacies simply charge the list price set by manufacturers.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-white mb-6">The "Compounded" Loophole</h2>
                    <p className="text-lg leading-relaxed text-slate-400 mb-4">
                        Federal law allows compounding pharmacies to create versions of drugs that are currently in shortage.
                        Since Semaglutide (the active ingredient in Wegovy) has been on the FDA Shortage List since 2023,
                        providers like Ro, Hims, and OrderlyMeds are able to ship legal, safe compounded versions directly to
                        {cityData.state} residents.
                    </p>
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-2">Is it legal in {cityData.state}?</h4>
                        <p className="text-slate-400">Yes. Licensed telehealth providers are authorized to prescribe in {cityData.state}
                            and ship directly to your door in {cityData.city}.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold text-white mb-6">Local Providers vs. Telehealth</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="py-4 font-bold text-white">Feature</th>
                                    <th className="py-4 font-bold text-blue-400">Telehealth (Compounded)</th>
                                    <th className="py-4 font-bold text-slate-500">Local {cityData.city} Pharmacy</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-400">
                                <tr className="border-b border-slate-800/50">
                                    <td className="py-4">Monthly Cost</td>
                                    <td className="py-4 text-white font-bold">$199 - $299</td>
                                    <td className="py-4 text-red-400">$1,300+</td>
                                </tr>
                                <tr className="border-b border-slate-800/50">
                                    <td className="py-4">Availability</td>
                                    <td className="py-4 text-white">In Stock (Shipped)</td>
                                    <td className="py-4">Often Backordered</td>
                                </tr>
                                <tr>
                                    <td className="py-4">Doctor Visit</td>
                                    <td className="py-4 text-white">Included (Online)</td>
                                    <td className="py-4">$150+ Copay/Visit</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}
