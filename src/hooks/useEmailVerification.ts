import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { sendKitoVerificationCode } from '../services/kitoEmailService';

export interface EmailVerification {
  id: string;
  email: string;
  code: string;
  verified: boolean;
  expires_at: string;
  created_at: string;
}

const VERIFICATION_CODE_TTL_MINUTES = 15;

export function useEmailVerification() {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const generateCode = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  const sendVerificationCode = useCallback(async (email: string) => {
    setSending(true);
    setError('');

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + VERIFICATION_CODE_TTL_MINUTES);

    const { error: insertError } = await supabase.from('email_verifications').insert({
      email,
      code,
      verified: false,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      setError('Erro ao gerar código. Tente novamente.');
      setSending(false);
      return { success: false as const, error: insertError.message };
    }

    try {
      const res = await sendKitoVerificationCode(email, code);
      if (!res.success) {
        console.warn('Falha no envio do código de verificação:', res.error);
        setError(res.error || 'Erro ao enviar email de verificação. Tente novamente.');
        setSending(false);
        return { success: false as const, error: res.error };
      }
    } catch (err) {
      console.error('Erro ao enviar email de verificação:', err);
      setError('Código gerado, mas erro ao enviar email. Tente novamente.');
      setSending(false);
      return { success: false as const, error: 'Erro ao enviar email' };
    }

    setSending(false);
    return { success: true as const, code };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    setVerifying(true);
    setError('');

    const { data: verifications, error: selectError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (selectError || !verifications || verifications.length === 0) {
      setError('Código não encontrado ou expirado.');
      setVerifying(false);
      return { success: false as const };
    }

    const latest = verifications[0] as EmailVerification;

    if (new Date(latest.expires_at) < new Date()) {
      setError('Código expirado. Solicite um novo código.');
      setVerifying(false);
      return { success: false as const };
    }

    if (latest.code !== code.trim()) {
      setError('Código inválido. Verifique os 6 dígitos digitados.');
      setVerifying(false);
      return { success: false as const };
    }

    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', latest.id);

    if (updateError) {
      setError('Erro ao validar código. Tente novamente.');
      setVerifying(false);
      return { success: false as const };
    }

    setVerifying(false);
    return { success: true as const };
  }, []);

  const isEmailVerified = useCallback(async (email: string) => {
    const { data } = await supabase
      .from('email_verifications')
      .select('verified')
      .eq('email', email)
      .eq('verified', true)
      .maybeSingle();

    return !!data;
  }, []);

  return {
    sending,
    verifying,
    error,
    setError,
    sendVerificationCode,
    verifyCode,
    isEmailVerified,
  };
}
