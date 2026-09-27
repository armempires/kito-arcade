import React, { useState } from 'react';
import { LogOut, Loader2, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useClientAuth } from '../hooks/useClientAuth';
import { useClientPayments } from '../hooks/useClientPayments';
import { CardPerfil } from './portal/CardPerfil';
import { CardEsteira } from './portal/CardEsteira';
import { CardObservacoes } from './portal/CardObservacoes';
import { CardContrato } from './portal/CardContrato';
import { CardPagamentos } from './portal/CardPagamentos';
import { ClientLoginModal } from './ClientLoginModal';
import { DynamicAdBanner } from './ads/DynamicAdBanner';

export const ClientPortal: React.FC = () => {
  const { clientUser, clientProfile, isProfileComplete, isLoading, signOut, updateProfile, refreshProfile } = useClientAuth();
  const { payments } = useClientPayments(clientProfile?.id);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E0E11] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
      </div>
    );
  }

  // Não autenticado → tela de login
  if (!clientUser) {
    return <ClientLoginModal onLoginSuccess={() => setHasLoggedIn(true)} />;
  }

  // Autenticado mas sem perfil vinculado (conta sem cliente no CRM)
  if (!clientProfile) {
    return (
      <div className="min-h-screen bg-[#0E0E11] flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">Perfil não encontrado</h2>
          <p className="text-white/50 text-sm mb-6">
            Sua conta ainda não foi vinculada a um perfil de cliente. Entre em contato com a equipe Kito.
          </p>
          <button
            onClick={signOut}
            className="px-6 py-2.5 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 text-sm transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const blockedByProfile = !isProfileComplete;

  return (
    <div className="min-h-screen bg-[#0E0E11]">
      {/* Glow de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C8FF00]/4 rounded-full blur-[120px]" />
      </div>

      {/* Header — Estética Oficial Kito Arcade */}
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md text-white border-b border-white/10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Logo Kito Arcade Oficial + Botão Voltar ao Arcade */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#C8FF00] hover:text-black border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm shrink-0"
              title="Voltar à página inicial do Kito Arcade"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voltar ao Arcade</span>
            </a>

            <div className="h-5 w-px bg-white/10 hidden sm:block shrink-0"></div>

            <a href="/" className="flex items-center gap-3 group">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Anton'] text-2xl tracking-wider text-white uppercase group-hover:text-white transition-colors">
                    KITO<span className="text-[#C8FF00]">ARCADE</span>
                  </span>
                  <span className="bg-[#C8FF00] text-black text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase shadow-[0_0_10px_rgba(200,255,0,0.3)]">
                    ECOSSISTEMA
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#A0A0A0] tracking-wider uppercase hidden sm:inline">
                  Site, App, Marketing e Automação
                </span>
              </div>
            </a>
          </div>

          {/* Right: Identificação e Ações com Estética Kito Arcade */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] text-[#A0A0A0] text-xs font-bold border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
              <span>Portal do <strong className="text-white">Cliente</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
              <span className="text-zinc-400 hidden xs:inline">Olá,</span>
              <strong className="text-white font-bold">{clientProfile.name.split(' ')[0]}</strong>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-white/10 hover:border-red-500/40 text-[#A0A0A0] hover:text-red-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Alerta de perfil incompleto */}
        {blockedByProfile && (
          <div className="flex items-start gap-3 p-4 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-2xl mb-6">
            <AlertCircle className="w-5 h-5 text-[#C8FF00] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">Complete seu perfil para desbloquear todas as funcionalidades</p>
              <p className="text-white/50 text-xs mt-0.5">
                Preencha CPF/CNPJ, data de nascimento e endereço no card abaixo.
              </p>
            </div>
          </div>
        )}

        {/* Grid de cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1 — Perfil (sempre visível, sem bloqueio) */}
          <div className="lg:col-span-2">
            <CardPerfil
              profile={clientProfile}
              onSave={async (data) => {
                const ok = await updateProfile(data);
                if (ok) await refreshProfile();
                return ok;
              }}
            />
          </div>

          {/* Cards bloqueados até completar perfil */}
          {blockedByProfile ? (
            <>
              {[
                { label: 'Esteira de Entrega', icon: '📦' },
                { label: 'Informações da Contratação', icon: '📋' },
                { label: 'Contrato Digital', icon: '📄' },
                { label: 'Pagamentos', icon: '💳' },
              ].map(item => (
                <div key={item.label} className="bg-white/3 border border-white/5 rounded-2xl p-6 flex items-center gap-3 opacity-40">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-white/50 text-sm font-medium">{item.label}</p>
                    <p className="text-white/25 text-xs">Complete seu perfil primeiro</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Card 2 — Esteira */}
              <div className="lg:col-span-2">
                <CardEsteira profile={clientProfile} />
              </div>

              {/* Card 3 — Observações (só renderiza se tiver conteúdo) */}
              <div className="lg:col-span-2">
                <CardObservacoes profile={clientProfile} />
              </div>

              {/* Card 4 — Contrato */}
              <CardContrato
                profile={clientProfile}
                payments={payments}
                onContractAccepted={refreshProfile}
              />

              {/* Card 5 — Pagamentos */}
              <CardPagamentos profile={clientProfile} />
            </>
          )}
        </div>

        {/* Banner de Anúncio Dinâmico no Portal */}
        <div className="mt-10">
          <DynamicAdBanner format="horizontal" />
        </div>
      </main>
    </div>
  );
};
