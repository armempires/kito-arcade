import React from 'react';
import { 
  Instagram, Calendar, ShieldCheck, Lock, 
  ExternalLink, ChevronRight, Building2, Sparkles, UserCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY_INFO, LEGAL_DOCUMENTS } from '../data/legalData';

interface FooterProps {
  onOpenLegal: (tabId: string) => void;
  onNavigateCategory: (slug: string) => void;
  onOpenAgenda: () => void;
  onOpenAdminCRM?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onNavigateCategory,
  onOpenAgenda,
  onOpenAdminCRM
}) => {
  return (
    <footer className="bg-[#09090B] border-t border-white/10 text-white font-['Montserrat'] mt-20 pt-16 pb-10">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-white/8">
          
          {/* Coluna 1: Identidade & Ações Rápidas */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-['Anton'] text-2xl sm:text-3xl tracking-wider uppercase text-white">
                  KITO<span className="text-[#C8FF00]">EXPERT</span>
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#C8FF00] text-black">
                  OFICIAL
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-300 tracking-wide">
                Site, App, Marketing e Automação
              </p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Desenvolvimento de soluções digitais de alta conversão e automação inteligente para empresas e profissionais.
              </p>
            </div>

            {/* Dois Ícones Premium */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* 1. Instagram Premium Button */}
              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#141416] hover:bg-[#1a1a1d] border border-white/10 hover:border-pink-500/50 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Acessar Instagram @kito.expert"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-zinc-400 font-medium leading-none">Instagram</span>
                  <span className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                    kito.expert
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-pink-400 ml-0.5" />
              </a>

              {/* 2. Agenda Premium Button */}
              <button
                onClick={onOpenAgenda}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#141416] hover:bg-[#1a1a1d] border border-white/10 hover:border-[#C8FF00]/50 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Agendar Contato Direto"
              >
                <div className="w-7 h-7 rounded-lg bg-[#C8FF00]/15 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] shadow-md">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-zinc-400 font-medium leading-none">Atendimento</span>
                  <span className="text-xs font-bold text-white group-hover:text-[#C8FF00] transition-colors">
                    Agendar Contato
                  </span>
                </div>
                <Sparkles className="w-3 h-3 text-[#C8FF00] ml-0.5" />
              </button>
            </div>
          </div>

          {/* Coluna 2: Menu de Navegação */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00] block">
              Menu de Navegação
            </span>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <button
                  onClick={() => onNavigateCategory('all')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Todos os Projetos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('servicos')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Criação de Sites e Apps</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('mobile')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Aplicativos Mobile (Android & iOS)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('marketing')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Gestão de Redes Sociais & Automação</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('saas')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Sistemas & Plataformas Web</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('jogos')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Jogos & Experiências 3D</span>
                </button>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span className="group-hover:text-[#C8FF00] font-bold">Blog & Artigos</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30 ml-1">
                    NOVO
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Políticas Legais & FAQ */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00] block">
              Políticas & Central de Ajuda
            </span>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              {LEGAL_DOCUMENTS.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => onOpenLegal(doc.id)}
                    className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                    <span>{doc.title}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onOpenLegal('faq')}
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer text-left font-bold text-zinc-200"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Perguntas Frequentes (FAQ)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Empresa & Dados Fiscais */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C8FF00] block">
              Empresa
            </span>
            
            <div className="p-4 rounded-2xl bg-[#121214] border border-white/8 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C8FF00]" />
                <span className="font-bold text-sm text-white">
                  {COMPANY_INFO.name}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                  Cadastro Nacional (CNPJ)
                </span>
                <span className="font-mono text-xs font-bold text-zinc-200 bg-black/60 px-2.5 py-1 rounded-lg border border-white/5 inline-block">
                  {COMPANY_INFO.cnpj}
                </span>
              </div>

              <div className="pt-2 border-t border-white/8 space-y-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Conformidade com a LGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Segurança SSL & Gateway Seguro</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Atendimento especializado para clientes e empresas no mundo inteiro.
            </p>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4 text-center sm:text-left">
          <span>
            © {COMPANY_INFO.year} {COMPANY_INFO.name}. Todos os direitos reservados. CNPJ: {COMPANY_INFO.cnpj}
          </span>
          <div className="flex items-center gap-4">
            <Link
              to="/portal"
              className="flex items-center gap-1.5 text-zinc-500 hover:text-[#C8FF00] transition-colors cursor-pointer text-xs font-mono"
              title="Acesso à Área do Cliente"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>Área do Cliente</span>
            </Link>
            {onOpenAdminCRM && (
              <button
                onClick={onOpenAdminCRM}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-[#C8FF00] transition-colors cursor-pointer text-xs font-mono"
                title="Acesso Administrativo ao CRM de Agendamentos"
              >
                <Lock className="w-3.5 h-3.5 text-[#C8FF00]" />
                <span>Área Restrita (CRM)</span>
              </button>
            )}
            <span className="text-[11px] text-zinc-600">
              {COMPANY_INFO.tagline} • Plataforma Oficial
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
