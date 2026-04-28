import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup error:", err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[40px] bg-white dark:bg-slate-900 p-8 shadow-2xl border border-white/20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Optical Scan</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Align QR Code within the perimeter</p>
        </div>
        <div id="reader" className="w-full overflow-hidden rounded-3xl border-none"></div>
        <button
          onClick={onClose}
          className="mt-8 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 hover:bg-red-600 hover:text-white uppercase tracking-[0.3em] transition-all transform active:scale-95"
        >
          Abort Protocol
        </button>
      </div>
    </div>
  );
}
