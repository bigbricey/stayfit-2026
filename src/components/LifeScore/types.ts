// Life Score RPG — Complete Type System

// ============================================
// DAILY CHECK-IN (existing, unchanged)
// ============================================

export interface DailyCheckIn {
    date: string; // YYYY-MM-DD
    nutrition: number; // 1-10 → VIT
    fitness: number; // 1-10 → STR
    work: number; // 1-10 → INT
    social: number; // 1-10 → CHA
    safety: number; // 1-10 → DEF
    health: number; // 1-10 → STA
    notes?: string;
    createdAt: string;
}

// ============================================
// RPG STAT SYSTEM
// ============================================

export interface PlayerStats {
    // Core stats (cumulative from daily check-ins)
    vit: number; // Vitality (Nutrition)
    str: number; // Strength (Fitness)
    int: number; // Intelligence (Work)
    cha: number; // Charisma (Social)
    def: number; // Defense (Safety)
    sta: number; // Stamina (Health/Energy)
}

export interface PlayerBars {
    hp: { current: number; max: number };
    mp: { current: number; max: number };
    fatigue: number; // 0-100
}

export interface PlayerProgress {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    title: string;
    titleColor: string;
    classModifier: string | null;
}

export interface PlayerData {
    // Identity
    progress: PlayerProgress;
    stats: PlayerStats;
    bars: PlayerBars;

    // Streaks
    currentStreak: number;
    longestStreak: number;
    totalDaysLogged: number;

    // History
    checkIns: DailyCheckIn[];
    lastLogDate: string | null;

    // Meta
    createdAt: string;
    lastDecayCheck: string;
}

// ============================================
// DIMENSIONS CONFIG
// ============================================

export const DIMENSIONS = [
    { key: 'nutrition', stat: 'vit', label: 'VIT', fullLabel: 'Vitality', emoji: '❤️', description: 'Nutrition quality' },
    { key: 'fitness', stat: 'str', label: 'STR', fullLabel: 'Strength', emoji: '⚔️', description: 'Physical activity' },
    { key: 'work', stat: 'int', label: 'INT', fullLabel: 'Intelligence', emoji: '🧠', description: 'Productive focus' },
    { key: 'social', stat: 'cha', label: 'CHA', fullLabel: 'Charisma', emoji: '💬', description: 'Kindness & connection' },
    { key: 'safety', stat: 'def', label: 'DEF', fullLabel: 'Defense', emoji: '🛡️', description: 'Risk avoidance' },
    { key: 'health', stat: 'sta', label: 'STA', fullLabel: 'Stamina', emoji: '⚡', description: 'Energy & recovery' },
] as const;

export type DimensionKey = typeof DIMENSIONS[number]['key'];
export type StatKey = typeof DIMENSIONS[number]['stat'];

// ============================================
// TITLE SYSTEM
// ============================================

export const TITLES = [
    { minLevel: 1, title: 'CIVILIAN', color: 'text-gray-400' },
    { minLevel: 10, title: 'TRAINEE', color: 'text-green-400' },
    { minLevel: 20, title: 'HUNTER', color: 'text-cyan-400' },
    { minLevel: 30, title: 'WARRIOR', color: 'text-purple-400' },
    { minLevel: 40, title: 'ELITE', color: 'text-amber-400' },
    { minLevel: 50, title: 'CHAMPION', color: 'text-orange-400' },
    { minLevel: 75, title: 'MASTER', color: 'text-red-400' },
    { minLevel: 90, title: 'MONARCH', color: 'text-pink-300' },
] as const;

// ============================================
// CALCULATION FUNCTIONS
// ============================================

export function calculateDailyScore(checkIn: Omit<DailyCheckIn, 'date' | 'createdAt' | 'notes'>): number {
    const scores = [
        checkIn.nutrition,
        checkIn.fitness,
        checkIn.work,
        checkIn.social,
        checkIn.safety,
        checkIn.health,
    ];
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10); // 0-100 scale
}

