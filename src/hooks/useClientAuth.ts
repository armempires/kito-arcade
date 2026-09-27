import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ClientItem } from '../types/crm';

interface UseClientAuthReturn {
  clientUser: any | null;
  clientProfile: ClientItem | null;
  isProfileComplete: boolean;
  isLoading: boolean;
  error: string;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ClientItem>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export function useClientAuth(): UseClientAuthReturn {
  const [clientUser, setClientUser] = useState<any | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (userId: string) => {
    try {
      // 1. Tenta buscar diretamente por portal_user_id (mais recente primeiro)
      const { data: userRows } = await supabase
        .from('clients')
        .select('*')
        .eq('portal_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      let data = userRows && userRows.length > 0 ? userRows[0] : null;

      // 2. Se não encontrou por portal_user_id, busca pelo email da sessão e vincula
      if (!data) {
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email?.trim().toLowerCase();

        if (userEmail) {
          const { data: emailRows } = await supabase
            .from('clients')
            .select('*')
            .ilike('email', userEmail)
            .order('created_at', { ascending: false })
            .limit(1);

          const byEmail = emailRows && emailRows.length > 0 ? emailRows[0] : null;

          if (byEmail) {
            data = byEmail;
            // Vincula o portal_user_id no banco
            await supabase
              .from('clients')
              .update({ portal_user_id: userId, has_portal_access: true })
              .eq('id', byEmail.id);
          } else {
            // 3. Cria automaticamente o perfil do cliente apenas se realmente não existir
            const userName = sessionData?.session?.user?.user_metadata?.name || userEmail.split('@')[0];
            const { data: newClient } = await supabase
              .from('clients')
              .insert({
                name: userName,
                email: userEmail,
                pet_name: 'Kito Arcade',
                phone: '',
                portal_user_id: userId,
                has_portal_access: true,
              })
              .select('*')
              .single();

            if (newClient) data = newClient;
          }
        }
      }

      if (data) {
        setClientProfile(data as ClientItem);
      } else {
        setClientProfile(null);
      }
    } catch (e) {
      console.error('Erro ao carregar perfil do cliente:', e);
      setClientProfile(null);
    }
  }, []);

  useEffect(() => {
    // Verifica sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setClientUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Ouve mudanças de sessão
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setClientUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setClientProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError('');
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError('E-mail ou senha incorretos.');
        return false;
      }
      if (data.user) {
        const userRole = data.user.user_metadata?.role;
        if (userRole !== 'client') {
          setError('Acesso restrito ao portal do cliente. Use o login administrativo.');
          await supabase.auth.signOut();
          return false;
        }
        await loadProfile(data.user.id);
      }
      return true;
    } catch {
      setError('Erro ao conectar. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setClientUser(null);
    setClientProfile(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<ClientItem>): Promise<boolean> => {
    if (!clientUser) return false;
    setError('');

    const { error: err } = await supabase
      .from('clients')
      .update({ ...data, profile_completed: true })
      .eq('portal_user_id', clientUser.id);

    if (err) {
      setError('Erro ao salvar. Tente novamente.');
      return false;
    }

    await loadProfile(clientUser.id);
    return true;
  }, [clientUser, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (clientUser) await loadProfile(clientUser.id);
  }, [clientUser, loadProfile]);

  return {
    clientUser,
    clientProfile,
    isProfileComplete: clientProfile?.profile_completed ?? false,
    isLoading,
    error,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };
}
