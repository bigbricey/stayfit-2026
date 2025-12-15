"use client";

import React, { useState } from 'react';
import pricingData from '../data/pricing.json';
import { CONFIG } from '../config';

type CalculatorProps = {
  defaultCity?: string;
  defaultState?: string;
};

export default function CostCalculator({ defaultCity = "Austin", defaultState = "TX" }: CalculatorProps) {
  const [weight, setWeight] = useState<number | ''>('');
  const [heightFt, setHeightFt] = useState<number | ''>('');
  const [heightIn, setHeightIn] = useState<number | ''>('');
  const [insurance, setInsurance] = useState<string>('commercial');
  const [showResults, setShowResults] = useState(false);

  // Calculate BMI
  const calculateBMI = () => {
    if (!weight || !heightFt || heightIn === '') return 0;
    const heightTotalInches = (Number(heightFt) * 12) + Number(heightIn);
    const bmi = (Number(weight) / (heightTotalInches * heightTotalInches)) * 703;
    return parseFloat(bmi.toFixed(1));
  };

  const bmi = calculateBMI();
  const isEligible = bmi >= 27; // General guideline + comorbidity, simplifying for tool
  const savings = pricingData.brand.price - pricingData.compounded[0].price;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {!showResults ? (
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Check Eligibility & Pricing in {defaultCity}</h2>
          <p className="text-slate-400 mb-8">See if you qualify for compounding pharmacy pricing without insurance.</p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Height (ft)</label>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Height (in)</label>
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Current Weight (lbs)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="190"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Insurance Type</label>
              <select
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="commercial">Commercial Insurance</option>
                <option value="medicaid">Medicaid / Medicare</option>
                <option value="none">No Insurance</option>
              </select>
            </div>

            <button
              onClick={() => window.open(CONFIG.AFFILIATE_LINK, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-4 animate-pulse hover:animate-none"
            >
              {CONFIG.BUTTON_TEXT}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-900">
          <div className="text-center mb-8">
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${isEligible ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
              {isEligible ? 'Likely Eligible' : 'Consultation Recommended'}
            </span>
            <h3 className="text-2xl font-bold text-white">
              Estimated Monthly Cost: <span className="text-green-400">${pricingData.compounded[0].price}</span>
            </h3>
            <p className="text-slate-400 mt-2">
              vs. ${pricingData.brand.price} (Retail Price)
            </p>
            <div className="mt-4 p-4 bg-green-900/20 border border-green-900/50 rounded-lg inline-block">
              <p className="text-green-400 font-bold">You could save ${savings.toLocaleString()}/mo</p>
            </div>
          </div>

          <div className="space-y-4">
            {pricingData.compounded.map((provider, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all group cursor-pointer" onClick={() => window.open(CONFIG.AFFILIATE_LINK, '_blank')}>
                <div>
                  <h4 className="font-bold text-white">{provider.name}</h4>
                  <p className="text-sm text-slate-400">{provider.intro_offer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-lg">${provider.price}<span className="text-sm text-slate-500">/mo</span></p>
                  <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300">Check Availability &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowResults(false)}
            className="w-full mt-8 text-slate-500 hover:text-white transition-colors text-sm"
          >
            Recalculate
          </button>
        </div>
      )}
    </div>
  );
}

