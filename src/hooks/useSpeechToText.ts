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

    const explicitlyStopped = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize recognition object
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();

        // Mobile browsers often handle continuous: true poorly
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        recognition.continuous = !isMobile;
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
            if (event.error !== 'no-speech') {
                setError(event.error);
                setIsListening(false);
            }
        };

        recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            // If it ended but we didn't explicitly stop it (like a mobile timeout)
            // and we are on mobile, we might want to restart
            if (isMobile && !explicitlyStopped.current) {
                console.log('Restarting recognition for mobile stability...');
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Failed to restart recognition', e);
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
        };

        // Extra events for debugging mobile
        recognition.onaudiostart = () => console.log('Audio capture started');
        recognition.onsoundstart = () => console.log('Sound detected');
        recognition.onspeechstart = () => console.log('Speech detected');
        recognition.onspeechend = () => console.log('Speech ended');
        recognition.onnomatch = () => console.log('No match found');

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
                console.error('Failed to start speech recognition', err);
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
        isSupported: typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    };
}
