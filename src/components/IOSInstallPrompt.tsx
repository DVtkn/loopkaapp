import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';
import { isIOSDevice, isStandaloneApp, safeGetStorage, safeSetStorage } from '../utils/safeStorage';

interface IOSInstallPromptProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = ({ forceOpen = false, onClose }) => {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsIOS(isIOSDevice());
      setIsStandalone(isStandaloneApp());
      const wasDismissed = safeGetStorage('together_ios_prompt_dismissed', false);
      if (wasDismissed && !forceOpen) {
        setDismissed(true);
      }
    } catch {
      // safe fallback
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    setDismissed(true);
    safeSetStorage('together_ios_prompt_dismissed', true);
    if (onClose) onClose();
  };

  // If forceOpen is active, or user is on iOS and not standalone and hasn't dismissed yet
  const isVisible = forceOpen || (isIOS && !isStandalone && !dismissed);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bottom Notification Banner for iPhone Safari */}
      <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 text-white p-4 rounded-xl shadow-xl border border-indigo-500/30 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>Добавьте на экран «Домой»</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono border border-indigo-500/30">
                    iOS Web App
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Работает на весь экран без адресной строки Safari
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Step Instruction */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-700">
                1
              </span>
              <span>
                Нажмите кнопку <strong className="text-white">«Поделиться»</strong> внизу экрана Safari{' '}
                <Share className="w-3.5 h-3.5 inline-block text-indigo-400 -mt-0.5 ml-0.5" />
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-700">
                2
              </span>
              <span>
                Выберите <strong className="text-white">«На экран „Домой“»</strong>{' '}
                <PlusSquare className="w-3.5 h-3.5 inline-block text-indigo-400 -mt-0.5 ml-0.5" />
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-700">
                3
              </span>
              <span>
                Нажмите <strong className="text-indigo-300">«Добавить»</strong> в верхнем правом углу
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Быстрый доступ с иконки iPhone</span>
            </div>

            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
