import React from 'react';
import { Globe, Server, FileText } from 'lucide-react';
import type { ClientItem } from '../../types/crm';

interface CardObservacoesProps {
  profile: ClientItem;
}

export const CardObservacoes: React.FC<CardObservacoesProps> = ({ profile }) => {
  const hasContent =
    profile.contracted_domain ||
    profile.contracted_hosting ||
    profile.admin_notes ||
    profile.contracted_extras;

  if (!hasContent) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-[#C8FF00]" />
        <h3 className="font-semibold text-white">Informações da Contratação</h3>
      </div>

      <div className="space-y-3">
        {profile.contracted_domain && (
          <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl">
            <Globe className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/40 mb-0.5">Domínio</p>
              <p className="text-sm text-white font-medium">{profile.contracted_domain}</p>
            </div>
          </div>
        )}

        {profile.contracted_hosting && (
          <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl">
            <Server className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/40 mb-0.5">Hospedagem</p>
              <p className="text-sm text-white font-medium">{profile.contracted_hosting}</p>
            </div>
          </div>
        )}

        {(profile.admin_notes || profile.contracted_extras) && (
          <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl">
            <FileText className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/40 mb-0.5">Observações</p>
              <p className="text-sm text-white whitespace-pre-line">
                {[profile.admin_notes, profile.contracted_extras].filter(Boolean).join('\n\n')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
