import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Shield, Cookie, CreditCard, FileX, 
  HelpCircle, ChevronDown, CheckCircle2, Building2
} from 'lucide-react';
import { LEGAL_DOCUMENTS, FAQ_DATA, COMPANY_INFO } from '../data/legalData';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string; // 'termos-de-uso' | 'privacidade' | 'cookies' | 'reembolso' | 'exclusao-dados' | 'faq'
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'termos-de-uso'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_DATA[0]?.id || null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDoc = LEGAL_DOCUMENTS.find(doc => doc.id === activeTab);
  const isFaq = activeTab === 'faq';

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'termos-de-uso': return <FileText className="w-4 h-4 shrink-0" />;
      case 'privacidade': return <Shield className="w-4 h-4 shrink-0" />;
      case 'cookies': return <Cookie className="w-4 h-4 shrink-0" />;
      case 'reembolso': return <CreditCard className="w-4 h-4 shrink-0" />;
      case 'exclusao-dados': return <FileX className="w-4 h-4 shrink-0" />;
      case 'faq': return <HelpCircle className="w-4 h-4 shrink-0" />;
      default: return <FileText className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-5xl h-[88vh] bg-[#0E0E10] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-['Montserrat']"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#141416] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Anton'] text-lg sm:text-xl tracking-wider uppercase text-white">
                  {COMPANY_INFO.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C8FF00] text-black uppercase">
                  LEGAL & AJUDA
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                CNPJ: {COMPANY_INFO.cnpj}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Tab Navigator + Right Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Navigation Bar */}
          <aside className="w-full md:w-72 bg-[#111113] border-b md:border-b-0 md:border-r border-white/10 p-3 sm:p-4 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8FF00] px-3 py-1 hidden md:block">
              DOCUMENTOS & AJUDA
            </span>

            {LEGAL_DOCUMENTS.map((doc) => {
              const isActive = activeTab === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveTab(doc.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                    {getTabIcon(doc.id)}
                  </span>
                  <span className="truncate">{doc.title}</span>
                </button>
              );
            })}

            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                isFaq
                  ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                {getTabIcon('faq')}
              </span>
              <span className="truncate">Perguntas Frequentes (FAQ)</span>
            </button>
          </aside>

          {/* Right Main Content Panel */}
          <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
            {isFaq ? (
              /* FAQ Section */
              <div className="space-y-6 max-w-3xl">
                <div>
                  <span className="text-xs font-mono font-bold text-[#C8FF00] uppercase tracking-widest block mb-1">
                    CENTRAL DE RESPOSTAS // KITO EXPERT
                  </span>
                  <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                    Perguntas Frequentes (FAQ)
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                    Tire suas dúvidas sobre prazos, formas de pagamento, propriedade de código e suporte.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {FAQ_DATA.map((item) => {
                    const isOpen = openFaqId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all ${
                          isOpen
                            ? 'bg-[#151518] border-[#C8FF00]/50 shadow-[0_0_20px_rgba(200,255,0,0.1)]'
                            : 'bg-[#111113] border-white/8 hover:border-white/15'
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                        >
                          <span className="font-bold text-xs sm:text-sm text-white leading-snug">
                            {item.question}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#C8FF00] shrink-0 transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 animate-fade-in">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : currentDoc ? (
              /* Legal Policy Document */
              <div className="space-y-8 max-w-3xl">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#C8FF00] uppercase tracking-widest">
                      DOCUMENTO OFICIAL
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Vigência: {currentDoc.lastUpdated}
                    </span>
                  </div>
                  <h2 className="font-['Anton'] text-2xl sm:text-4xl uppercase tracking-wider text-white">
                    {currentDoc.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {COMPANY_INFO.legalName} • CNPJ {COMPANY_INFO.cnpj}
                  </p>
                </div>

                <div className="space-y-6">
                  {currentDoc.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-2">
                      <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#C8FF00] shrink-0" />
                        <span>{sec.heading}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-6">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </main>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-[#111113] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2 shrink-0">
          <span>
            {COMPANY_INFO.name} • {COMPANY_INFO.tagline} • CNPJ: {COMPANY_INFO.cnpj}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
