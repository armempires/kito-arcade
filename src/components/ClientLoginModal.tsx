import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useClientAuth } from '../hooks/useClientAuth';
import { requestManagerPasswordReset, verifyPasswordResetCode, confirmPasswordReset } from '../lib/password-reset';

interface ClientLoginModalProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'reset-email' | 'reset-code' | 'reset-password' | 'reset-success';

export const ClientLoginModal: React.FC<ClientLoginModalProps> = ({ onLoginSuccess }) => {
  const { signIn, error: authError, isLoading: isAuthLoading } = useClientAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Estados do Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Estados do Reset de Senha (Kito-Resend)
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetId, setResetId] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // 1. Enviar Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !password.trim()) {
      setLocalError('Preencha e-mail e senha.');
      return;
    }
    const ok = await signIn(email.trim(), password);
    if (ok) onLoginSuccess();
  };

  // 2. Solicitar Código OTP de 6 dígitos via Resend
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Informe um e-mail válido.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await requestManagerPasswordReset(resetEmail.trim());
      setResetId(res.resetId);
      setResetMessage(res.message || 'Código OTP de 6 dígitos enviado para seu e-mail.');
      setResetCode('');
      setMode('reset-code');
    } catch (err: any) {
      setResetError(err.message || 'Erro ao solicitar código de recuperação.');
    } finally {
      setResetLoading(false);
    }
  };

  // 3. Validar Código OTP de 6 dígitos
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetCode.trim() || resetCode.trim().length < 6) {
      setResetError('Digite o código de 6 dígitos recebido.');
      return;
    }

    setResetLoading(true);
    try {
      await verifyPasswordResetCode(resetId, resetCode.trim());
      setResetMessage('Código validado com sucesso! Crie sua nova senha.');
      setMode('reset-password');
    } catch (err: any) {
      setResetError(err.message || 'Código inválido ou expirado.');
    } finally {
      setResetLoading(false);
    }
  };

  // 4. Confirmar e Atualizar Nova Senha
  const handleConfirmPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newPassword.length < 6) {
      setResetError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('As senhas não coincidem.');
      return;
    }

    setResetLoading(true);
    try {
      await confirmPasswordReset(resetId, newPassword);
      setMode('reset-success');
    } catch (err: any) {
      const msg = err?.message || '';
      // Tratamento para comportamento do GoTrue ("Database error loading user"):
      // O GoTrue grava a nova senha no banco de dados com sucesso antes de emitir a falha de serialização.
      // Verificamos se as novas credenciais já autenticam o cliente:
      if (msg.includes('Database error loading user') || msg.includes('loading user')) {
        try {
          const ok = await signIn(resetEmail.trim(), newPassword);
          if (ok) {
            setMode('reset-success');
            return;
          }
        } catch {
          // continua para exibir mensagem caso a autenticação falhe
        }
      }
      setResetError(msg || 'Erro ao redefinir senha.');
    } finally {
      setResetLoading(false);
    }
  };

  const displayLoginError = localError || authError;

  return (
    <div className="min-h-screen bg-[#0E0E11] flex items-center justify-center px-4 py-8 relative">
      {/* Glow de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C8FF00]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Botão Superior: Voltar ao Arcade */}
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#C8FF00] hover:text-black border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all"
            title="Voltar à página inicial do Kito Arcade"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Arcade</span>
          </a>

          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Kito Expert Portal
          </span>
        </div>

        {/* Logo / Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 mb-4 shadow-[0_0_20px_rgba(200,255,0,0.15)]">
            {mode === 'login' ? (
              <Lock className="w-6 h-6 text-[#C8FF00]" />
            ) : (
              <KeyRound className="w-6 h-6 text-[#C8FF00]" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Portal do Cliente' : 'Recuperação de Senha'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {mode === 'login'
              ? 'Acesse sua área exclusiva no ecossistema'
              : 'Redefina seu acesso com verificação segura OTP via Resend'}
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {/* MODO 1: LOGIN TRADICIONAL */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C8FF00]/50 focus:ring-1 focus:ring-[#C8FF00]/30 transition-all"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-white/70">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetError('');
                      setResetMessage('');
                      setMode('reset-email');
                    }}
                    className="text-xs text-[#C8FF00] hover:underline font-medium transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C8FF00]/50 focus:ring-1 focus:ring-[#C8FF00]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erro de login */}
              {displayLoginError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{displayLoginError}</span>
                </p>
              )}

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(200,255,0,0.2)]"
              >
                {isAuthLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
                ) : (
                  <>Entrar <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* MODO 2: RESET DE SENHA - PASSO 1: E-MAIL */}
          {mode === 'reset-email' && (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C8FF00]/50 focus:ring-1 focus:ring-[#C8FF00]/30 transition-all"
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Enviaremos um código OTP de 6 dígitos instantâneo para o seu e-mail via Resend.
                </p>
              </div>

              {resetError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {resetError}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
              >
                {resetLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando Código...</>
                ) : (
                  <>Enviar Código de 6 Dígitos <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                ← Voltar para o Login
              </button>
            </form>
          )}

          {/* MODO 3: RESET DE SENHA - PASSO 2: CÓDIGO OTP */}
          {mode === 'reset-code' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              {resetMessage && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  {resetMessage}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-black/40 border border-[#C8FF00]/40 rounded-xl text-[#C8FF00] placeholder-white/20 focus:outline-none focus:border-[#C8FF00] transition-all"
                />
                <p className="text-xs text-zinc-400 mt-2 text-center">
                  O código expira em 10 minutos.
                </p>
              </div>

              {resetError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {resetError}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
              >
                {resetLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Validando...</>
                ) : (
                  <>Validar Código <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleRequestReset}
                  disabled={resetLoading}
                  className="text-[#C8FF00] hover:underline"
                >
                  Reenviar código
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* MODO 4: RESET DE SENHA - PASSO 3: NOVA SENHA */}
          {mode === 'reset-password' && (
            <form onSubmit={handleConfirmPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                    className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C8FF00]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C8FF00]/50 transition-all"
                  />
                </div>
              </div>

              {resetError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {resetError}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-colors disabled:opacity-50"
              >
                {resetLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Salvando Nova Senha...</>
                ) : (
                  <>Salvar Nova Senha e Concluir <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* MODO 5: SUCESSO */}
          {mode === 'reset-success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Senha Redefinida!</h3>
              <p className="text-xs text-zinc-300">
                Sua senha foi atualizada com sucesso. Agora você já pode acessar sua conta normalmente.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setPassword('');
                  setLocalError('');
                }}
                className="w-full py-3 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-colors"
              >
                Acessar Minha Conta
              </button>
            </div>
          )}

          {mode === 'login' && (
            <p className="text-center text-white/30 text-xs mt-6">
              Não tem acesso? Entre em contato com a equipe Kito.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

