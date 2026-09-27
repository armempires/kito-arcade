import React, { useState, useMemo, useEffect } from 'react';
import { FileText, CheckCircle, Printer, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useClientContract } from '../../hooks/useClientContract';
import { supabase } from '../../lib/supabase';
import type { ClientItem, ClientPayment } from '../../types/crm';

interface CardContratoProps {
  profile: ClientItem;
  payments: ClientPayment[];
  onContractAccepted: () => void;
}

export const CardContrato: React.FC<CardContratoProps> = ({ profile, payments, onContractAccepted }) => {
  const { generatePreview, acceptContract, isLoading } = useClientContract();
  const [showPreview, setShowPreview] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const isAccepted = Boolean(profile.contract_accepted);

  // Garante que se o contrato já estiver assinado, o HTML renderizado mostre os dados de assinatura
  const displayHTML = useMemo(() => {
    if (isAccepted) {
      // Se não tem snapshot salvo ou se o snapshot anterior foi salvo com "AGUARDANDO ASSINATURA"
      if (!profile.contract_text || profile.contract_text.includes('AGUARDANDO ASSINATURA DIGITAL')) {
        return generatePreview({ ...profile, contract_accepted: true }, payments);
      }
      return profile.contract_text;
    }
    return generatePreview(profile, payments);
  }, [isAccepted, profile, payments, generatePreview]);

  // Se o contrato estiver assinado mas o snapshot no banco ainda estava com o texto antigo, sincroniza silenciosamente
  useEffect(() => {
    if (isAccepted && (!profile.contract_text || profile.contract_text.includes('AGUARDANDO ASSINATURA DIGITAL'))) {
      const fixedHTML = generatePreview({ ...profile, contract_accepted: true }, payments);
      let query = supabase.from('clients').update({ contract_text: fixedHTML });
      if (profile.portal_user_id) {
        query = query.eq('portal_user_id', profile.portal_user_id);
      } else if (profile.id) {
        query = query.eq('id', profile.id);
      }
      query.then(() => {});
    }
  }, [isAccepted, profile, payments, generatePreview]);

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html><html><head>
        <title>Contrato — ${profile.name}</title>
        <meta charset="utf-8"/>
        <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}</style>
      </head><body>
        ${displayHTML}
      </body></html>`);
    printWin.document.close();
    printWin.print();
  };

  const handleAccept = async () => {
    setError('');
    if (!agreed) { setError('Marque o checkbox para aceitar o contrato.'); return; }
    const ok = await acceptContract(profile, payments);
    if (ok) onContractAccepted();
    else setError('Erro ao registrar aceite. Tente novamente.');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C8FF00]" />
          <h3 className="font-semibold text-white">Contrato Digital</h3>
        </div>
        {isAccepted && (
          <span className="flex items-center gap-1 text-xs text-[#C8FF00] bg-[#C8FF00]/10 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Assinado em {profile.contract_accepted_at
              ? new Date(profile.contract_accepted_at).toLocaleDateString('pt-BR')
              : '—'}
          </span>
        )}
      </div>

      {/* Preview toggle */}
      <button
        onClick={() => setShowPreview(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 hover:text-white text-sm transition-all"
      >
        {showPreview ? <><EyeOff className="w-4 h-4" /> Ocultar Contrato</> : <><Eye className="w-4 h-4" /> Ver Contrato</>}
      </button>

      {/* Contrato renderizado */}
      {showPreview && (
        <div
          className="bg-white text-black rounded-xl p-6 mb-4 max-h-[400px] overflow-y-auto text-sm"
          dangerouslySetInnerHTML={{ __html: displayHTML }}
        />
      )}

      {/* Ações */}
      <div className="space-y-3">
        {!isAccepted && (
          <>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#C8FF00] cursor-pointer"
              />
              <span className="text-sm text-white/60">
                Li e concordo com todos os termos e condições do contrato de prestação de serviços.
              </span>
            </label>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handleAccept}
              disabled={isLoading || !agreed}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Assinando...</> : <><CheckCircle className="w-4 h-4" /> Assinar Contrato</>}
            </button>
          </>
        )}

        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 hover:text-white text-sm transition-all"
        >
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </button>
      </div>
    </div>
  );
};
