import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Copy, Check, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ClientItem, ClientPayment } from '../../types/crm';
import { useClientPayments } from '../../hooks/useClientPayments';

interface CardPagamentosProps {
  profile: ClientItem;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  paid: { label: 'Pago', color: 'bg-green-500/20 text-[#C8FF00] border-green-500/30' },
  overdue: { label: 'Em Atraso', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  anticipated: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
};

interface PixModalProps {
  payment: ClientPayment;
  qrCode: string;
  copyPaste: string;
  onClose: () => void;
}

const PixModal: React.FC<PixModalProps> = ({ payment, qrCode, copyPaste, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isPaid = payment.status === 'paid';

  useEffect(() => {
    if (isPaid) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isPaid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#0E0E11] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
        {isPaid ? (
          <div className="py-4 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#C8FF00]/20 border border-[#C8FF00]/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(200,255,0,0.35)]">
              <CheckCircle2 className="w-10 h-10 text-[#C8FF00] stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-white font-['Anton'] text-xl uppercase tracking-wider">
                Pagamento Confirmado!
              </h4>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                A Parcela #{payment.installment_number} no valor de{' '}
                <strong className="text-[#C8FF00]">R$ {payment.amount.toFixed(2).replace('.', ',')}</strong> foi liquidada com sucesso.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(200,255,0,0.3)] hover:bg-[#d6ff33] transition-all cursor-pointer"
            >
              Concluir
            </button>
          </div>
        ) : (
          <>
            <h4 className="text-white font-semibold text-center mb-1">Pagar via PIX</h4>
            <p className="text-white/40 text-xs text-center mb-5">
              Parcela #{payment.installment_number} — R$ {payment.amount.toFixed(2).replace('.', ',')}
            </p>

            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={`data:image/png;base64,${qrCode}`} alt="QR Code PIX" className="w-48 h-48 rounded-xl bg-white p-2" />
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={copyPaste}
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white/60 text-xs truncate font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/20 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#C8FF00]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8FF00]" />
              <span>Aguardando confirmação do PIX...</span>
            </div>

            <button onClick={onClose} className="w-full py-2.5 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 text-sm transition-all cursor-pointer">
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

interface CardModalProps {
  payment: ClientPayment;
  profile: ClientItem;
  onClose: () => void;
  onSubmit: (cardData: any, holderInfo: any) => Promise<boolean>;
}

const CardModal: React.FC<CardModalProps> = ({ payment, profile, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState({
    holderName: profile.name || '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  const [holderInfo, setHolderInfo] = useState({
    name: profile.name || '',
    email: profile.email || '',
    cpfCnpj: profile.cpf || profile.cnpj || '',
    postalCode: profile.cep || '',
    addressNumber: profile.numero || '1',
    phone: profile.whatsapp || profile.phone || '',
  });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card.number || !card.holderName || !card.expiryMonth || !card.expiryYear || !card.ccv) {
      alert('Preencha todos os campos do cartão.');
      return;
    }
    setSubmitting(true);
    const ok = await onSubmit(card, holderInfo);
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#0E0E11] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#C8FF00]" />
            <h4 className="text-white font-semibold">Pagar com Cartão de Crédito</h4>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-sm cursor-pointer">✕</button>
        </div>

        <p className="text-white/50 text-xs mb-4">
          Pagamento da Parcela #{payment.installment_number} no valor de <strong className="text-[#C8FF00]">R$ {payment.amount.toFixed(2).replace('.', ',')}</strong> via Asaas.
        </p>

        <form onSubmit={handlePay} className="space-y-3 text-xs">
          <div>
            <label className="block text-white/50 font-mono mb-1">Nome Impresso no Cartão *</label>
            <input
              type="text"
              required
              value={card.holderName}
              onChange={e => setCard(c => ({ ...c, holderName: e.target.value.toUpperCase() }))}
              placeholder="JOAO DA SILVA"
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C8FF00]"
            />
          </div>

          <div>
            <label className="block text-white/50 font-mono mb-1">Número do Cartão *</label>
            <input
              type="text"
              required
              maxLength={19}
              value={card.number}
              onChange={e => setCard(c => ({ ...c, number: e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ') }))}
              placeholder="0000 0000 0000 0000"
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#C8FF00]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-white/50 font-mono mb-1">Mês (MM)</label>
              <input
                type="text"
                required
                maxLength={2}
                value={card.expiryMonth}
                onChange={e => setCard(c => ({ ...c, expiryMonth: e.target.value.replace(/\D/g, '') }))}
                placeholder="12"
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-center font-mono focus:outline-none focus:border-[#C8FF00]"
              />
            </div>
            <div>
              <label className="block text-white/50 font-mono mb-1">Ano (AAAA)</label>
              <input
                type="text"
                required
                maxLength={4}
                value={card.expiryYear}
                onChange={e => setCard(c => ({ ...c, expiryYear: e.target.value.replace(/\D/g, '') }))}
                placeholder="2028"
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-center font-mono focus:outline-none focus:border-[#C8FF00]"
              />
            </div>
            <div>
              <label className="block text-white/50 font-mono mb-1">CVV</label>
              <input
                type="password"
                required
                maxLength={4}
                value={card.ccv}
                onChange={e => setCard(c => ({ ...c, ccv: e.target.value.replace(/\D/g, '') }))}
                placeholder="123"
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-center font-mono focus:outline-none focus:border-[#C8FF00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div>
              <label className="block text-white/40 font-mono text-[10px] mb-1">CPF/CNPJ do Titular</label>
              <input
                type="text"
                value={holderInfo.cpfCnpj}
                onChange={e => setHolderInfo(h => ({ ...h, cpfCnpj: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-white/40 font-mono text-[10px] mb-1">CEP de Cobrança</label>
              <input
                type="text"
                value={holderInfo.postalCode}
                onChange={e => setHolderInfo(h => ({ ...h, postalCode: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 text-xs transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.3)]"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <CreditCard className="w-3.5 h-3.5" />}
              <span>{submitting ? 'Processando...' : `Pagar R$ ${payment.amount.toFixed(2)}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CardPagamentos: React.FC<CardPagamentosProps> = ({ profile }) => {
  const { payments, isLoading, error, generatePix, payWithCard, refresh } = useClientPayments(profile.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pixModal, setPixModal] = useState<{ payment: ClientPayment; qrCode: string; copyPaste: string } | null>(null);
  const [cardModalPayment, setCardModalPayment] = useState<ClientPayment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);

  const handleGeneratePix = async (payment: ClientPayment) => {
    setActionLoading(payment.id);
    // Se já tem QR Code, usa direto
    if (payment.asaas_pix_qr_code && payment.asaas_pix_copy_paste) {
      setPixModal({ payment, qrCode: payment.asaas_pix_qr_code, copyPaste: payment.asaas_pix_copy_paste });
      setActionLoading(null);
      return;
    }
    const result = await generatePix(payment.id);
    if (result) {
      setPixModal({ payment, qrCode: result.qrCode, copyPaste: result.copyPaste });
      await refresh();
    }
    setActionLoading(null);
  };

  const handlePayCardSubmit = async (cardData: any, holderInfo: any) => {
    if (!cardModalPayment) return false;
    const res = await payWithCard(cardModalPayment.id, cardData, holderInfo);
    if (res.success) {
      alert('Pagamento aprovado com sucesso!');
      await refresh();
      return true;
    } else {
      alert(res.error || 'Falha ao processar pagamento com cartão.');
      return false;
    }
  };

  if (isLoading) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-white/40" />
    </div>
  );

  return (
    <>
      {pixModal && (() => {
        const livePayment = payments.find(p => p.id === pixModal.payment.id) || pixModal.payment;
        return (
          <PixModal
            payment={livePayment}
            qrCode={pixModal.qrCode}
            copyPaste={pixModal.copyPaste}
            onClose={() => setPixModal(null)}
          />
        );
      })()}

      {cardModalPayment && (
        <CardModal
          payment={cardModalPayment}
          profile={profile}
          onClose={() => setCardModalPayment(null)}
          onSubmit={handlePayCardSubmit}
        />
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-[#C8FF00]" />
          <h3 className="font-semibold text-white">Pagamentos</h3>
          <span className="ml-auto text-xs text-white/40 capitalize">
            {profile.contracted_service_type === 'mensalidade' ? 'Mensalidade' : 'Parcelado'}
          </span>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <p className="text-xs text-white/40 mb-0.5">Total Pago</p>
            <p className="text-[#C8FF00] font-bold">R$ {totalPaid.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <p className="text-xs text-white/40 mb-0.5">Em Aberto</p>
            <p className="text-yellow-300 font-bold">R$ {totalPending.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}

        {/* Lista de parcelas */}
        {payments.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">Nenhuma cobrança registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => {
              const cfg = statusConfig[payment.status];
              const isExpanded = expandedId === payment.id;
              const isActioning = actionLoading === payment.id;
              const isPaidOrDone = payment.status === 'paid';
              const dueDate = new Date(payment.due_date + 'T12:00:00').toLocaleDateString('pt-BR');

              return (
                <div key={payment.id} className="border border-white/10 rounded-xl overflow-hidden">
                  {/* Row principal */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white font-medium">
                          {profile.contracted_service_type === 'mensalidade'
                            ? `Mensalidade ${dueDate}`
                            : `Parcela ${payment.installment_number ?? ''}/${profile.contracted_installments}`}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        Venc. {dueDate} — R$ {payment.amount.toFixed(2).replace('.', ',')}
                        {isPaidOrDone && payment.paid_at && ` — Pago em ${new Date(payment.paid_at).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                    {!isPaidOrDone && (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
                    )}
                  </button>

                  {/* Ações expandidas */}
                  {isExpanded && !isPaidOrDone && (
                    <div className="grid grid-cols-2 gap-3 px-3 pb-3">
                      <button
                        onClick={() => handleGeneratePix(payment)}
                        disabled={isActioning}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-xl text-[#C8FF00] text-xs font-bold hover:bg-[#C8FF00]/20 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(200,255,0,0.1)] whitespace-nowrap"
                      >
                        {isActioning ? (
                          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        ) : (
                          <QrCode className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
                        )}
                        <span>Pagar com PIX</span>
                      </button>

                      <button
                        onClick={() => setCardModalPayment(payment)}
                        disabled={isActioning}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.1)] whitespace-nowrap"
                      >
                        <CreditCard className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                        <span>Cartão de Crédito</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
