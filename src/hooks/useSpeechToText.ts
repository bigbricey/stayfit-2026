'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface UseSpeechToTextOptions {
    onTranscript?: (transcript: string) => void;
    onFinalTranscript?: (transcript: string) => void;
}

// Web Speech API event types (not fully typed in lib.dom.d.ts)
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

// Web Speech API interface (for typing purposes)
interface WebSpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onaudiostart: (() => void) | null;
    onsoundstart: (() => void) | null;
    onspeechstart: (() => void) | null;
    onspeechend: (() => void) | null;
    onnomatch: (() => void) | null;
}

// Type constructor for WebSpeechRecognition
type WebSpeechRecognitionConstructor = new () => WebSpeechRecognition;

// Window augmentation for Web Speech API
declare global {
    interface Window {
        SpeechRecognition?: WebSpeechRecognitionConstructor;
        webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
    }
}

export function useSpeechToText({ onTranscript, onFinalTranscript }: UseSpeechToTextOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<WebSpeechRecognition | null>(null);

    const onTranscriptRef = useRef(onTranscript);
    const onFinalTranscriptRef = useRef(onFinalTranscript);

    // Update refs whenever the callbacks change
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
        onFinalTranscriptRef.current = onFinalTranscript;
    }, [onTranscript, onFinalTranscript]);

    const explicitlyStopped = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize recognition object
        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionClass) {
            return;
        }

        const recognition = new SpeechRecognitionClass();

        // Mobile browsers often handle continuous: true poorly
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        recognition.continuous = !isMobile;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            logger.debug('Speech recognition result received', event);
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            logger.debug('Transcripts:', { interim: interimTranscript, final: finalTranscript });

            if (interimTranscript && onTranscriptRef.current) {
                onTranscriptRef.current(interimTranscript);
            }

            if (finalTranscript && onFinalTranscriptRef.current) {
                onFinalTranscriptRef.current(finalTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            logger.error('Speech recognition error event', event);
            if (event.error !== 'no-speech') {
                setError(event.error);
                setIsListening(false);
            }
        };

        recognition.onstart = () => {
            logger.debug('Speech recognition started');
            setIsListening(true);
        };

        recognition.onend = () => {
            logger.debug('Speech recognition ended');
            // If it ended but we didn't explicitly stop it (like a mobile timeout)
            // and we are on mobile, we might want to restart
            if (isMobile && !explicitlyStopped.current) {
                logger.debug('Restarting recognition for mobile stability...');
                try {
                    recognition.start();
                } catch (e) {
                    logger.error('Failed to restart recognition', e);
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };

        // Extra events for debugging mobile
        recognition.onaudiostart = () => logger.debug('Audio capture started');
        recognition.onsoundstart = () => logger.debug('Sound detected');
        recognition.onspeechstart = () => logger.debug('Speech detected');
        recognition.onspeechend = () => logger.debug('Speech ended');
        recognition.onnomatch = () => logger.debug('No match found');

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                explicitlyStopped.current = true;
                recognitionRef.current.stop();
            }
        };
    }, []); // Run once on mount

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setError(null);
            explicitlyStopped.current = false;
            try {
                recognitionRef.current.start();
                // Note: setIsListening(true) happens in onstart
            } catch (err) {
                logger.error('Failed to start speech recognition', err);
                setError('Failed to start speech recognition');
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            explicitlyStopped.current = true;
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        error,
        startListening,
        stopListening,
        toggleListening,
        isSupported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
}

