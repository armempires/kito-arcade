import { supabase } from './supabase';

export type ArcadeGameType = 'tetris' | 'damas' | 'xadrez';
export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';

export interface ArcadeRoom {
  id: string;
  game_type: ArcadeGameType;
  code: string;
  host_session_id: string;
  host_name: string;
  guest_session_id: string | null;
  guest_name: string | null;
  max_players: number;
  is_private: boolean;
  status: RoomStatus;
  game_state: any;
  winner: string | null;
  created_at: string;
  updated_at: string;
  last_heartbeat: string;
}

// 1. Unique Browser Session Identifier
export function getSessionId(): string {
  try {
    let sid = localStorage.getItem('kito_arcade_session_id');
    if (!sid) {
      sid = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('kito_arcade_session_id', sid);
    }
    return sid;
  } catch {
    return 'usr_' + Math.random().toString(36).substring(2, 9);
  }
}

// 2. Player Nickname
export function getPlayerName(): string {
  try {
    const saved = localStorage.getItem('kito_arcade_player_name');
    if (saved && saved.trim()) return saved.trim();
    const randomName = 'Jogador_' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('kito_arcade_player_name', randomName);
    return randomName;
  } catch {
    return 'Jogador_' + Math.floor(1000 + Math.random() * 9000);
  }
}

export function setPlayerName(name: string): void {
  try {
    if (name.trim()) {
      localStorage.setItem('kito_arcade_player_name', name.trim());
    }
  } catch {
    // ignore
  }
}

// Generate code with game prefix (e.g., TET-942, DAM-518, XAD-307)
export function generateRoomCode(gameType: ArcadeGameType): string {
  const prefix = gameType === 'tetris' ? 'TET' : gameType === 'damas' ? 'DAM' : 'XAD';
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
}

// Active room ID in local state
let activeRoomId: string | null = null;

export function setActiveLocalRoom(id: string | null) {
  activeRoomId = id;
  if (id) {
    sessionStorage.setItem('kito_active_room_id', id);
  } else {
    sessionStorage.removeItem('kito_active_room_id');
  }
}

export function getActiveLocalRoomId(): string | null {
  if (activeRoomId) return activeRoomId;
  try {
    return sessionStorage.getItem('kito_active_room_id');
  } catch {
    return null;
  }
}

