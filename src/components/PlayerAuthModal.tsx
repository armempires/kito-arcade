import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Key, 
  ShieldCheck, 
  X, 
  Check, 
  Copy, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getCurrentPlayer, 
  registerPlayer, 
  loginPlayer, 
  resetPasswordWithKey, 
  logoutPlayer, 
  ArcadePlayerProfile 
} from '../lib/arcadePlayerAuth';

interface PlayerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (player: ArcadePlayerProfile) => void;
}

export const PlayerAuthModal: React.FC<PlayerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentPlayer, setCurrentPlayerState] = useState<ArcadePlayerProfile | null>(() => getCurrentPlayer());
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  
  // Formulário Login
  const [loginNick, setLoginNick] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Formulário Cadastro
  const [regNick, setRegNick] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  
  // Formulário Reset
  const [resetNick, setResetNick] = useState('');
  const [resetKey, setResetKey] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');

  // Estados UI
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdRecoveryKey, setCreatedRecoveryKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = getCurrentPlayer();
      setCurrentPlayerState(p);
      if (p) {
        setLoginNick(p.player_name_display);
      }
      setErrorMsg(null);
      setSuccessMsg(null);
      setCreatedRecoveryKey(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await loginPlayer(loginNick, loginPass);
    setIsLoading(false);

    if (!res.success || !res.player) {
      setErrorMsg(res.error || 'Erro ao entrar. Verifique os dados.');
      return;
    }

    setCurrentPlayerState(res.player);
    setSuccessMsg(`Bem-vindo de volta, ${res.player.player_name_display}!`);
    setTimeout(() => {
      onSuccess?.(res.player!);
      onClose();
    }, 900);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPass !== regPassConfirm) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    const res = await registerPlayer(regNick, regPass);
    setIsLoading(false);

    if (!res.success || !res.player) {
      setErrorMsg(res.error || 'Erro ao criar Nick.');
      return;
    }

    setCurrentPlayerState(res.player);
    setCreatedRecoveryKey(res.recoveryKey || null);
    setSuccessMsg(`Nick "${res.player.player_name_display}" criado e protegido com sucesso!`);
    onSuccess?.(res.player);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await resetPasswordWithKey(resetNick, resetKey, resetNewPass);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao redefinir senha.');
      return;
    }

    setSuccessMsg('Senha redefinida com sucesso! Agora você pode entrar com a nova senha.');
    setTab('login');
    setLoginNick(resetNick);
    setLoginPass(resetNewPass);
  };

  const handleLogout = () => {
    logoutPlayer();
    setCurrentPlayerState(null);
    setSuccessMsg('Você desconectou do seu Nick.');
    setLoginNick('');
    setLoginPass('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-slate-900/95 p-6 sm:p-7 shadow-[0_0_60px_rgba(34,211,238,0.2)] flex flex-col relative overflow-hidden text-white">
        
        {/* Glow de fundo */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-300/80 flex items-center gap-1">
                <Sparkles size={11} /> Identidade de Jogador
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {currentPlayer ? 'Perfil do Jogador' : 'Acessar com seu Nick'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensagens de Sucesso e Erro */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <Check size={16} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ESTADO 1: CHAVE DE RECUPERAÇÃO RECÉM CRIADA */}
        {createdRecoveryKey ? (
          <div className="py-6 space-y-4 text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto text-2xl">
              🔑
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Guarde sua Chave de Recuperação</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Se você esquecer sua senha, esta chave é a <strong>única forma</strong> de recuperar o acesso ao seu Nick.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between gap-3">
              <span className="font-mono text-cyan-300 font-black text-base tracking-widest">
                {createdRecoveryKey}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(createdRecoveryKey)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs flex items-center gap-1.5 hover:brightness-110 transition"
              >
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <button
              onClick={() => {
                setCreatedRecoveryKey(null);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Entendi e Salvei minha Chave
            </button>
          </div>
        ) : currentPlayer ? (
          /* ESTADO 2: JOGADOR JÁ AUTENTICADO */
          <div className="py-5 space-y-4 relative z-10">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center text-lg font-black text-white shadow-md">
                  {currentPlayer.player_name_display.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nick Ativo</div>
                  <div className="font-black text-lg text-white flex items-center gap-2">
                    {currentPlayer.player_name_display}
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                      Protegido 🔒
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {currentPlayer.recovery_key && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Sua Chave de Recuperação:</span>
                <span className="font-mono text-cyan-300 font-bold">{currentPlayer.recovery_key}</span>
              </div>
            )}

            <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
              💡 Suas vitórias e recordes no <strong>Tetris</strong>, <strong>Xadrez</strong> e <strong>Damas</strong> são registrados automaticamente sob este Nick.
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm hover:brightness-110 transition"
              >
                Continuar Jogando
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-bold text-sm transition flex items-center gap-1.5"
                title="Desconectar deste Nick"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        ) : (
          /* ESTADO 3: NÃO AUTENTICADO (TABS LOGIN / CADASTRO / RESET) */
          <div className="mt-4 relative z-10">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-950/80 p-1 border border-white/10 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(null); }}
                className={`flex-1 py-2 rounded-lg transition ${
                  tab === 'login' ? 'bg-cyan-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrar com Nick
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(null); }}
                className={`flex-1 py-2 rounded-lg transition ${
                  tab === 'register' ? 'bg-cyan-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Criar Novo Nick
              </button>
              <button
                type="button"
                onClick={() => { setTab('reset'); setErrorMsg(null); }}
                className={`px-3 py-2 rounded-lg transition ${
                  tab === 'reset' ? 'bg-cyan-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recuperar
              </button>
            </div>

            {/* TAB: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Seu Nickname
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={loginNick}
                      onChange={(e) => setLoginNick(e.target.value)}
                      placeholder="Ex: MestreDosGames"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                      Sua Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setTab('reset')}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Esqueci a senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="Sua senha secreta"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  Entrar e Liberar Ranking
                </button>
              </form>
            )}

            {/* TAB: CADASTRO */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Escolha seu Nickname
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={regNick}
                      onChange={(e) => setRegNick(e.target.value)}
                      placeholder="Ex: NinjaArcade"
                      maxLength={18}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">De 3 a 18 letras ou números.</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Crie uma Senha para proteger seu Nick
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      minLength={4}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Confirme a Senha
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={regPassConfirm}
                      onChange={(e) => setRegPassConfirm(e.target.value)}
                      placeholder="Repita a senha criada"
                      minLength={4}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-extrabold text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(52,211,153,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Criar e Proteger Meu Nick
                </button>
              </form>
            )}

            {/* TAB: RESET DE SENHA */}
            {tab === 'reset' && (
              <form onSubmit={handleReset} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Seu Nickname
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={resetNick}
                      onChange={(e) => setResetNick(e.target.value)}
                      placeholder="Nick cadastrado"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Chave de Recuperação
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={resetKey}
                      onChange={(e) => setResetKey(e.target.value)}
                      placeholder="Ex: REC-9X2A-7K"
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      minLength={4}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                  Redefinir Senha
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
