import { useState, useEffect, useCallback } from 'react';
import { AdCampaign, AdFormat, ECOSYSTEM_PAGES } from '../types/ads';

const STORAGE_KEY = 'kito_arcade_ad_campaigns_v2';
const ADS_UPDATED_EVENT = 'kito_arcade_ads_updated';

export const DEFAULT_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'nexus-horizontal-promo',
    title: 'Nexus Cognição & Teste de Q.I.',
    subtitle: 'Avaliação psicométrica de alta precisão baseada em matrizes de Raven e lógica analítica. Conheça seu potencial.',
    format: 'horizontal',
    imageUrl: '/assets/nexus/nexus_banner_horizontal.png',
    ctaText: 'Fazer Teste Grátis',
    targetUrl: '/nexus',
    badgeText: 'Avaliação Cognitiva',
    isActive: true,
    durationSeconds: 10,
    targetPages: ECOSYSTEM_PAGES.map((p) => p.path),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'nexus-sidebar-promo',
    title: 'Teste seu Q.I. com Nexus',
    subtitle: 'Desafie seu raciocínio espacial, lógica e memória em uma experiência neurocientífica imersiva.',
    format: 'sidebar',
    imageUrl: '/assets/nexus/nexus_banner_sidebar.png',
    ctaText: 'Iniciar Avaliação',
    targetUrl: '/nexus',
    badgeText: 'Destaque Kito Arcade',
    isActive: true,
    durationSeconds: 10,
    targetPages: ECOSYSTEM_PAGES.map((p) => p.path),
    createdAt: new Date().toISOString(),
  },
];

function loadStoredCampaigns(): AdCampaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('kito_arcade_ad_campaigns_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAMPAIGNS));
      return DEFAULT_CAMPAIGNS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Garantir que novas páginas como /#play=* estejam inclusas
      const updated = parsed.map((c: AdCampaign) => {
        const pages = Array.isArray(c.targetPages) ? c.targetPages : [];
        if (pages.length === 0) {
          return { ...c, targetPages: ECOSYSTEM_PAGES.map(p => p.path) };
        }
        if (!pages.includes('/#play=*')) {
          return { ...c, targetPages: [...pages, '/#play=*'] };
        }
        return c;
      });
      return updated;
    }
    return DEFAULT_CAMPAIGNS;
  } catch (err) {
    console.error('Falha ao carregar campanhas de anúncios:', err);
    return DEFAULT_CAMPAIGNS;
  }
}

export function isPageMatchingPattern(pattern: string, currentPath: string): boolean {
  if (!pattern) return false;

  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const current = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Página do player de jogos / apps (#play=...)
  if (hash.startsWith('#play=srv-')) {
    if (pattern === '/#play=srv-*' || pattern === '/#play=*') return true;
  } else if (hash.startsWith('#play=')) {
    if (pattern === '/#play=*') return true;
  }

  // Normalizar caminhos
  const normCurrent = current.length > 1 && current.endsWith('/') ? current.slice(0, -1) : current;
  const normPattern = pattern.length > 1 && pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;

  if (normPattern === normCurrent) return true;

  // Wildcards como /blog/*
  if (normPattern.endsWith('/*')) {
    const prefix = normPattern.slice(0, -2);
    return normCurrent.startsWith(prefix) && normCurrent !== prefix;
  }

  // Padrão com hash específico, ex: /#secao-servicos
  if (normPattern.includes('#')) {
    const basePattern = normPattern.split('#')[0] || '/';
    const targetHash = '#' + normPattern.split('#')[1];
    return normCurrent === basePattern && hash === targetHash;
  }

  return false;
}

export function useAdCampaigns() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(() => loadStoredCampaigns());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCampaigns(loadStoredCampaigns());
      }
    };

    const handleCustomUpdate = () => {
      setCampaigns(loadStoredCampaigns());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(ADS_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(ADS_UPDATED_EVENT, handleCustomUpdate);
    };
  }, []);

  const saveCampaigns = useCallback((newList: AdCampaign[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      setCampaigns(newList);
      window.dispatchEvent(new Event(ADS_UPDATED_EVENT));
    } catch (err) {
      console.error('Falha ao salvar campanhas:', err);
    }
  }, []);

  const addCampaign = useCallback(
    (data: Omit<AdCampaign, 'id' | 'createdAt'>) => {
      const newCampaign: AdCampaign = {
        ...data,
        id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      saveCampaigns([newCampaign, ...campaigns]);
      return newCampaign;
    },
    [campaigns, saveCampaigns]
  );

  const updateCampaign = useCallback(
    (id: string, updates: Partial<AdCampaign>) => {
      const updated = campaigns.map((camp) => (camp.id === id ? { ...camp, ...updates } : camp));
      saveCampaigns(updated);
    },
    [campaigns, saveCampaigns]
  );

  const deleteCampaign = useCallback(
    (id: string) => {
      const filtered = campaigns.filter((camp) => camp.id !== id);
      saveCampaigns(filtered);
    },
    [campaigns, saveCampaigns]
  );

  const toggleActive = useCallback(
    (id: string) => {
      const updated = campaigns.map((camp) =>
        camp.id === id ? { ...camp, isActive: !camp.isActive } : camp
      );
      saveCampaigns(updated);
    },
    [campaigns, saveCampaigns]
  );

  const resetToDefaults = useCallback(() => {
    saveCampaigns(DEFAULT_CAMPAIGNS);
  }, [saveCampaigns]);

  const getCampaignsForPage = useCallback(
    (path?: string, format?: AdFormat): AdCampaign[] => {
      const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
      return campaigns.filter((camp) => {
        if (!camp.isActive) return false;
        if (format && camp.format !== format) return false;

        // Se targetPages incluir a página atual ou algum padrão compatível
        const hasMatch = camp.targetPages.some((pattern) => isPageMatchingPattern(pattern, currentPath));
        return hasMatch;
      });
    },
    [campaigns]
  );

  return {
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    toggleActive,
    resetToDefaults,
    getCampaignsForPage,
  };
}