// Check if user already has an active room
export async function checkActiveSessionRoom(): Promise<ArcadeRoom | null> {
  const sessionId = getSessionId();
  try {
    const { data, error } = await supabase
      .from('arcade_multiplayer_rooms')
      .select('*')
      .in('status', ['waiting', 'playing'])
      .or(`host_session_id.eq.${sessionId},guest_session_id.eq.${sessionId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setActiveLocalRoom(null);
      return null;
    }

    setActiveLocalRoom(data.id);
    return data as ArcadeRoom;
  } catch {
    return null;
  }
}

// Create a new room
export async function createArcadeRoom(
  gameType: ArcadeGameType,
  isPrivate = false,
  customName?: string
): Promise<{ room: ArcadeRoom | null; error?: string }> {
  const sessionId = getSessionId();
  const hostName = (customName && customName.trim()) || getPlayerName();
  setPlayerName(hostName);

  // Concurrency Guard: Check if already in an active room
  const existing = await checkActiveSessionRoom();
  if (existing) {
    // If waiting and created by self, cancel it first or return error
    if (existing.status === 'waiting' && existing.host_session_id === sessionId) {
      await leaveArcadeRoom(existing.id);
    } else if (existing.status === 'playing') {
      return { 
        room: null, 
        error: `Você já está participando de uma partida ativa (${existing.code}). Saia da partida atual antes de criar outra.` 
      };
    }
  }

  const code = generateRoomCode(gameType);

  try {
    const { data, error } = await supabase
      .from('arcade_multiplayer_rooms')
      .insert({
        game_type: gameType,
        code,
        host_session_id: sessionId,
        host_name: hostName,
        is_private: isPrivate,
        status: 'waiting',
        max_players: 2,
        game_state: {}
      })
      .select()
      .single();

    if (error || !data) {
      return { room: null, error: error?.message || 'Falha ao criar sala.' };
    }

    setActiveLocalRoom(data.id);
    return { room: data as ArcadeRoom };
  } catch (err: any) {
    return { room: null, error: err?.message || 'Erro inesperado ao conectar.' };
  }
}

// Join an existing room
export async function joinArcadeRoom(
  roomIdentifier: string, // code or id
  customName?: string
): Promise<{ room: ArcadeRoom | null; error?: string }> {
  const sessionId = getSessionId();
  const guestName = (customName && customName.trim()) || getPlayerName();
  setPlayerName(guestName);

  // Check if room exists
  const isUuid = roomIdentifier.includes('-');
  let query = supabase.from('arcade_multiplayer_rooms').select('*');
  if (roomIdentifier.length <= 8 && !roomIdentifier.includes('-')) {
    query = query.ilike('code', `%${roomIdentifier}%`);
  } else {
    query = query.or(`id.eq.${roomIdentifier},code.eq.${roomIdentifier}`);
  }

  const { data: targetRoom, error: fetchErr } = await query.maybeSingle();

  if (fetchErr || !targetRoom) {
    return { room: null, error: 'Sala não encontrada. Verifique o código.' };
  }

  // Anti Self-Play Check
  if (targetRoom.host_session_id === sessionId) {
    if (targetRoom.status === 'waiting') {
      setActiveLocalRoom(targetRoom.id);
      return { room: targetRoom as ArcadeRoom };
    }
    return { room: null, error: 'Você já é o criador desta sala.' };
  }

  if (targetRoom.status !== 'waiting') {
    return { room: null, error: 'Esta sala já está em andamento ou foi finalizada.' };
  }

  // Concurrency Guard: Check if player is already in another match
  const existing = await checkActiveSessionRoom();
  if (existing && existing.id !== targetRoom.id) {
    if (existing.status === 'waiting') {
      await leaveArcadeRoom(existing.id);
    } else {
      return { 
        room: null, 
        error: `Você já está participando de uma partida ativa (${existing.code}). Finalize-a antes de entrar em outra.` 
      };
    }
  }

  // Update room to playing with guest
  const { data: updatedRoom, error: updateErr } = await supabase
    .from('arcade_multiplayer_rooms')
    .update({
      guest_session_id: sessionId,
      guest_name: guestName,
      status: 'playing',
      updated_at: new Date().toISOString()
    })
    .eq('id', targetRoom.id)
    .eq('status', 'waiting') // concurrency atomic lock
    .select()
    .single();

  if (updateErr || !updatedRoom) {
    return { room: null, error: 'Outro jogador já entrou nesta sala ou a sala foi encerrada.' };
  }

  setActiveLocalRoom(updatedRoom.id);
  return { room: updatedRoom as ArcadeRoom };
}

// Leave / Cancel Room
export async function leaveArcadeRoom(roomId: string): Promise<void> {
  const sessionId = getSessionId();
  try {
    const { data: currentRoom } = await supabase
      .from('arcade_multiplayer_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (!currentRoom) {
      setActiveLocalRoom(null);
      return;
    }

    if (currentRoom.status === 'waiting') {
      // If waiting, cancel the room so it doesn't linger as ghost
      await supabase
        .from('arcade_multiplayer_rooms')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', roomId);
    } else if (currentRoom.status === 'playing') {
      // Mark as finished with the other player as winner by resignation
      const winner = currentRoom.host_session_id === sessionId 
        ? currentRoom.guest_name 
        : currentRoom.host_name;

      await supabase
        .from('arcade_multiplayer_rooms')
        .update({ 
          status: 'finished', 
          winner: winner || 'Oponente desconectou',
          updated_at: new Date().toISOString() 
        })
        .eq('id', roomId);
    }
  } catch (err) {
    console.error('Erro ao sair da sala:', err);
  } finally {
    setActiveLocalRoom(null);
  }
}

// Fetch open rooms for lobby listing
export async function fetchOpenRooms(gameType?: ArcadeGameType): Promise<ArcadeRoom[]> {
  try {
    let query = supabase
      .from('arcade_multiplayer_rooms')
      .select('*')
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false })
      .limit(30);

    if (gameType) {
      query = query.eq('game_type', gameType);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as ArcadeRoom[];
  } catch {
    return [];
  }
}

// Clean up waiting rooms on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const activeId = getActiveLocalRoomId();
    const sessionId = getSessionId();
    if (activeId && sessionId) {
      // Send beacon or synchronous cancel
      const url = `https://syxdhtlxafgbxflkrddp.supabase.co/rest/v1/arcade_multiplayer_rooms?id=eq.${activeId}&status=eq.waiting&host_session_id=eq.${sessionId}`;
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eGRodGx4YWZnYnhmbGtyZGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTY3MDcsImV4cCI6MjEwNDE3MjcwN30.avfziPMfvmzSdDtKGg9lwhE2v2r1S31hwjUwGT97nwg';
      
      const payload = JSON.stringify({ status: 'cancelled' });
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon?.(url, blob);
    }
  });
}
