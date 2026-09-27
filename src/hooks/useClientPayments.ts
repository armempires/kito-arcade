import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ClientPayment } from '../types/crm';

const SUPABASE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface UseClientPaymentsReturn {
  payments: ClientPayment[];
  isLoading: boolean;
  error: string;
  generatePix: (paymentId: string) => Promise<{ qrCode: string; copyPaste: string } | null>;
  markPaidManual: (paymentId: string) => Promise<boolean>;
  anticipate: (paymentId: string) => Promise<boolean>;
  payWithCard: (paymentId: string, card: any, holderInfo: any) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useClientPayments(clientId: string | undefined): UseClientPaymentsReturn {
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (showLoading = true) => {
    if (!clientId) return;
    if (showLoading) setIsLoading(true);
    const { data, error: err } = await supabase
      .from('client_payments')
      .select('*')
      .eq('client_id', clientId)
      .order('installment_number', { ascending: true })
      .order('due_date', { ascending: true });

    if (err) {
      setError('Erro ao carregar pagamentos.');
    } else {
      setPayments((data ?? []) as ClientPayment[]);
    }
    if (showLoading) setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    load(true);

    // 1. Canal Supabase Realtime com ID único para evitar reaproveitamento de canal já subscrito
    const channelName = `realtime_payments_${clientId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_payments',
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          load(false);
        }
      )
      .subscribe();

    // 2. Polling ativo a cada 3s como redundância à prova de falhas
    const interval = setInterval(() => {
      load(false);
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [clientId]);

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (anonKey) headers['apikey'] = anonKey;
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`;
    }
    return headers;
  };

  const generatePix = useCallback(async (paymentId: string) => {
    setError('');
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/client-payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'generate_pix', paymentId }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return null; }
      await load();
      return { qrCode: data.qrCode, copyPaste: data.copyPaste };
    } catch {
      setError('Erro ao gerar PIX.');
      return null;
    }
  }, [load]);

  const payWithCard = useCallback(async (paymentId: string, card: any, holderInfo: any) => {
    setError('');
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/client-payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'pay_card', paymentId, card, holderInfo }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Erro ao processar cartão.');
        return { success: false, error: data.error || 'Erro ao processar cartão.' };
      }
      await load();
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Erro inesperado na transação.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, [load]);

  const markPaidManual = useCallback(async (paymentId: string): Promise<boolean> => {
    setError('');
    const { error: err } = await supabase
      .from('client_payments')
      .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'manual' })
      .eq('id', paymentId);
    if (err) { setError('Erro ao marcar como pago.'); return false; }
    await load();
    return true;
  }, [load]);

  const anticipate = useCallback(async (paymentId: string): Promise<boolean> => {
    setError('');
    const { error: err } = await supabase
      .from('client_payments')
      .update({ due_date: new Date().toISOString().split('T')[0], status: 'anticipated' })
      .eq('id', paymentId);
    if (err) { setError('Erro ao antecipar parcela.'); return false; }
    await load();
    return true;
  }, [load]);

  return {
    payments,
    isLoading,
    error,
    generatePix,
    payWithCard,
    markPaidManual,
    anticipate,
    refresh: load,
  };
}
