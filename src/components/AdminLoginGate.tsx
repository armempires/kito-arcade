import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, Send, Shield } from 'lucide-react';

interface AdminLoginGateProps {
  onAuthenticated: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_crm_authenticated');
    if (stored === 'true') {
      onAuthenticated();
    }
  }, [onAuthenticated]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-admin-otp', {
        body: {},
      });

      if (fnError || !data?.success) {
        throw new Error(data?.error || fnError?.message || 'Falha ao enviar código.');
      }

      setStep('code');
      setTimeLeft(15 * 60);
      setOtp('');
      setTokenEmail(data.email_sent_to || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin-otp', {
        body: { email: tokenEmail, otp_code: otp },
      });

      if (fnError || !data?.authenticated) {
        throw new Error(data?.error || fnError?.message || 'Código inválido.');
      }

      sessionStorage.setItem('admin_crm_authenticated', 'true');
      onAuthenticated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setStep('email');
    setOtp('');
    setError(null);
    setTimeLeft(0);
    setTokenEmail(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-[#0d0f15] border border-[#1a1e2b] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-[#C8FF00] via-[#84CC16] to-[#06B6D4] h-1" />
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-[#C8FF00]" />
            <span className="ml-2 text-xl font-bold text-white">KITO<span className="text-[#C8FF00]">ARCADE</span></span>
          </div>

          <h2 className="text-center text-lg font-semibold text-white mb-1">
            Acesso Restrito ao CRM
          </h2>
          <p className="text-center text-sm text-gray-400 mb-6">
            {step === 'email'
              ? 'Clique para enviar o código de verificação.'
              : 'Digite o código de 6 dígitos enviado para seu e-mail.'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {step === 'email' && (
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C8FF00] text-black font-bold rounded-lg hover:bg-[#84CC16] transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : <>Enviar Código <Send className="w-4 h-4" /></>}
            </button>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-[#1a1e2b] border border-[#2a2e3b] rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C8FF00] transition-all"
                  placeholder="______"
                  autoComplete="one-time-code"
                />
                {timeLeft > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Expira em {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
              <button
                onClick={handleVerifyCode}
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C8FF00] text-black font-bold rounded-lg hover:bg-[#84CC16] transition-colors disabled:opacity-50"
              >
                {loading ? 'Validando...' : <>Validar <KeyRound className="w-4 h-4" /></>}
              </button>
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                Reenviar código
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
