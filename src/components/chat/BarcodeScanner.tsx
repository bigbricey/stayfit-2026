'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Search } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E
                ]
            },
            /* verbose= */ false
        );

        const onScanSuccess = (decodedText: string) => {
            console.log(`Code matched = ${decodedText}`);
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            setIsScanning(false);
            onScan(decodedText);
        };

        const onScanFailure = (error: any) => {
            // Usually we ignore failures during continuous scanning
            // console.warn(`Code scan error = ${error}`);
        };

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner on unmount", error));
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a1d24] w-full max-w-md rounded-2xl border border-[#2a2d34] overflow-hidden shadow-2xl">
                <div className="p-4 flex items-center justify-between border-b border-[#2a2d34]">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Search size={18} className="text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-white">UPC Barcode Scanner</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#2a2d34] rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="aspect-square bg-black relative">
                    <div id="reader" className="w-full h-full"></div>
                    {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                            <div className="text-center p-6">
                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-sm font-medium">Looking up product...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 text-center space-y-2">
                    <p className="text-sm text-gray-400">
                        Point your camera at the barcode on the product packaging.
                    </p>
                    <p className="text-[11px] text-gray-600">
                        Supports EAN, UPC, and common retail barcodes.
                    </p>
                </div>
            </div>
        </div>
    );
}