export function calculateXPEarned(dailyScore: number, streakDays: number): number {
    const baseXP = dailyScore * 3; // 100 score = 300 XP
    const streakBonus = Math.min(streakDays * 0.1, 2); // Max 200% bonus at 20+ day streak
    return Math.round(baseXP * (1 + streakBonus));
}

export function calculateXPForLevel(level: number): number {
    return level * 100; // Level 1→2 = 100 XP, Level 50→51 = 5000 XP
}

export function getTotalXPForLevel(level: number): number {
    // Sum of all XP needed to reach this level
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += calculateXPForLevel(i);
    }
    return total;
}

export function getLevelFromTotalXP(totalXP: number): { level: number; currentXP: number; xpToNext: number } {
    let level = 1;
    let remainingXP = totalXP;

    while (remainingXP >= calculateXPForLevel(level) && level < 100) {
        remainingXP -= calculateXPForLevel(level);
        level++;
    }

    return {
        level,
        currentXP: remainingXP,
        xpToNext: calculateXPForLevel(level),
    };
}

export function getTitleForLevel(level: number): { title: string; color: string } {
    let result: { title: string; color: string } = { title: TITLES[0].title, color: TITLES[0].color };
    for (const t of TITLES) {
        if (level >= t.minLevel) {
            result = { title: t.title, color: t.color };
        }
    }
    return result;
}

export function getClassModifier(stats: PlayerStats): string | null {
    const statValues = [
        { key: 'str', value: stats.str, class: 'Berserker' },
        { key: 'vit', value: stats.vit, class: 'Vitalist' },
        { key: 'int', value: stats.int, class: 'Sage' },
        { key: 'cha', value: stats.cha, class: 'Diplomat' },
        { key: 'def', value: stats.def, class: 'Guardian' },
        { key: 'sta', value: stats.sta, class: 'Endurer' },
    ];

    const sorted = [...statValues].sort((a, b) => b.value - a.value);
    const highest = sorted[0];
    const secondHighest = sorted[1];

    // Only assign class if dominant stat is 20+ points ahead
    if (highest.value - secondHighest.value >= 20) {
        return highest.class;
    }
    return null;
}

// ============================================
// DECAY SYSTEM
// ============================================

export function calculateDecay(lastLogDate: string | null, currentDate: string): {
    missedDays: number;
    fatiguePenalty: number;
    statPenalty: number; // Percentage
    levelPenalty: number;
} {
    if (!lastLogDate) {
        return { missedDays: 0, fatiguePenalty: 0, statPenalty: 0, levelPenalty: 0 };
    }

    const last = new Date(lastLogDate);
    const current = new Date(currentDate);
    const diffTime = current.getTime() - last.getTime();
    const missedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) - 1; // -1 because same day doesn't count

    if (missedDays <= 0) {
        return { missedDays: 0, fatiguePenalty: 0, statPenalty: 0, levelPenalty: 0 };
    }

    let fatiguePenalty = 0;
    let statPenalty = 0;
    let levelPenalty = 0;

    if (missedDays >= 1) fatiguePenalty += 20;
    if (missedDays >= 2) { fatiguePenalty += 20; statPenalty = 5; }
    if (missedDays >= 3) { fatiguePenalty += 20; statPenalty = 10; levelPenalty = 1; }
    if (missedDays >= 5) { statPenalty = 20; levelPenalty = 2; }
    if (missedDays >= 7) { statPenalty = 30; levelPenalty = 3; }

    return { missedDays, fatiguePenalty: Math.min(fatiguePenalty, 100), statPenalty, levelPenalty };
}

