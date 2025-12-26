'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number; // ms
    className?: string;
    onComplete?: () => void;
}

export function AnimatedNumber({
    value,
    duration = 500,
    className = '',
    onComplete
}: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);
    const previousValue = useRef(value);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (previousValue.current === value) return;

        const startValue = previousValue.current;
        const endValue = value;
        const startTime = performance.now();
        setIsAnimating(true);

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);

            const current = Math.round(startValue + (endValue - startValue) * eased);
            setDisplayValue(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
                setIsAnimating(false);
                previousValue.current = endValue;
                onComplete?.();
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, duration, onComplete]);

    // Set initial value
    useEffect(() => {
        previousValue.current = value;
        setDisplayValue(value);
    }, []);

    return (
        <span
            className={`${className} ${isAnimating ? 'scale-110' : 'scale-100'} transition-transform duration-150`}
        >
            {displayValue}
        </span>
    );
}
