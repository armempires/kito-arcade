import React, { useState } from 'react';
import { Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { getClientSteps } from '../../data/esteirasData';
import type { ClientItem } from '../../types/crm';

interface CardEsteiraProps {
  profile: ClientItem;
}

const tagColors: Record<string, string> = {
  'Desenvolvimento': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Homologação': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Infraestrutura': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Multiplataforma': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Otimização': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Design de Lojas': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'ASO & Copy': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Publicação': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Garantia': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Financeiro': 'bg-[#C8FF00]/20 text-[#C8FF00] border-[#C8FF00]/30',
  'Contrato & Dev': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Domínio': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Infra Web': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Presença Digital': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Automação I.A': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Conteúdo': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Agendamento': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Suporte & Métricas': 'bg-green-500/20 text-green-300 border-green-500/30',
};

export const CardEsteira: React.FC<CardEsteiraProps> = ({ profile }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const steps = getClientSteps(profile);
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (!profile.contracted_service_name && totalSteps === 0) {
    return (
      <div className="bg-[#141418] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-white/30" />
          <h3 className="font-semibold text-white/50">Etapas do Projeto</h3>
        </div>
        <p className="text-white/30 text-sm">Aguardando configuração pela equipe Kito.</p>
      </div>
    );
  }

  const displayedSteps = steps.filter(s => {
    if (filter === 'completed') return s.completed;
    if (filter === 'pending') return !s.completed;
    return true;
  });

  return (
    <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#C8FF00]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">Etapas da Entrega</h3>
              <p className="text-[#C8FF00] font-medium text-xs mt-0.5">
                {profile.contracted_service_name || 'Projeto em Desenvolvimento'}
              </p>
            </div>
          </div>
        </div>

        {/* Status badges & filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#C8FF00] text-black shadow-[0_0_12px_rgba(200,255,0,0.3)]'
                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            Todas ({totalSteps})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#C8FF00] text-black shadow-[0_0_12px_rgba(200,255,0,0.3)]'
                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            Concluídas ({completedSteps})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#C8FF00] text-black shadow-[0_0_12px_rgba(200,255,0,0.3)]'
                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            Pendentes ({totalSteps - completedSteps})
          </button>
        </div>
      </div>

      {/* Progress bar info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C8FF00]" />
            Progresso Geral
          </span>
          <span className="font-mono font-bold text-[#C8FF00]">
            {completedSteps} de {totalSteps} etapas concluídas ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-black/60 border border-white/10 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-[#C8FF00] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(200,255,0,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid de Cards Quadrados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSteps.map((step, idx) => {
          const isDone = Boolean(step.completed);

          return (
            <div
              key={step.step || idx}
              className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 min-h-[190px] relative overflow-hidden group ${
                isDone
                  ? 'border-[#C8FF00]/40 bg-gradient-to-br from-[#C8FF00]/10 via-[#18181f] to-[#121216] shadow-[0_0_20px_rgba(200,255,0,0.06)] hover:border-[#C8FF00]/70'
                  : 'border-white/10 bg-[#16161b] hover:border-white/20 hover:bg-[#1a1a20]'
              }`}
            >
              {/* Top row: Tag & Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColors[step.tag] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
                  {step.tag}
                </span>

                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8FF00] text-black text-[11px] font-bold shadow-[0_0_10px_rgba(200,255,0,0.35)]">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    Concluído
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[11px] font-medium">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    Pendente
                  </span>
                )}
              </div>

              {/* Middle: Title & Description */}
              <div className="space-y-1.5 my-auto">
                <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${isDone ? 'text-white' : 'text-zinc-200'}`}>
                  {step.title}
                </h4>
                <p className={`text-xs leading-relaxed line-clamp-3 ${isDone ? 'text-zinc-300/80' : 'text-zinc-400'}`}>
                  {step.description}
                </p>
              </div>

              {/* Bottom: Step Identifier */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                <span>Etapa #{step.step || idx + 1}</span>
                {isDone && (
                  <span className="text-[#C8FF00] font-bold flex items-center gap-1">
                    ✓ Entregue
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
