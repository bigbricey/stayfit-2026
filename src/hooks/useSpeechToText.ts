'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechToTextOptions {
    onTranscript?: (transcript: string) => void;
    onFinalTranscript?: (transcript: string) => void;
}

export function useSpeechToText({ onTranscript, onFinalTranscript }: UseSpeechToTextOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    const onTranscriptRef = useRef(onTranscript);
    const onFinalTranscriptRef = useRef(onFinalTranscript);

    // Update refs whenever the callbacks change
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
        onFinalTranscriptRef.current = onFinalTranscript;
    }, [onTranscript, onFinalTranscript]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize recognition object
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            console.log('Speech recognition result received', event);
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            console.log('Transcripts:', { interim: interimTranscript, final: finalTranscript });

            if (interimTranscript && onTranscriptRef.current) {
                onTranscriptRef.current(interimTranscript);
            }

            if (finalTranscript && onFinalTranscriptRef.current) {
                onFinalTranscriptRef.current(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error event', event);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []); // Run once on mount

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setError(null);
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error('Failed to start speech recognition', err);
                setError('Failed to start speech recognition');
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
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
        isSupported: typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    };
}
