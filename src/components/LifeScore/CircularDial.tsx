'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface CircularDialProps {
    value: number;
    onChange: (value: number) => void;
    label: string;
    fullLabel: string;
    emoji: string;
    min?: number;
    max?: number;
}

export function CircularDial({
    value,
    onChange,
    label,
    fullLabel,
    emoji,
    min = 1,
    max = 10
}: CircularDialProps) {
    const dialRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const percentage = ((value - min) / (max - min)) * 100;

    // SVG arc calculation
    const radius = 45;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color based on value
    const getColor = (val: number) => {
        if (val >= 8) return { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.6)' }; // Green
        if (val >= 6) return { stroke: '#00d4ff', glow: 'rgba(0, 212, 255, 0.6)' }; // Cyan
        if (val >= 4) return { stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.6)' }; // Yellow
        return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' }; // Red
    };

    const colors = getColor(value);

    const handleInteraction = useCallback((clientX: number, clientY: number) => {
        if (!dialRef.current) return;

        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate angle from center
        const angle = Math.atan2(clientY - centerY, clientX - centerX);

        // Convert angle to value (0-10)
        // Start from top (-90deg = -PI/2), go clockwise
        let normalizedAngle = angle + Math.PI / 2; // Shift so 0 is at top
        if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

        // Map angle (0 to 2PI) to value (1 to 10)
        const rawValue = (normalizedAngle / (2 * Math.PI)) * (max - min) + min;
        const newValue = Math.round(Math.max(min, Math.min(max, rawValue)));

        onChange(newValue);
    }, [onChange, min, max]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            handleInteraction(e.clientX, e.clientY);
        }
    }, [isDragging, handleInteraction]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        const touch = e.touches[0];
        handleInteraction(touch.clientX, touch.clientY);
    };

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (isDragging) {
            const touch = e.touches[0];
            handleInteraction(touch.clientX, touch.clientY);
        }
    }, [isDragging, handleInteraction]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    return (
        <div
            ref={dialRef}
            className={`
                relative flex flex-col items-center justify-center
                cursor-pointer select-none touch-none
                transition-transform duration-200
                ${isDragging ? 'scale-110' : 'hover:scale-105'}
            `}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* Dial Container */}
            <div
                className="relative w-28 h-28"
                style={{
                    filter: `drop-shadow(0 0 15px ${colors.glow})`
                }}
            >
                {/* Background Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="rgba(0, 50, 80, 0.5)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Arc */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: isDragging ? 'none' : 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
                        }}
                    />
                    {/* Glow effect */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth + 4}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        opacity="0.3"
                        style={{
                            filter: 'blur(4px)',
                            transition: isDragging ? 'none' : 'stroke-dashoffset 0.3s ease',
                        }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl mb-1">{emoji}</span>
                    <span
                        className="text-2xl font-black"
                        style={{ color: colors.stroke, textShadow: `0 0 10px ${colors.glow}` }}
                    >
                        {value}
                    </span>
                </div>

                {/* Tick marks */}
                <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => {
                        const angle = (i / 10) * 360 - 90;
                        const isActive = i < value;
                        return (
                            <div
                                key={i}
                                className="absolute w-1 h-2 rounded-full"
                                style={{
                                    left: '50%',
                                    top: '4px',
                                    transformOrigin: '50% 52px',
                                    transform: `translateX(-50%) rotate(${angle}deg)`,
                                    backgroundColor: isActive ? colors.stroke : 'rgba(100, 116, 139, 0.3)',
                                    boxShadow: isActive ? `0 0 5px ${colors.glow}` : 'none',
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Label */}
            <div className="text-center mt-2">
                <p className="text-sm font-bold text-cyan-100 tracking-wider">{label}</p>
                <p className="text-xs text-cyan-400/50">{fullLabel}</p>
            </div>
        </div>
    );
}
