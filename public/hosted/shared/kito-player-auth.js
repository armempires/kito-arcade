/**
 * Kito Arcade - Sistema Unificado de Autenticação de Jogadores
 * Permite Criar Nick com Senha, Fazer Login, Recuperar com Chave de Segurança
 * e sincronizar com o Supabase e localStorage em todos os jogos hosted.
 */

(function(window) {
  const CURRENT_PLAYER_KEY = 'kito_arcade_current_player';
  const LOCAL_PLAYERS_KEY = 'kito_arcade_registered_players';
  const SUPABASE_URL = 'https://xsmfvqfeyjttxwyhsdij.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbWZ2cWZleWp0dHh3eWhzZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjY0MjgsImV4cCI6MjA1Nzk0MjQyOH0.sD95T682VbXWj_5Z4RjI88q2bV9y7zR5_K_r8zP2z';

  let supabaseClient = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch(e) {}
  }

  // SHA-256 via Web Crypto API
  async function hashPassword(nick, pass) {
    const normNick = nick.trim().toLowerCase();
    const salt = `kito_salt_${normNick}_2026`;
    const text = `${salt}:${pass.trim()}:${salt}`;
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function generateRecoveryKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '', p2 = '';
    for (let i = 0; i < 4; i++) p1 += chars[Math.floor(Math.random() * chars.length)];
    for (let i = 0; i < 4; i++) p2 += chars[Math.floor(Math.random() * chars.length)];
    return `REC-${p1}-${p2}`;
  }

  function getCurrentPlayer() {
    try {
      const raw = localStorage.getItem(CURRENT_PLAYER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e) {
      return null;
    }
  }

  function setCurrentPlayer(player) {
    try {
      if (player) {
        localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(player));
        localStorage.setItem('kito_arcade_player_name', player.player_name_display);
        localStorage.setItem('neon_tetris_player_name', player.player_name_display);
      } else {
        localStorage.removeItem(CURRENT_PLAYER_KEY);
        localStorage.removeItem('kito_arcade_player_name');
        localStorage.removeItem('neon_tetris_player_name');
      }
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('kito_arcade_player_change', { detail: player }));

    // Sincroniza com iframe parent se existir
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'KITO_ARCADE_PLAYER_AUTH_CHANGED', player }, '*');
      } catch(e) {}
    }
  }

  function getLocalRegisteredPlayers() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PLAYERS_KEY) || '{}');
    } catch(e) {
      return {};
    }
  }

  function saveLocalPlayer(id, name, display, hash, recovery) {
    try {
      const all = getLocalRegisteredPlayers();
      all[name.toLowerCase()] = { id, name: name.toLowerCase(), display, hash, recovery };
      localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(all));
    } catch(e) {}
  }

  async function checkNickStatus(rawNick) {
    const clean = rawNick.trim();
    if (!clean) return { exists: false };
    const lower = clean.toLowerCase();

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('arcade_players')
          .select('id, player_name, player_name_display')
          .ilike('player_name', lower)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return { exists: true, displayName: data.player_name_display };
        }
      } catch(e) {}
    }

    const local = getLocalRegisteredPlayers();
    if (local[lower]) {
      return { exists: true, displayName: local[lower].display };
    }

    return { exists: false };
  }

  async function registerPlayer(rawNick, pass) {
    const cleanNick = rawNick.trim();
    if (cleanNick.length < 3) return { success: false, error: 'O Nick deve ter pelo menos 3 caracteres.' };
    if (cleanNick.length > 18) return { success: false, error: 'O Nick deve ter no máximo 18 caracteres.' };
    if (!/^[a-zA-Z0-9_\- ]+$/.test(cleanNick)) return { success: false, error: 'Use apenas letras, números, hífen ou sublinhado.' };
    if (!pass || pass.length < 4) return { success: false, error: 'A senha deve ter pelo menos 4 caracteres.' };

    const lower = cleanNick.toLowerCase();
    const existing = await checkNickStatus(cleanNick);
    if (existing.exists) {
      return { success: false, error: `O Nick "${cleanNick}" já está em uso. Se for você, faça Login com sua senha.` };
    }

    const passwordHash = await hashPassword(lower, pass);
    const recoveryKey = generateRecoveryKey();
    const newId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `usr_${Date.now()}`;

    // 1. Tentar Supabase
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('arcade_players')
          .insert([{
            id: newId,
            player_name: lower,
            player_name_display: cleanNick,
            password_hash: passwordHash,
            recovery_key: recoveryKey
          }])
          .select('id, player_name, player_name_display')
          .single();

        if (!error && data) {
          saveLocalPlayer(data.id, data.player_name, data.player_name_display, passwordHash, recoveryKey);
          const profile = { id: data.id, player_name: data.player_name, player_name_display: data.player_name_display, recovery_key: recoveryKey };
          setCurrentPlayer(profile);
          return { success: true, player: profile, recoveryKey };
        }
      } catch(e) {}
    }

    // 2. Fallback Local
    saveLocalPlayer(newId, lower, cleanNick, passwordHash, recoveryKey);
    const profile = { id: newId, player_name: lower, player_name_display: cleanNick, recovery_key: recoveryKey };
    setCurrentPlayer(profile);
    return { success: true, player: profile, recoveryKey };
  }

  async function loginPlayer(rawNick, pass) {
    const cleanNick = rawNick.trim();
    if (!cleanNick) return { success: false, error: 'Informe seu Nick.' };
    if (!pass) return { success: false, error: 'Informe sua senha.' };

    const lower = cleanNick.toLowerCase();
    const passwordHash = await hashPassword(lower, pass);

    // 1. Tenta Supabase
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('arcade_players')
          .select('id, player_name, player_name_display, password_hash, recovery_key')
          .ilike('player_name', lower)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          if (data.password_hash === passwordHash) {
            const profile = { id: data.id, player_name: data.player_name, player_name_display: data.player_name_display };
            setCurrentPlayer(profile);
            saveLocalPlayer(data.id, data.player_name, data.player_name_display, passwordHash, data.recovery_key || '');
            return { success: true, player: profile };
          } else {
            return { success: false, error: 'Senha incorreta para este Nick.' };
          }
        }
      } catch(e) {}
    }

    // 2. Fallback Local
    const local = getLocalRegisteredPlayers();
    if (local[lower]) {
      if (local[lower].hash === passwordHash) {
        const profile = { id: local[lower].id, player_name: local[lower].name, player_name_display: local[lower].display };
        setCurrentPlayer(profile);
        return { success: true, player: profile };
      } else {
        return { success: false, error: 'Senha incorreta para este Nick.' };
      }
    }

    return { success: false, error: `Nick "${cleanNick}" não encontrado. Crie seu Nick primeiro.` };
  }

  async function resetPasswordWithKey(rawNick, recoveryKey, newPass) {
    const cleanNick = rawNick.trim();
    const cleanKey = recoveryKey.trim().toUpperCase();
    if (!cleanNick || !cleanKey) return { success: false, error: 'Nick e Chave de Recuperação são obrigatórios.' };
    if (!newPass || newPass.length < 4) return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };

    const lower = cleanNick.toLowerCase();
    const newHash = await hashPassword(lower, newPass);

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('arcade_players')
          .select('id, recovery_key')
          .ilike('player_name', lower)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          if (data.recovery_key && data.recovery_key.toUpperCase() === cleanKey) {
            await supabaseClient.from('arcade_players').update({ password_hash: newHash }).eq('id', data.id);
            const local = getLocalRegisteredPlayers();
            if (local[lower]) local[lower].hash = newHash;
            return { success: true };
          } else {
            return { success: false, error: 'Chave de recuperação inválida.' };
          }
        }
      } catch(e) {}
    }

    const local = getLocalRegisteredPlayers();
    if (local[lower]) {
      if (local[lower].recovery.toUpperCase() === cleanKey) {
        local[lower].hash = newHash;
        localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(local));
        return { success: true };
      }
    }

    return { success: false, error: 'Chave de recuperação incorreta ou jogador não encontrado.' };
  }

  // Interface do Modal Integrada
  function initPlayerAuthUI(options = {}) {
    const attachButtonId = options.buttonId || 'btn-player-auth';
    const authBtn = document.getElementById(attachButtonId);

    function updateButtonState() {
      const cur = getCurrentPlayer();
      if (authBtn) {
        if (cur) {
          authBtn.innerHTML = `🛡️ <b>${cur.player_name_display}</b>`;
          authBtn.title = `Conectado como ${cur.player_name_display} (Clique para gerenciar)`;
          authBtn.style.borderColor = 'rgba(74, 222, 128, 0.6)';
          authBtn.style.color = '#4ade80';
        } else {
          authBtn.innerHTML = `🔑 Criar Nick / Entrar`;
          authBtn.title = 'Entrar ou criar seu Nick protegido por senha';
          authBtn.style.borderColor = '';
          authBtn.style.color = '';
        }
      }
    }

    // Cria o Modal HTML no body se não existir
    let modal = document.getElementById('kito-player-auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'kito-player-auth-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;z-index:99999;padding:16px;font-family:sans-serif;';
      modal.innerHTML = `
        <div style="background:#131722; border:1px solid #2a2e3d; border-radius:18px; max-width:440px; width:100%; box-shadow:0 25px 60px rgba(0,0,0,0.6); padding:24px; color:#f1f5f9; position:relative; max-height:90vh; overflow-y:auto;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:24px;">🛡️</span>
              <div>
                <h3 style="margin:0; font-size:18px; font-weight:700; color:#fff;">Conta de Jogador</h3>
                <p style="margin:2px 0 0; font-size:12px; color:#94a3b8;">Proteja seu Nick e seus recordes com senha</p>
              </div>
            </div>
            <button id="kito-auth-modal-close" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#94a3b8; border-radius:8px; width:32px; height:32px; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
          </div>

          <!-- Conteúdo Quando Deslogado -->
          <div id="kito-auth-unauthed-view">
            <!-- Tabs -->
            <div style="display:flex; background:rgba(0,0,0,0.3); border-radius:10px; padding:4px; margin-bottom:16px; gap:4px;">
              <button id="kito-tab-login" style="flex:1; padding:8px; border-radius:8px; border:none; background:#3b82f6; color:#fff; font-size:12px; font-weight:700; cursor:pointer;">Entrar</button>
              <button id="kito-tab-register" style="flex:1; padding:8px; border-radius:8px; border:none; background:transparent; color:#94a3b8; font-size:12px; font-weight:700; cursor:pointer;">Criar Nick</button>
              <button id="kito-tab-recover" style="flex:1; padding:8px; border-radius:8px; border:none; background:transparent; color:#94a3b8; font-size:12px; font-weight:700; cursor:pointer;">Recuperar</button>
            </div>

            <div id="kito-auth-feedback" style="display:none; padding:10px 12px; border-radius:8px; font-size:12px; margin-bottom:14px;"></div>

            <!-- Tab 1: Login -->
            <div id="kito-panel-login">
              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Seu Nickname:</label>
              <input type="text" id="kito-login-nick" placeholder="Ex: MestreDosMagos" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:12px;" />

              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Sua Senha:</label>
              <input type="password" id="kito-login-pass" placeholder="••••••••" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:16px;" />

              <button id="kito-btn-do-login" style="width:100%; padding:12px; background:#2563eb; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px;">
                🚀 Entrar e Carregar Meu Nick
              </button>
            </div>

            <!-- Tab 2: Cadastro -->
            <div id="kito-panel-register" style="display:none;">
              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Escolha seu Nickname único:</label>
              <input type="text" id="kito-reg-nick" placeholder="Ex: ShadowMaster" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:12px;" />

              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Crie uma Senha (mín. 4 caracteres):</label>
              <input type="password" id="kito-reg-pass" placeholder="••••••••" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:16px;" />

              <button id="kito-btn-do-register" style="width:100%; padding:12px; background:#10b981; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px;">
                ✨ Criar Meu Nick Protegido
              </button>
            </div>

            <!-- Tab 3: Recuperação -->
            <div id="kito-panel-recover" style="display:none;">
              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Seu Nickname:</label>
              <input type="text" id="kito-rec-nick" placeholder="Ex: ShadowMaster" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:12px;" />

              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Chave de Recuperação (ex: REC-XXXX-YYYY):</label>
              <input type="text" id="kito-rec-key" placeholder="REC-ABCD-1234" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:12px; text-transform:uppercase;" />

              <label style="display:block; font-size:12px; color:#94a3b8; margin-bottom:4px; font-weight:600;">Nova Senha:</label>
              <input type="password" id="kito-rec-pass" placeholder="••••••••" style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid #334155; border-radius:8px; color:#fff; font-size:14px; margin-bottom:16px;" />

              <button id="kito-btn-do-recover" style="width:100%; padding:12px; background:#8b5cf6; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px;">
                🔑 Redefinir Senha
              </button>
            </div>
          </div>

          <!-- Conteúdo Quando Já Autenticado -->
          <div id="kito-auth-authed-view" style="display:none;">
            <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:12px; padding:16px; text-align:center; margin-bottom:16px;">
              <span style="font-size:36px;">👑</span>
              <h4 id="kito-authed-name" style="margin:8px 0 4px; font-size:20px; font-weight:700; color:#4ade80;">Jogador</h4>
              <p style="margin:0; font-size:12px; color:#86efac;">✓ Nick Verificado e Protegido por Senha</p>
              <div id="kito-authed-recovery-box" style="margin-top:10px; display:none; background:rgba(0,0,0,0.3); padding:8px; border-radius:8px; font-size:11px; font-family:monospace; color:#fde047;"></div>
            </div>

            <p style="font-size:13px; color:#94a3b8; line-height:1.5; margin-bottom:16px; text-align:center;">
              Todas as suas vitórias e pontuações serão computadas exclusivamente para este Nick neste jogo!
            </p>

            <button id="kito-btn-logout" style="width:100%; padding:12px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">
              🚪 Sair / Trocar de Nick
            </button>
          </div>

        </div>
      `;
      document.body.appendChild(modal);
    }

    // Referências dos elementos
    const closeBtn = document.getElementById('kito-auth-modal-close');
    const tabLogin = document.getElementById('kito-tab-login');
    const tabRegister = document.getElementById('kito-tab-register');
    const tabRecover = document.getElementById('kito-tab-recover');
    const panelLogin = document.getElementById('kito-panel-login');
    const panelRegister = document.getElementById('kito-panel-register');
    const panelRecover = document.getElementById('kito-panel-recover');
    const unauthedView = document.getElementById('kito-auth-unauthed-view');
    const authedView = document.getElementById('kito-auth-authed-view');
    const authedName = document.getElementById('kito-authed-name');
    const authedRecoveryBox = document.getElementById('kito-authed-recovery-box');
    const feedbackBox = document.getElementById('kito-auth-feedback');

    function showFeedback(msg, isError = false) {
      if (!feedbackBox) return;
      feedbackBox.style.display = 'block';
      feedbackBox.style.background = isError ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)';
      feedbackBox.style.border = isError ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)';
      feedbackBox.style.color = isError ? '#fca5a5' : '#86efac';
      feedbackBox.innerText = msg;
    }

    function hideFeedback() {
      if (feedbackBox) feedbackBox.style.display = 'none';
    }

    function switchTab(activeTab) {
      hideFeedback();
      tabLogin.style.background = activeTab === 'login' ? '#3b82f6' : 'transparent';
      tabLogin.style.color = activeTab === 'login' ? '#fff' : '#94a3b8';
      tabRegister.style.background = activeTab === 'register' ? '#10b981' : 'transparent';
      tabRegister.style.color = activeTab === 'register' ? '#fff' : '#94a3b8';
      tabRecover.style.background = activeTab === 'recover' ? '#8b5cf6' : 'transparent';
      tabRecover.style.color = activeTab === 'recover' ? '#fff' : '#94a3b8';

      panelLogin.style.display = activeTab === 'login' ? 'block' : 'none';
      panelRegister.style.display = activeTab === 'register' ? 'block' : 'none';
      panelRecover.style.display = activeTab === 'recover' ? 'block' : 'none';
    }

    function refreshModalView() {
      const cur = getCurrentPlayer();
      if (cur) {
        unauthedView.style.display = 'none';
        authedView.style.display = 'block';
        authedName.innerText = cur.player_name_display;
        if (cur.recovery_key) {
          authedRecoveryBox.style.display = 'block';
          authedRecoveryBox.innerHTML = `Guarde sua Chave de Segurança:<br><b style="font-size:14px;color:#facc15;">${cur.recovery_key}</b>`;
        } else {
          authedRecoveryBox.style.display = 'none';
        }
      } else {
        unauthedView.style.display = 'block';
        authedView.style.display = 'none';
        switchTab('login');
      }
      updateButtonState();
    }

    function openModal() {
      refreshModalView();
      modal.style.display = 'flex';
    }

    function closeModal() {
      modal.style.display = 'none';
      hideFeedback();
    }

    if (authBtn) authBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));
    tabRecover.addEventListener('click', () => switchTab('recover'));

    // Ação: Login
    document.getElementById('kito-btn-do-login').addEventListener('click', async () => {
      const nick = document.getElementById('kito-login-nick').value;
      const pass = document.getElementById('kito-login-pass').value;
      const btn = document.getElementById('kito-btn-do-login');
      btn.innerText = 'Entrando...';
      btn.disabled = true;

      const res = await loginPlayer(nick, pass);
      btn.innerText = '🚀 Entrar e Carregar Meu Nick';
      btn.disabled = false;

      if (res.success) {
        showFeedback(`Bem-vindo de volta, ${res.player.player_name_display}!`);
        setTimeout(() => {
          refreshModalView();
          if (options.onAuthSuccess) options.onAuthSuccess(res.player);
        }, 600);
      } else {
        showFeedback(res.error || 'Erro ao fazer login.', true);
      }
    });

    // Ação: Registro
    document.getElementById('kito-btn-do-register').addEventListener('click', async () => {
      const nick = document.getElementById('kito-reg-nick').value;
      const pass = document.getElementById('kito-reg-pass').value;
      const btn = document.getElementById('kito-btn-do-register');
      btn.innerText = 'Criando Nick...';
      btn.disabled = true;

      const res = await registerPlayer(nick, pass);
      btn.innerText = '✨ Criar Meu Nick Protegido';
      btn.disabled = false;

      if (res.success) {
        showFeedback(`Nick "${res.player.player_name_display}" criado com sucesso! Guarde sua chave de recuperação.`);
        setTimeout(() => {
          refreshModalView();
          if (options.onAuthSuccess) options.onAuthSuccess(res.player);
        }, 800);
      } else {
        showFeedback(res.error || 'Erro ao registrar nick.', true);
      }
    });

    // Ação: Recuperação
    document.getElementById('kito-btn-do-recover').addEventListener('click', async () => {
      const nick = document.getElementById('kito-rec-nick').value;
      const key = document.getElementById('kito-rec-key').value;
      const pass = document.getElementById('kito-rec-pass').value;
      const btn = document.getElementById('kito-btn-do-recover');
      btn.innerText = 'Redefinindo...';
      btn.disabled = true;

      const res = await resetPasswordWithKey(nick, key, pass);
      btn.innerText = '🔑 Redefinir Senha';
      btn.disabled = false;

      if (res.success) {
        showFeedback('Senha redefinida com sucesso! Agora faça login com a nova senha.');
        setTimeout(() => switchTab('login'), 1200);
      } else {
        showFeedback(res.error || 'Erro ao redefinir senha.', true);
      }
    });

    // Ação: Logout
    document.getElementById('kito-btn-logout').addEventListener('click', () => {
      setCurrentPlayer(null);
      refreshModalView();
      if (options.onLogout) options.onLogout();
    });

    // Listeners de evento de sincronização externa
    window.addEventListener('kito_arcade_player_change', () => {
      updateButtonState();
      refreshModalView();
    });

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'KITO_ARCADE_PLAYER_AUTH_CHANGED') {
        updateButtonState();
        refreshModalView();
      }
    });

    // Inicialização do estado
    updateButtonState();
  }

  // Exporta globalmente no window
  window.KitoPlayerAuth = {
    getCurrentPlayer,
    setCurrentPlayer,
    checkNickStatus,
    registerPlayer,
    loginPlayer,
    resetPasswordWithKey,
    initPlayerAuthUI
  };

})(window);
