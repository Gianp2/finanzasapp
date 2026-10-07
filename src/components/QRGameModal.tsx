import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  X,
  Dice5,
  QrCode,
  Copy,
  Check,
  Camera,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Printer,
} from 'lucide-react';
import QRCode from 'qrcode';
import { CameraQRScanner } from './CameraQRScanner';

interface QRGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchRandomChallenge: () => void;
}

export const QRGameModal: React.FC<QRGameModalProps> = ({
  isOpen,
  onClose,
  onLaunchRandomChallenge,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr_tablero' | 'escanear'>('qr_tablero');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Compute public scannable URL
  // If running on localhost or iframe without public host, use the public cloud run deployment URL
  const publicBaseUrl = 'https://ais-pre-vdovp7jii4ysw7kjbx3ewh-420080709503.us-east5.run.app';

  const currentUrl = typeof window !== 'undefined'
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `${publicBaseUrl}/?qr=1`
      : `${window.location.origin}${window.location.pathname}?qr=1`
    : `${publicBaseUrl}/?qr=1`;

  // Generate SVG/PNG Data URL locally with qrcode package
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#2B2D26',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.warn('Local QRCode generation error:', err);
        });
    }
  }, [isOpen, currentUrl]);

  // Lock background scroll when modal is open
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePlayNow = () => {
    onClose();
    onLaunchRandomChallenge();
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative z-10 w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden border border-stone-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#2B2D26] via-[#3B4824] to-[#4A5A2E] p-5 sm:p-6 text-white relative">
            <button
              onClick={onClose}
              aria-label="Cerrar modal QR"
              className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-900 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Dice5 className="w-3.5 h-3.5" />
              <span>Casilla del Juego de Mesa</span>
            </div>

            <h2 className="text-xl font-black tracking-tight">
              Código QR del Tablero
            </h2>
            <p className="text-white/80 text-xs mt-1 leading-relaxed">
              Integrá tu juego de mesa físico con Ciudad Financiera. Al escanearlo, se abre automáticamente un desafío aleatorio sin repetir.
            </p>

            {/* Mode switcher tabs */}
            <div className="flex bg-black/25 p-1 rounded-xl mt-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('qr_tablero')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'qr_tablero' ? 'bg-white text-stone-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR para el Tablero</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(true)}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 text-white/90 hover:text-white`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Escanear con Cámara</span>
              </button>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-5 sm:p-6 text-center space-y-4">
            <div className="relative inline-block mx-auto bg-stone-50 p-4 rounded-3xl border-2 border-stone-200 shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Código QR de la Casilla de Ciudad Financiera"
                  className="w-48 h-48 rounded-xl mx-auto shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 rounded-xl mx-auto flex items-center justify-center bg-stone-100 text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#4A5A2E]" />
                </div>
              )}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#4A5A2E] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase shadow">
                Escanear con cualquier celular
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#EEEDE4]/80 rounded-2xl p-3.5 text-left space-y-1.5 text-xs text-stone-700">
              <p className="font-extrabold text-[#2B2D26] flex items-center gap-1.5">
                <Dice5 className="w-3.5 h-3.5 text-[#4A5A2E]" />
                <span>¿Cómo funciona en la partida?</span>
              </p>
              <ol className="space-y-1 list-decimal list-inside text-[11px] text-stone-600 leading-snug">
                <li>El jugador cae en la <strong>Casilla de Desafío</strong> del tablero.</li>
                <li>Escanea este código QR con la cámara de su teléfono.</li>
                <li>Se abre directamente la situación sin necesidad de registrarse.</li>
                <li>Elige su decisión y ve las consecuencias de inmediato.</li>
              </ol>
            </div>

            {/* Public Link Bar */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold px-1">
                <span>Enlace directo del QR:</span>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4A5A2E] hover:underline flex items-center gap-0.5"
                >
                  <span>Probar enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-xl border border-stone-200">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="text-[11px] text-stone-600 bg-transparent flex-1 px-1.5 outline-none select-all truncate font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 px-3 bg-white text-stone-700 hover:text-black font-bold text-xs rounded-lg border border-stone-300 flex items-center gap-1 cursor-pointer transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Direct Play & Camera Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePlayNow}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Dice5 className="w-5 h-5 text-stone-900" />
                <span>Simular Caída en Casilla / Sacar Desafío Ahora</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(true)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-stone-600" />
                <span>Abrir Escáner de Cámara para Leer Casilla Física</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Camera Live Scanner Sub-modal */}
      <CameraQRScanner
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(_text) => {
          setIsCameraScannerOpen(false);
          onClose();
          onLaunchRandomChallenge();
        }}
      />
    </AnimatePresence>
  );
};
