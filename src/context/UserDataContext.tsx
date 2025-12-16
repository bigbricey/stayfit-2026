'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface WeightEntry {
    date: string;
    weight: number;
}

export interface Measurement {
    value: number;
    date: string;
}

export interface NutritionGoals {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

export interface FitnessGoals {
    caloriesBurnedPerWeek: number;
    workoutsPerWeek: number;
    exerciseMinutesPerWeek: number;
}

export interface UserData {
    // Weight
    currentWeight: number;
    startingWeight: number;
    goalWeight: number;
    weightHistory: WeightEntry[];

    // Measurements
    measurements: Record<string, Measurement>;

    // Goals
    nutritionGoals: NutritionGoals;
    fitnessGoals: FitnessGoals;
    weeklyWeightLossGoal: number; // lbs per week
}

interface UserDataContextType {
    userData: UserData;
    updateWeight: (weight: number) => void;
    updateMeasurement: (name: string, value: number) => void;
    updateNutritionGoals: (goals: Partial<NutritionGoals>) => void;
    updateFitnessGoals: (goals: Partial<FitnessGoals>) => void;
    updateGoalWeight: (weight: number) => void;
    getWeightProgress: () => { lost: number; toGo: number; percentage: number };
}

const defaultUserData: UserData = {
    currentWeight: 172,
    startingWeight: 180,
    goalWeight: 160,
    weightHistory: [
        { date: '2024-11-01', weight: 180 },
        { date: '2024-11-15', weight: 178 },
        { date: '2024-12-01', weight: 175 },
        { date: '2024-12-10', weight: 173 },
        { date: '2024-12-14', weight: 172 },
    ],
    measurements: {
        'Waist': { value: 32, date: '2024-12-10' },
        'Waist (Flexed)': { value: 31, date: '2024-12-10' },
        'Right Arm': { value: 13, date: '2024-12-10' },
        'Right Arm (Flexed)': { value: 14, date: '2024-12-10' },
        'Left Arm': { value: 13, date: '2024-12-10' },
        'Left Arm (Flexed)': { value: 14, date: '2024-12-10' },
        'Right Forearm': { value: 11, date: '2024-12-10' },
        'Right Forearm (Flexed)': { value: 11.5, date: '2024-12-10' },
        'Left Forearm': { value: 11, date: '2024-12-10' },
        'Left Forearm (Flexed)': { value: 11.5, date: '2024-12-10' },
        'Right Thigh': { value: 22, date: '2024-12-10' },
        'Right Thigh (Flexed)': { value: 23, date: '2024-12-10' },
        'Left Thigh': { value: 22, date: '2024-12-10' },
        'Left Thigh (Flexed)': { value: 23, date: '2024-12-10' },
        'Right Calf': { value: 15, date: '2024-12-10' },
        'Right Calf (Flexed)': { value: 15.5, date: '2024-12-10' },
        'Left Calf': { value: 15, date: '2024-12-10' },
        'Left Calf (Flexed)': { value: 15.5, date: '2024-12-10' },
        'Chest': { value: 40, date: '2024-12-10' },
        'Chest (Flexed)': { value: 42, date: '2024-12-10' },
    },
    nutritionGoals: {
        calories: 2000,
        protein: 100,
        fat: 67,
        carbs: 250,
    },
    fitnessGoals: {
        caloriesBurnedPerWeek: 2500,
        workoutsPerWeek: 5,
        exerciseMinutesPerWeek: 150,
    },
    weeklyWeightLossGoal: 1,
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('stayfitwithai_userdata');
        if (saved) {
            try {
                setUserData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved user data:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('stayfitwithai_userdata', JSON.stringify(userData));
        }
    }, [userData, isLoaded]);

    const updateWeight = (weight: number) => {
        const today = new Date().toISOString().split('T')[0];
        setUserData(prev => ({
            ...prev,
            currentWeight: weight,
            weightHistory: [
                ...prev.weightHistory.filter(w => w.date !== today),
                { date: today, weight }
            ].sort((a, b) => a.date.localeCompare(b.date)),
        }));
    };

    const updateMeasurement = (name: string, value: number) => {
        const today = new Date().toISOString().split('T')[0];
        setUserData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                [name]: { value, date: today },
            },
        }));
    };

    const updateNutritionGoals = (goals: Partial<NutritionGoals>) => {
        setUserData(prev => ({
            ...prev,
            nutritionGoals: { ...prev.nutritionGoals, ...goals },
        }));
    };

    const updateFitnessGoals = (goals: Partial<FitnessGoals>) => {
        setUserData(prev => ({
            ...prev,
            fitnessGoals: { ...prev.fitnessGoals, ...goals },
        }));
    };

    const updateGoalWeight = (weight: number) => {
        setUserData(prev => ({
            ...prev,
            goalWeight: weight,
        }));
    };

    const getWeightProgress = () => {
        const lost = userData.startingWeight - userData.currentWeight;
        const toGo = userData.currentWeight - userData.goalWeight;
        const total = userData.startingWeight - userData.goalWeight;
        const percentage = total > 0 ? (lost / total) * 100 : 0;
        return { lost, toGo, percentage };
    };

    return (
        <UserDataContext.Provider value={{
            userData,
            updateWeight,
            updateMeasurement,
            updateNutritionGoals,
            updateFitnessGoals,
            updateGoalWeight,
            getWeightProgress,
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData() {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
}
