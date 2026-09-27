import { supabase } from './supabase';

export interface ArcadePlayerProfile {
  id: string;
  player_name: string; // lowercase
  player_name_display: string;
  recovery_key?: string;
  created_at?: string;
}

const CURRENT_PLAYER_KEY = 'kito_arcade_current_player';
const LOCAL_PLAYERS_KEY = 'kito_arcade_registered_players';

// Gera Hash seguro SHA-256 usando Web Crypto API nativa
export async function hashPassword(nick: string, pass: string): Promise<string> {
  const normNick = nick.trim().toLowerCase();
  const salt = `kito_salt_${normNick}_2026`;
  const text = `${salt}:${pass.trim()}:${salt}`;
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Gera Chave de Recuperação fácil de anotar (Ex: REC-7K9A-4M2P)
export function generateRecoveryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) p1 += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) p2 += chars[Math.floor(Math.random() * chars.length)];
  return `REC-${p1}-${p2}`;
}

// Obter jogador autenticado na sessão atual
export function getCurrentPlayer(): ArcadePlayerProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_PLAYER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Salva jogador autenticado na sessão e sincroniza
export function setCurrentPlayer(player: ArcadePlayerProfile | null): void {
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
  } catch {
    // ignore
  }
  // Notifica componentes na mesma janela
  window.dispatchEvent(new CustomEvent('kito_arcade_player_change', { detail: player }));
}

// Escutar mudanças no perfil autenticado
export function onPlayerAuthChange(callback: (p: ArcadePlayerProfile | null) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<ArcadePlayerProfile | null>;
    callback(custom.detail);
  };
  window.addEventListener('kito_arcade_player_change', handler);
  return () => window.removeEventListener('kito_arcade_player_change', handler);
}

