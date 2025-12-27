'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    SoloLevelingPage,
    SystemPanelWithHeader,
    SystemButton
} from '@/components/SoloLeveling';
import { NotificationManager } from '@/components/SoloLeveling/SystemNotification';
import { XPPopup } from '@/components/SoloLeveling/XPPopup';
import { ArrowLeft, Coffee, Sun, Moon, Cookie, Search, Loader2 } from 'lucide-react';
import { saveMeal } from '@/lib/actions/meals';

const MEAL_ICONS: Record<string, any> = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie
};

interface ServingOption {
    label: string;
    grams: number;
}

interface NutritionResult {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fdcId: number;
    servingSize: number;
    servingSizeUnit: string;
    householdServing: string;
    servingOptions: ServingOption[];
    brandName?: string;
}

export default function MealEntryPage() {
    const router = useRouter();
    const params = useParams();
    const mealType = params?.meal as string;

    const [mounted, setMounted] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NutritionResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Unit conversion options
    const UNIT_OPTIONS = [
        { label: 'g', grams: 1, display: 'grams' },
        { label: 'oz', grams: 28.35, display: 'ounces' },
        { label: 'lb', grams: 453.6, display: 'pounds' },
        { label: 'kg', grams: 1000, display: 'kilograms' },
    ];

    // Selected Food State
    const [selectedFood, setSelectedFood] = useState<NutritionResult | null>(null);
    const [quantity, setQuantity] = useState('100');
    const [selectedUnit, setSelectedUnit] = useState(UNIT_OPTIONS[0]); // Default to grams
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Feedback State
    const [notifications, setNotifications] = useState<{ id: string; message: string; type?: 'info' | 'success' | 'warning' }[]>([]);
    const [xpPopups, setXpPopups] = useState<{ id: string; amount: number }[]>([]);

    useEffect(() => {
        setMounted(true);
        if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
            router.push('/dashboard/food');
        }
    }, [mealType, router]);

    // Calculate nutrition based on quantity and unit
    const totalGrams = useMemo(() => {
        const qty = parseFloat(quantity) || 0;
        return Math.round(qty * selectedUnit.grams * 10) / 10; // Round to 1 decimal
    }, [quantity, selectedUnit]);

    const calculatedNutrition = useMemo(() => {
        if (!selectedFood) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }

        const multiplier = totalGrams / 100;

        return {
            calories: Math.round(selectedFood.calories * multiplier),
            protein: Math.round(selectedFood.protein * multiplier),
            carbs: Math.round(selectedFood.carbs * multiplier),
            fat: Math.round(selectedFood.fat * multiplier),
        };
    }, [selectedFood, totalGrams]);

    // Debounced nutrition search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2 || selectedFood) {
            if (!selectedFood) {
                setSearchResults([]);
                setShowResults(false);
            }
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/nutrition?q=${encodeURIComponent(searchQuery)}`, {
                    signal: controller.signal
                });
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.results || []);
                    setShowResults(true);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Search error:', err);
                }
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery, selectedFood]);

    const selectFood = (food: NutritionResult) => {
        setSelectedFood(food);
        setSearchQuery(food.name);
        setShowResults(false);
        setQuantity('100');
        setSelectedUnit(UNIT_OPTIONS[0]); // Default to grams

        showNotification('FOOD SELECTED - ENTER AMOUNT', 'info');
    };

    const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    const showXPGain = (amount: number) => {
        const id = Date.now().toString();
        setXpPopups(prev => [...prev, { id, amount }]);
    };

    const handleSubmit = async () => {
        if (!selectedFood || calculatedNutrition.calories === 0) return;

        setIsPending(true);
        const xpGain = Math.floor(calculatedNutrition.calories / 20) + 10;

        try {
            await saveMeal({
                name: selectedFood.name,
                calories: calculatedNutrition.calories,
                protein: calculatedNutrition.protein,
                carbs: calculatedNutrition.carbs,
                fat: calculatedNutrition.fat,
                meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            });

            showXPGain(xpGain);
            showNotification(`${mealType.toUpperCase()} LOGGED SUCCESSFULLY`, 'success');

            setTimeout(() => {
                router.push('/dashboard/food');
            }, 1500);
        } catch (error) {
            console.error('Save error:', error);
            showNotification('SAVE FAILED - TRY AGAIN', 'warning');
            setIsPending(false);
        }
    };

    const clearSelection = () => {
        setSelectedFood(null);
        setSearchQuery('');
        setQuantity('100');
        setSelectedUnit(UNIT_OPTIONS[0]);
    };

    if (!mounted) return null;

    const MealIcon = MEAL_ICONS[mealType] || Coffee;

    return (
        <SoloLevelingPage>
            {/* XP Popups */}
            {xpPopups.map((popup) => (
                <XPPopup
                    key={popup.id}
                    amount={popup.amount}
                    onComplete={() => setXpPopups(prev => prev.filter(p => p.id !== popup.id))}
                />
            ))}

            <NotificationManager
                notifications={notifications}
                onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />

            <SystemPanelWithHeader
                title={`LOG ${mealType.toUpperCase()}`}
                icon={MealIcon}
                className="h-full"
                backButton={
                    <button
                        onClick={() => router.push('/dashboard/food')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] tracking-[0.2em] font-mono uppercase">BACK</span>
                    </button>
                }
            >
                <div className="space-y-6 mt-4">
                    {/* Search Input */}
                    <div className="relative">
                        <label className="text-white text-xs tracking-[0.2em] uppercase mb-3 block font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                            SEARCH FOOD
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (selectedFood) clearSelection();
                                }}
                                onFocus={() => searchResults.length > 0 && !selectedFood && setShowResults(true)}
                                placeholder="Type to search (e.g. ribeye steak)"
                                autoFocus
                                className="w-full bg-black/40 border border-white/20 text-white px-6 py-4 pr-12 placeholder-white/30 
                                    focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all
                                    text-lg tracking-wider"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isSearching ? (
                                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5 text-white/40" />
                                )}
                            </div>
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-black/95 border border-cyan-400/50 max-h-60 overflow-y-auto">
                                {searchResults.map((food, idx) => (
                                    <button
                                        key={food.fdcId || idx}
                                        onClick={() => selectFood(food)}
                                        className="w-full px-4 py-3 text-left hover:bg-cyan-400/20 border-b border-white/10 last:border-0 transition-colors"
                                    >
                                        <div className="text-white text-sm truncate">{food.name}</div>
                                        <div className="text-white/50 text-xs mt-1">
                                            {Math.round(food.calories)} cal/100g • {food.servingOptions.length} serving options
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Food Card */}
                    {selectedFood && (
                        <div className="border border-cyan-400/30 bg-cyan-400/5 p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-cyan-400 text-xs tracking-widest uppercase mb-1">SELECTED</div>
                                    <div className="text-white font-medium">{selectedFood.name}</div>
                                    {selectedFood.brandName && (
                                        <div className="text-white/50 text-xs mt-1">{selectedFood.brandName}</div>
                                    )}
                                </div>
                                <button
                                    onClick={clearSelection}
                                    className="text-white/40 hover:text-white text-xs"
                                >
                                    CHANGE
                                </button>
                            </div>

                            {/* Quantity + Unit Selector */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Quantity Input */}
                                <div>
                                    <label className="text-white/60 text-[10px] tracking-wider uppercase block mb-2">
                                        QUANTITY
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Amount"
                                        className="w-full bg-black/60 border border-white/30 text-white text-center text-3xl font-bold px-4 py-4
                                            focus:border-cyan-400 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Unit Dropdown */}
                                <div className="relative">
                                    <label className="text-white/60 text-[10px] tracking-wider uppercase block mb-2">
                                        UNIT
                                    </label>
                                    <button
                                        onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                                        className="w-full bg-black/60 border border-white/30 text-white text-center text-2xl font-bold px-4 py-4
                                            focus:border-cyan-400 focus:outline-none transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>{selectedUnit.label}</span>
                                        <svg className={`w-5 h-5 transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showUnitDropdown && (
                                        <div className="absolute z-50 w-full mt-1 bg-black/95 border border-cyan-400/50">
                                            {UNIT_OPTIONS.map((unit) => (
                                                <button
                                                    key={unit.label}
                                                    onClick={() => {
                                                        setSelectedUnit(unit);
                                                        setShowUnitDropdown(false);
                                                    }}
                                                    className={`w-full px-4 py-3 text-left hover:bg-cyan-400/20 border-b border-white/10 last:border-0 transition-colors
                                                        ${selectedUnit.label === unit.label ? 'bg-cyan-400/10 text-cyan-400' : 'text-white'}`}
                                                >
                                                    <span className="font-bold">{unit.label}</span>
                                                    <span className="text-white/50 ml-2">({unit.display})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gram Equivalent Display */}
                            <div className="text-center text-white/50 text-sm mt-2">
                                = {totalGrams}g
                            </div>
                        </div>
                    )}

                    {/* Calculated Macros Display */}
                    {selectedFood && (
                        <div className="border border-white/10 bg-black/30 p-4">
                            <div className="text-center text-white/40 text-xs tracking-wider mb-3">
                                NUTRITION FOR {quantity} {selectedUnit.label} ({totalGrams}g)
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="text-center">
                                    <div className="text-orange-400 text-3xl font-bold">{calculatedNutrition.calories}</div>
                                    <div className="text-orange-400/60 text-[10px] tracking-wider uppercase mt-1">CAL</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-red-400 text-3xl font-bold">{calculatedNutrition.protein}g</div>
                                    <div className="text-red-400/60 text-[10px] tracking-wider uppercase mt-1">PROTEIN</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-yellow-400 text-3xl font-bold">{calculatedNutrition.carbs}g</div>
                                    <div className="text-yellow-400/60 text-[10px] tracking-wider uppercase mt-1">CARBS</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-blue-400 text-3xl font-bold">{calculatedNutrition.fat}g</div>
                                    <div className="text-blue-400/60 text-[10px] tracking-wider uppercase mt-1">FAT</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Helper text */}
                    {!selectedFood && (
                        <p className="text-center text-white/40 text-xs">
                            Search for a food to get started
                        </p>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                        <SystemButton
                            onClick={handleSubmit}
                            disabled={isPending || !selectedFood || calculatedNutrition.calories === 0}
                            className={(!selectedFood || calculatedNutrition.calories === 0)
                                ? "opacity-50 grayscale"
                                : "border-cyan-400 text-cyan-400"}
                        >
                            {isPending ? 'SAVING...' : `LOG ${calculatedNutrition.calories} CALORIES`}
                        </SystemButton>
                    </div>
                </div>
            </SystemPanelWithHeader>
        </SoloLevelingPage>
    );
}
