import React, { useEffect } from 'react';
import { X, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import { ProjectItem } from '../data/gamesData';

interface AgendaPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProject?: ProjectItem | null;
}

export const AgendaPopupModal: React.FC<AgendaPopupModalProps> = ({
  isOpen,
  onClose,
  serviceProject
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-3xl bg-[#0D0D0E] border border-[#C8FF00]/40 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header of Popup */}
        <div className="px-5 py-3.5 bg-[#121214] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#C8FF00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Anton'] text-lg uppercase tracking-wide text-white">
                  AGENDA KITO <span className="text-[#C8FF00]">//</span> AGENDAMENTO ONLINE
                </span>
                <span className="hidden sm:inline text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#C8FF00] text-black">
                  POPUP
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-md">
                {serviceProject 
                  ? `Serviço selecionado: ${serviceProject.title}` 
                  : 'Selecione data, horário e serviço para sua sessão'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/hosted/agenda-kito/index.html"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Abrir em aba separada"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-black/60 hover:bg-[#C8FF00] hover:text-black text-white flex items-center justify-center transition-all border border-white/10"
              title="Fechar Agendamento"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Agenda Kito App inside Popup */}
        <div className="relative flex-1 w-full bg-[#0A0B0E] overflow-hidden">
          <iframe
            src={`/hosted/agenda-kito/index.html?embed=true${serviceProject ? `&service=${encodeURIComponent(serviceProject.title)}` : ''}`}
            title="Agenda Kito - Sistema de Agendamento"
            className="w-full h-full border-none bg-[#0A0B0E]"
            allow="camera; microphone; payment; clipboard-write"
          />
        </div>

        {/* Popup Footer Note */}
        <div className="px-5 py-2.5 bg-[#0A0A0B] border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
            <span>Confirmação segura com envio de comprovante e lembrete instantâneo.</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-zinc-400 hover:text-white transition-colors uppercase text-[10px] tracking-wider"
          >
            Voltar aos Serviços
          </button>
        </div>
      </div>
    </div>
  );
};
