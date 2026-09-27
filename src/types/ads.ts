export type AdFormat = 'horizontal' | 'sidebar';

export interface AdTargetPage {
  id: string;
  name: string;
  path: string; // Ex: '/', '/#play=*', '/#play=srv-*', 'sidebar', '/blog', '/blog/*', '/portal'
  description?: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  subtitle?: string;
  format: AdFormat;
  imageUrl: string;
  ctaText: string;
  targetUrl: string; // Ex: '/nexus', '/blog', ou link externo
  badgeText?: string;
  isActive: boolean;
  durationSeconds: number; // Padrão: 10 segundos
  targetPages: string[]; // Lista de caminhos onde deve ser exibido
  createdAt: string;
}

export const ECOSYSTEM_PAGES: AdTargetPage[] = [
  { id: 'page-home', name: 'Página Inicial (Catálogo & Vitrine)', path: '/', description: 'Página principal do Kito Arcade' },
  { id: 'page-player', name: 'Player & Exibição de Jogos/Apps', path: '/#play=*', description: 'Tela de execução e teste dos produtos/jogos' },
  { id: 'page-services-view', name: 'Páginas dos Produtos & Serviços', path: '/#play=srv-*', description: 'Página detalhada de serviços com esteira e planos' },
  { id: 'page-blog-hub', name: 'Blog Hub (Lista de Artigos)', path: '/blog', description: 'Feed principal de notícias e artigos' },
  { id: 'page-blog-posts', name: 'Artigos Individuais do Blog', path: '/blog/*', description: 'Página de leitura de cada artigo' },
  { id: 'page-portal', name: 'Área do Cliente (Portal)', path: '/portal', description: 'Painel exclusivo de clientes e pagamentos' },
  { id: 'page-nexus', name: 'Página Dedicada Nexus', path: '/nexus', description: 'Ambiente direto do teste psicométrico' },
  { id: 'page-servicos', name: 'Seção de Serviços & Orçamentos', path: '/#secao-servicos', description: 'Área comercial com pacotes e agendamento' },
];