// Fallback Local de Jogadores Cadastrados
function getLocalRegisteredPlayers(): Record<string, { id: string; name: string; display: string; hash: string; recovery: string }> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PLAYERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalPlayer(id: string, name: string, display: string, hash: string, recovery: string) {
  try {
    const all = getLocalRegisteredPlayers();
    all[name.toLowerCase()] = { id, name: name.toLowerCase(), display, hash, recovery };
    localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

// 1. Verificar se Nick já existe
export async function checkNickStatus(rawNick: string): Promise<{ exists: boolean; displayName?: string }> {
  const clean = rawNick.trim();
  if (!clean) return { exists: false };
  const lower = clean.toLowerCase();

  // 1. Checa Supabase se disponível
  try {
    const { data, error } = await supabase
      .from('arcade_players')
      .select('id, player_name, player_name_display')
      .ilike('player_name', lower)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return { exists: true, displayName: data.player_name_display };
    }
  } catch {
    // ignore e vai pro fallback
  }

  // 2. Checa Local
  const local = getLocalRegisteredPlayers();
  if (local[lower]) {
    return { exists: true, displayName: local[lower].display };
  }

  return { exists: false };
}

// 2. Registrar Novo Nick com Senha
export async function registerPlayer(
  rawNick: string,
  pass: string
): Promise<{ success: boolean; player?: ArcadePlayerProfile; recoveryKey?: string; error?: string }> {
  const cleanNick = rawNick.trim();
  if (cleanNick.length < 3) {
    return { success: false, error: 'O Nick deve ter pelo menos 3 caracteres.' };
  }
  if (cleanNick.length > 18) {
    return { success: false, error: 'O Nick deve ter no máximo 18 caracteres.' };
  }
  if (!/^[a-zA-Z0-9_\- ]+$/.test(cleanNick)) {
    return { success: false, error: 'Use apenas letras, números, hífen ou sublinhado.' };
  }
  if (!pass || pass.length < 4) {
    return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' };
  }

  const lower = cleanNick.toLowerCase();

  // Verifica se já existe
  const status = await checkNickStatus(lower);
  if (status.exists) {
    return {
      success: false,
      error: `O Nick "${status.displayName || cleanNick}" já está cadastrado. Digite sua senha para entrar.`
    };
  }

  const hash = await hashPassword(lower, pass);
  const recoveryKey = generateRecoveryKey();
  const id = crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`;

  // 1. Tenta salvar no Supabase
  let savedOnSupabase = false;
  try {
    const { data, error } = await supabase
      .from('arcade_players')
      .insert({
        id,
        player_name: lower,
        player_name_display: cleanNick,
        password_hash: hash,
        recovery_key: recoveryKey
      })
      .select('id, player_name, player_name_display, recovery_key, created_at')
      .single();

    if (!error && data) {
      savedOnSupabase = true;
      const profile: ArcadePlayerProfile = {
        id: data.id,
        player_name: data.player_name,
        player_name_display: data.player_name_display,
        recovery_key: data.recovery_key,
        created_at: data.created_at
      };
      saveLocalPlayer(profile.id, lower, cleanNick, hash, recoveryKey);
      setCurrentPlayer(profile);
      return { success: true, player: profile, recoveryKey };
    }
  } catch {
    // fallback abaixo
  }

  // 2. Salva localmente caso a tabela ainda não exista no Supabase ou offline
  saveLocalPlayer(id, lower, cleanNick, hash, recoveryKey);
  const localProfile: ArcadePlayerProfile = {
    id,
    player_name: lower,
    player_name_display: cleanNick,
    recovery_key: recoveryKey,
    created_at: new Date().toISOString()
  };
  setCurrentPlayer(localProfile);
  return { success: true, player: localProfile, recoveryKey };
}

// 3. Login com Nick e Senha
export async function loginPlayer(
  rawNick: string,
  pass: string
): Promise<{ success: boolean; player?: ArcadePlayerProfile; error?: string }> {
  const cleanNick = rawNick.trim();
  const lower = cleanNick.toLowerCase();
  if (!cleanNick || !pass) {
    return { success: false, error: 'Preencha o Nick e a Senha.' };
  }

  const hash = await hashPassword(lower, pass);

  // 1. Tenta no Supabase
  try {
    const { data, error } = await supabase
      .from('arcade_players')
      .select('id, player_name, player_name_display, password_hash, recovery_key, created_at')
      .ilike('player_name', lower)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      if (data.password_hash === hash) {
        // Atualiza last_login
        supabase.from('arcade_players').update({ last_login: new Date().toISOString() }).eq('id', data.id);
        const profile: ArcadePlayerProfile = {
          id: data.id,
          player_name: data.player_name,
          player_name_display: data.player_name_display,
          recovery_key: data.recovery_key,
          created_at: data.created_at
        };
        saveLocalPlayer(data.id, lower, data.player_name_display, hash, data.recovery_key);
        setCurrentPlayer(profile);
        return { success: true, player: profile };
      } else {
        return { success: false, error: 'Senha incorreta para este Nick.' };
      }
    }
  } catch {
    // fallback local
  }

  // 2. Verifica Local
  const local = getLocalRegisteredPlayers();
  const user = local[lower];
  if (!user) {
    return { success: false, error: `O Nick "${cleanNick}" não foi encontrado. Clique em "Criar Novo Nick".` };
  }

  if (user.hash === hash) {
    const profile: ArcadePlayerProfile = {
      id: user.id,
      player_name: user.name,
      player_name_display: user.display,
      recovery_key: user.recovery,
      created_at: new Date().toISOString()
    };
    setCurrentPlayer(profile);
    return { success: true, player: profile };
  }

  return { success: false, error: 'Senha incorreta para este Nick.' };
}

// 4. Redefinir Senha com Chave de Recuperação
export async function resetPasswordWithKey(
  rawNick: string,
  recoveryKey: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  const cleanNick = rawNick.trim();
  const lower = cleanNick.toLowerCase();
  const cleanKey = recoveryKey.trim().toUpperCase();

  if (!cleanNick || !cleanKey || !newPass) {
    return { success: false, error: 'Preencha todos os campos.' };
  }
  if (newPass.length < 4) {
    return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };
  }

  const newHash = await hashPassword(lower, newPass);

  // 1. Supabase
  try {
    const { data } = await supabase
      .from('arcade_players')
      .select('id, recovery_key')
      .ilike('player_name', lower)
      .limit(1)
      .maybeSingle();

    if (data) {
      if (data.recovery_key.toUpperCase() === cleanKey) {
        await supabase
          .from('arcade_players')
          .update({ password_hash: newHash })
          .eq('id', data.id);

        const local = getLocalRegisteredPlayers();
        if (local[lower]) {
          local[lower].hash = newHash;
          localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(local));
        }
        return { success: true };
      } else {
        return { success: false, error: 'Chave de recuperação inválida para este Nick.' };
      }
    }
  } catch {
    // fallback local
  }

  // 2. Local
  const local = getLocalRegisteredPlayers();
  const user = local[lower];
  if (user && user.recovery.toUpperCase() === cleanKey) {
    user.hash = newHash;
    localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(local));
    return { success: true };
  }

  return { success: false, error: 'Chave de recuperação incorreta ou Nick não encontrado.' };
}

// 5. Logout
export function logoutPlayer(): void {
  setCurrentPlayer(null);
}
