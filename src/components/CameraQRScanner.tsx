import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, Dice5, Upload } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface CameraQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const CameraQRScanner: React.FC<CameraQRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'reader-container-live';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setScannerError(null);
    setIsStarting(true);

    const startScanner = async () => {
      try {
        const qrCode = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = qrCode;

        await qrCode.start(
          { facingMode: 'environment' }, // Rear camera on mobile
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              // Successfully decoded QR code!
              try {
                if (navigator.vibrate) navigator.vibrate(80);
              } catch (e) {
                // ignore
              }
              onScanSuccess(decodedText);
              stopScanner();
            }
          },
          (_errorMessage) => {
            // Frame parsing, ignore continuous scan misses
          }
        );

        if (isMounted) {
          setIsStarting(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Camera scanner start error:', err);
          setScannerError(
            err?.message ||
              'No se pudo acceder a la cámara. Asegurate de dar permisos de cámara o utilizá la simulación directa.'
          );
          setIsStarting(false);
        }
      }
    };

    // Small delay to ensure DOM element is ready
    const timer = setTimeout(startScanner, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const result = await html5QrCodeRef.current.scanFile(file, true);
      onScanSuccess(result);
    } catch (err: any) {
      setScannerError('No se detectó un código QR válido en la imagen seleccionada.');
    }
  };

  // Lock background scroll when camera scanner is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overscroll-contain">
      <div className="relative w-full max-w-sm bg-stone-900 rounded-[28px] overflow-hidden text-white shadow-2xl border border-stone-800">
        {/* Header */}
        <div className="p-4 bg-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-amber-300">
              Escanear Casilla de Tablero
            </span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="p-4 space-y-3">
          <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-stone-700">
            {/* Live Camera element */}
            <div id={scannerContainerId} className="w-full h-full" />

            {/* Target reticle */}
            {!scannerError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-amber-400/80 rounded-2xl relative animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-300" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-300" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-300" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-300" />
                </div>
              </div>
            )}

            {isStarting && !scannerError && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-xs text-stone-300 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span>Iniciando cámara...</span>
              </div>
            )}

            {scannerError && (
              <div className="absolute inset-0 bg-stone-900/95 p-4 flex flex-col items-center justify-center text-center space-y-2 text-xs">
                <AlertCircle className="w-8 h-8 text-rose-400" />
                <p className="text-stone-300 max-w-xs">{scannerError}</p>
                <div className="pt-2 flex flex-col gap-2 w-full">
                  <button
                    onClick={() => {
                      onScanSuccess('manual_trigger');
                      onClose();
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold rounded-xl text-xs transition"
                  >
                    Tirar Casilla Directamente
                  </button>
                  <label className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-stone-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir imagen con QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-center text-stone-400 leading-snug">
            Apuntá la cámara al código QR de la casilla física del juego de mesa.
          </p>

          <button
            onClick={() => {
              onScanSuccess('manual_trigger');
              onClose();
            }}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Dice5 className="w-4 h-4" />
            <span>Simular Tirada de Casilla (Sin Cámara)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