export function applyDecay(player: PlayerData, decay: ReturnType<typeof calculateDecay>): PlayerData {
    if (decay.missedDays <= 0) return player;

    const newStats = { ...player.stats };
    const multiplier = 1 - (decay.statPenalty / 100);

    newStats.vit = Math.max(10, Math.round(newStats.vit * multiplier));
    newStats.str = Math.max(10, Math.round(newStats.str * multiplier));
    newStats.int = Math.max(10, Math.round(newStats.int * multiplier));
    newStats.cha = Math.max(10, Math.round(newStats.cha * multiplier));
    newStats.def = Math.max(10, Math.round(newStats.def * multiplier));
    newStats.sta = Math.max(10, Math.round(newStats.sta * multiplier));

    const newLevel = Math.max(1, player.progress.level - decay.levelPenalty);
    const { title, color } = getTitleForLevel(newLevel);

    return {
        ...player,
        stats: newStats,
        progress: {
            ...player.progress,
            level: newLevel,
            title,
            titleColor: color,
        },
        bars: {
            ...player.bars,
            fatigue: Math.min(100, player.bars.fatigue + decay.fatiguePenalty),
        },
        currentStreak: 0, // Streak breaks on miss
    };
}

// ============================================
// BAR CALCULATIONS
// ============================================

export function calculateBars(player: PlayerData): PlayerBars {
    const level = player.progress.level;

    // HP based on level + VIT
    const maxHP = 100 + (level * 10) + player.stats.vit;
    const weeklyAvg = getWeeklyAverage(player.checkIns);
    const currentHP = Math.round((weeklyAvg / 100) * maxHP);

    // MP based on streak
    const maxMP = 50 + (level * 5) + player.stats.int;
    const currentMP = Math.min(maxMP, player.currentStreak * 10);

    return {
        hp: { current: currentHP, max: maxHP },
        mp: { current: currentMP, max: maxMP },
        fatigue: player.bars.fatigue,
    };
}

function getWeeklyAverage(checkIns: DailyCheckIn[]): number {
    const last7Days = checkIns.slice(0, 7);
    if (last7Days.length === 0) return 50;

    const sum = last7Days.reduce((acc, c) => acc + calculateDailyScore(c), 0);
    return Math.round(sum / last7Days.length);
}

// ============================================
// STAT GROWTH
// ============================================

export function applyCheckInToStats(player: PlayerData, checkIn: DailyCheckIn): PlayerStats {
    // Each daily stat contributes to cumulative total
    // Score 10 = +1 point, Score 5 = +0.5 point
    return {
        vit: player.stats.vit + Math.round(checkIn.nutrition / 10),
        str: player.stats.str + Math.round(checkIn.fitness / 10),
        int: player.stats.int + Math.round(checkIn.work / 10),
        cha: player.stats.cha + Math.round(checkIn.social / 10),
        def: player.stats.def + Math.round(checkIn.safety / 10),
        sta: player.stats.sta + Math.round(checkIn.health / 10),
    };
}

// ============================================
// LOCALSTORAGE PERSISTENCE
// ============================================

const STORAGE_KEY = 'lifescore_player';

export function createNewPlayer(): PlayerData {
    const now = new Date().toISOString();
    return {
        progress: {
            level: 1,
            currentXP: 0,
            xpToNextLevel: 100,
            title: 'CIVILIAN',
            titleColor: 'text-gray-400',
            classModifier: null,
        },
        stats: { vit: 10, str: 10, int: 10, cha: 10, def: 10, sta: 10 },
        bars: { hp: { current: 100, max: 120 }, mp: { current: 0, max: 55 }, fatigue: 0 },
        currentStreak: 0,
        longestStreak: 0,
        totalDaysLogged: 0,
        checkIns: [],
        lastLogDate: null,
        createdAt: now,
        lastDecayCheck: now,
    };
}

