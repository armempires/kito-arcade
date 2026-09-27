import { supabase } from './supabase';
import { getCurrentPlayer } from './arcadePlayerAuth';

// ==========================================
// 1. RANKING DE XADREZ
// ==========================================
export interface XadrezLeaderboardEntry {
  id: string;
  player_id?: string | null;
  player_name: string;
  wins: number;
  draws: number;
  losses: number;
  points: number; // (wins * 3 + draws * 1)
  last_match_mode?: string;
  updated_at?: string;
}

const LOCAL_XADREZ_LEADERBOARD = 'kito_arcade_xadrez_leaderboard';

export async function fetchXadrezLeaderboard(limit = 50): Promise<XadrezLeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('xadrez_leaderboard')
      .select('*')
      .order('points', { ascending: false })
      .order('wins', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as XadrezLeaderboardEntry[];
    }
  } catch {
    // fallback
  }

  // Fallback Local
  try {
    const raw = localStorage.getItem(LOCAL_XADREZ_LEADERBOARD);
    if (raw) {
      const list: XadrezLeaderboardEntry[] = JSON.parse(raw);
      list.sort((a, b) => b.points - a.points || b.wins - a.wins);
      return list.slice(0, limit);
    }
  } catch {
    // ignore
  }

  return [];
}

export async function recordXadrezMatch(
  playerName: string,
  result: 'win' | 'draw' | 'loss',
  mode: 'ia' | 'online' = 'ia'
): Promise<void> {
  const cleanName = playerName.trim() || 'Jogador Anônimo';
  const player = getCurrentPlayer();
  const playerId = player && player.player_name_display.toLowerCase() === cleanName.toLowerCase() ? player.id : null;

  // 1. Atualizar ou Inserir Localmente
  try {
    const list: XadrezLeaderboardEntry[] = JSON.parse(localStorage.getItem(LOCAL_XADREZ_LEADERBOARD) || '[]');
    let entry = list.find((e) => e.player_name.toLowerCase() === cleanName.toLowerCase());
    if (!entry) {
      entry = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        player_id: playerId,
        player_name: cleanName,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        last_match_mode: mode,
        updated_at: new Date().toISOString()
      };
      list.push(entry);
    }
    if (result === 'win') entry.wins += 1;
    else if (result === 'draw') entry.draws += 1;
    else if (result === 'loss') entry.losses += 1;
    entry.points = entry.wins * 3 + entry.draws * 1;
    entry.last_match_mode = mode;
    entry.updated_at = new Date().toISOString();

    list.sort((a, b) => b.points - a.points || b.wins - a.wins);
    localStorage.setItem(LOCAL_XADREZ_LEADERBOARD, JSON.stringify(list.slice(0, 100)));
  } catch {
    // ignore
  }

  // 2. Atualizar no Supabase
  try {
    const { data: existing } = await supabase
      .from('xadrez_leaderboard')
      .select('*')
      .ilike('player_name', cleanName)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const wins = existing.wins + (result === 'win' ? 1 : 0);
      const draws = existing.draws + (result === 'draw' ? 1 : 0);
      const losses = existing.losses + (result === 'loss' ? 1 : 0);
      const points = wins * 3 + draws * 1;

      await supabase
        .from('xadrez_leaderboard')
        .update({
          wins,
          draws,
          losses,
          points,
          player_id: playerId || existing.player_id,
          last_match_mode: mode,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('xadrez_leaderboard').insert({
        player_id: playerId,
        player_name: cleanName,
        wins: result === 'win' ? 1 : 0,
        draws: result === 'draw' ? 1 : 0,
        losses: result === 'loss' ? 1 : 0,
        points: result === 'win' ? 3 : result === 'draw' ? 1 : 0,
        last_match_mode: mode
      });
    }
  } catch {
    // ignore
  }
}

// ==========================================
// 2. RANKING DE DAMAS
// ==========================================
export interface DamasLeaderboardEntry {
  id: string;
  player_id?: string | null;
  player_name: string;
  wins: number;
  losses: number;
  captures: number;
  points: number; // (wins * 3 + captures)
  last_match_mode?: string;
  updated_at?: string;
}

const LOCAL_DAMAS_LEADERBOARD = 'kito_arcade_damas_leaderboard';

export async function fetchDamasLeaderboard(limit = 50): Promise<DamasLeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('damas_leaderboard')
      .select('*')
      .order('points', { ascending: false })
      .order('wins', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as DamasLeaderboardEntry[];
    }
  } catch {
    // fallback
  }

  // Fallback Local
  try {
    const raw = localStorage.getItem(LOCAL_DAMAS_LEADERBOARD);
    if (raw) {
      const list: DamasLeaderboardEntry[] = JSON.parse(raw);
      list.sort((a, b) => b.points - a.points || b.wins - a.wins);
      return list.slice(0, limit);
    }
  } catch {
    // ignore
  }

  return [];
}

export async function recordDamasMatch(
  playerName: string,
  result: 'win' | 'loss',
  capturesCount = 0,
  mode: 'ia' | 'online' = 'ia'
): Promise<void> {
  const cleanName = playerName.trim() || 'Jogador Anônimo';
  const player = getCurrentPlayer();
  const playerId = player && player.player_name_display.toLowerCase() === cleanName.toLowerCase() ? player.id : null;

  // 1. Atualizar ou Inserir Localmente
  try {
    const list: DamasLeaderboardEntry[] = JSON.parse(localStorage.getItem(LOCAL_DAMAS_LEADERBOARD) || '[]');
    let entry = list.find((e) => e.player_name.toLowerCase() === cleanName.toLowerCase());
    if (!entry) {
      entry = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        player_id: playerId,
        player_name: cleanName,
        wins: 0,
        losses: 0,
        captures: 0,
        points: 0,
        last_match_mode: mode,
        updated_at: new Date().toISOString()
      };
      list.push(entry);
    }
    if (result === 'win') entry.wins += 1;
    else entry.losses += 1;
    entry.captures += capturesCount;
    entry.points = entry.wins * 3 + entry.captures;
    entry.last_match_mode = mode;
    entry.updated_at = new Date().toISOString();

    list.sort((a, b) => b.points - a.points || b.wins - a.wins);
    localStorage.setItem(LOCAL_DAMAS_LEADERBOARD, JSON.stringify(list.slice(0, 100)));
  } catch {
    // ignore
  }

  // 2. Atualizar no Supabase
  try {
    const { data: existing } = await supabase
      .from('damas_leaderboard')
      .select('*')
      .ilike('player_name', cleanName)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const wins = existing.wins + (result === 'win' ? 1 : 0);
      const losses = existing.losses + (result === 'loss' ? 1 : 0);
      const captures = (existing.captures || 0) + capturesCount;
      const points = wins * 3 + captures;

      await supabase
        .from('damas_leaderboard')
        .update({
          wins,
          losses,
          captures,
          points,
          player_id: playerId || existing.player_id,
          last_match_mode: mode,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('damas_leaderboard').insert({
        player_id: playerId,
        player_name: cleanName,
        wins: result === 'win' ? 1 : 0,
        losses: result === 'loss' ? 1 : 0,
        captures: capturesCount,
        points: (result === 'win' ? 3 : 0) + capturesCount,
        last_match_mode: mode
      });
    }
  } catch {
    // ignore
  }
}
