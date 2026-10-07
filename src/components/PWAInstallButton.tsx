import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Lock background scroll when iOS guide modal is open
  useBodyScrollLock(showIOSGuide);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-[#4A5A2E] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#3B4824] transition active:scale-95 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Instalar App PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#2B2D26] hover:bg-stone-50 transition shadow-xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#4A5A2E]" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overscroll-contain">
            <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl border border-stone-200 text-[#2B2D26]">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold">Instalar en tu iPhone o iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar guía de instalación"
                  className="p-1 rounded-full text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-stone-600">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#E2E7D5] text-[#4A5A2E] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Tocá el botón <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 inline text-blue-600 mx-1" /> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#E2E7D5] text-[#4A5A2E] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Deslizá y elegí <strong className="inline-flex items-center gap-1">Agregar a inicio <PlusSquare className="w-3.5 h-3.5 inline" /></strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#E2E7D5] text-[#4A5A2E] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    ¡Listo! Podrás abrir la app a pantalla completa sin barras de navegador.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#2B2D26] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-black transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