export function loadPlayerData(): PlayerData {
    if (typeof window === 'undefined') return createNewPlayer();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createNewPlayer();

    try {
        const player = JSON.parse(stored) as PlayerData;

        // Check and apply decay on load
        const today = getTodayString();
        if (player.lastDecayCheck !== today && player.lastLogDate) {
            const decay = calculateDecay(player.lastLogDate, today);
            if (decay.missedDays > 0) {
                const decayed = applyDecay(player, decay);
                decayed.lastDecayCheck = today;
                savePlayerData(decayed);
                return decayed;
            }
        }

        return player;
    } catch {
        return createNewPlayer();
    }
}

export function savePlayerData(player: PlayerData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

export function processCheckIn(checkIn: DailyCheckIn): { player: PlayerData; xpGained: number; leveledUp: boolean } {
    let player = loadPlayerData();

    // Remove existing entry for same date if exists
    const filtered = player.checkIns.filter(c => c.date !== checkIn.date);
    const isNewDay = !player.checkIns.some(c => c.date === checkIn.date);
    filtered.unshift(checkIn); // Add to front
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Update stats
    if (isNewDay) {
        player.stats = applyCheckInToStats(player, checkIn);
        player.totalDaysLogged++;
    }

    // Calculate streak
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (player.lastLogDate === yesterdayStr || player.lastLogDate === today || !player.lastLogDate) {
        player.currentStreak = isNewDay ? player.currentStreak + 1 : player.currentStreak;
    } else {
        player.currentStreak = 1; // Reset streak
    }
    player.longestStreak = Math.max(player.longestStreak, player.currentStreak);

    // Calculate XP
    const dailyScore = calculateDailyScore(checkIn);
    const xpGained = isNewDay ? calculateXPEarned(dailyScore, player.currentStreak) : 0;

    // Apply XP and check for level up
    const oldLevel = player.progress.level;
    const totalXP = getTotalXPForLevel(player.progress.level) + player.progress.currentXP + xpGained;
    const { level, currentXP, xpToNext } = getLevelFromTotalXP(totalXP);
    const { title, color } = getTitleForLevel(level);
    const classModifier = getClassModifier(player.stats);

    player.progress = {
        level,
        currentXP,
        xpToNextLevel: xpToNext,
        title,
        titleColor: color,
        classModifier,
    };

    // Update bars
    player.bars = calculateBars(player);
    player.bars.fatigue = Math.max(0, player.bars.fatigue - (dailyScore >= 90 ? 20 : dailyScore >= 70 ? 10 : 5));

    // Update meta
    player.checkIns = filtered;
    player.lastLogDate = checkIn.date;
    player.lastDecayCheck = today;

    savePlayerData(player);

    return {
        player,
        xpGained,
        leveledUp: level > oldLevel,
    };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

export function getTodayCheckIn(): DailyCheckIn | null {
    const player = loadPlayerData();
    const today = getTodayString();
    return player.checkIns.find(c => c.date === today) || null;
}

export function getLetterGrade(score: number): { grade: string; color: string } {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-500' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-500' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-500' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
}

// Legacy function for streak calculation (kept for compatibility)
export function calculateStreak(checkIns: DailyCheckIn[]): number {
    if (checkIns.length === 0) return 0;

    const sorted = [...checkIns].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (sorted[0].date !== today && sorted[0].date !== yesterdayStr) {
        return 0;
    }

    let streak = 0;
    let currentDate = new Date(sorted[0].date);

    for (const checkIn of sorted) {
        const checkInDate = new Date(checkIn.date);
        const diffDays = Math.floor(
            (currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 1) {
            streak++;
            currentDate = checkInDate;
        } else {
            break;
        }
    }

    return streak;
}

// Legacy compatibility exports
export function loadLifeScoreData() {
    const player = loadPlayerData();
    return {
        checkIns: player.checkIns,
        currentStreak: player.currentStreak,
        longestStreak: player.longestStreak,
    };
}

export function saveCheckIn(checkIn: DailyCheckIn) {
    const { player } = processCheckIn(checkIn);
    return {
        checkIns: player.checkIns,
        currentStreak: player.currentStreak,
        longestStreak: player.longestStreak,
    };
}
