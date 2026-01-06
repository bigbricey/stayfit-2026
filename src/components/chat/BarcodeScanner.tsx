'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Search, Camera, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                setError(null);
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    // Use the back camera if available
                    const backCamera = devices.find(device =>
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('environment')
                    ) || devices[0];

                    await html5QrCode.start(
                        backCamera.id,
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 150 },
                            aspectRatio: 1.0
                        },
                        (decodedText) => {
                            logger.debug(`Code scanned: ${decodedText}`);
                            onScan(decodedText);
                        },
                        (errorMessage) => {
                            // Suppress common noisy errors
                        }
                    );
                    setIsScanning(true);
                } else {
                    setError("No cameras found on this device.");
                }
            } catch (err) {
                logger.error("Failed to start scanner:", err);
                setError((err as Error).message || "Could not access camera. Please ensure you've granted permission.");
            }
        };

        startScanner();

        return () => {
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().then(() => {
                    html5QrCodeRef.current?.clear();
                }).catch(err => logger.error("Failed to stop scanner", err));
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a1d24] w-full max-w-md rounded-2xl border border-[#2a2d34] overflow-hidden shadow-2xl relative">
                <div className="p-4 flex items-center justify-between border-b border-[#2a2d34] bg-[#1a1d24]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Search size={18} className="text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-white">Scanner</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#2a2d34] rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="aspect-square bg-black relative flex items-center justify-center">
                    <div id="reader" className="w-full h-full"></div>

                    {!isScanning && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="text-sm">Initializing camera...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/80">
                            <AlertCircle size={48} className="text-red-500 mb-4" />
                            <p className="text-white font-medium mb-2">Camera Error</p>
                            <p className="text-sm text-gray-400 mb-6">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-[#2a2d34] text-white rounded-xl hover:bg-[#32363f] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {isScanning && (
                        <div className="absolute inset-0 border-2 border-emerald-500/20 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-emerald-500 rounded-lg opacity-50">
                                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-500"></div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-500"></div>
                                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-500"></div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-500"></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 text-center space-y-4">
                    <p className="text-sm text-gray-400">
                        Center the barcode within the frame to scan.
                    </p>
                    <div className="flex justify-center gap-2">
                        <span className="px-2 py-1 bg-[#2a2d34] rounded text-[10px] text-gray-400 uppercase tracking-wider">UPC</span>
                        <span className="px-2 py-1 bg-[#2a2d34] rounded text-[10px] text-gray-400 uppercase tracking-wider">EAN</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
