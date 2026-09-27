export interface PlanPricing {
  name: string;
  price: string;
  period?: string;
  tag?: string;
  volume?: string;
  composition?: string[];
  features?: string[];
  isPopular?: boolean;
  highlight?: boolean;
  details?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Jogos & Arcade' | 'SaaS & Gestão' | 'Apps Mobile' | 'Sites & Portfólios' | 'Criação de Sites e Apps' | 'Gestão de Redes Sociais & Automação' | 'Automação';
  categorySlug: 'jogos' | 'saas' | 'mobile' | 'sites' | 'servicos' | 'marketing' | 'automacao';
  isHero?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  badge: string;
  image: string;
  rating: number;
  plays: string;
  description: string;
  tech: string[];
  localPath: string;
  status: 'Pronto para Execução' | 'Em Fila (Unity WebGL)' | 'SaaS / Web Ativo' | 'App Mobile (Expo)' | 'Serviço sob Demanda' | 'Pacote Oficial';
  pricing?: {
    type: 'on_demand' | 'fixed_monthly' | 'packages';
    plans?: PlanPricing[];
    features?: string[];
  };
  ctaLabel?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  count: number;
  section?: 'portfolio' | 'services';
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Todos os Projetos', slug: 'all', iconName: 'LayoutGrid', count: 31 },
  { id: 'jogos', name: 'Jogos & Arcade', slug: 'jogos', iconName: 'Gamepad2', count: 6, section: 'portfolio' },
  { id: 'saas', name: 'SaaS & Gestão', slug: 'saas', iconName: 'Layers', count: 5, section: 'portfolio' },
  { id: 'mobile', name: 'Apps Mobile', slug: 'mobile', iconName: 'Smartphone', count: 4, section: 'portfolio' },
  { id: 'sites', name: 'Sites & Portfólios', slug: 'sites', iconName: 'Globe', count: 4, section: 'portfolio' },
  { id: 'servicos', name: 'Criação de Sites e Apps', slug: 'servicos', iconName: 'Wrench', count: 6, section: 'services' },
  { id: 'marketing', name: 'Gestão de Redes Sociais & Automação', slug: 'marketing', iconName: 'TrendingUp', count: 3, section: 'services' },
  { id: 'automacao', name: 'Automação', slug: 'automacao', iconName: 'Bot', count: 3, section: 'services' },
];

export const REAL_PROJECTS: ProjectItem[] = [
  // 1. JOGOS
  {
    id: 'arm-empires',
    title: 'Arm Empires - 3D FPS',
    category: 'Jogos & Arcade',
    categorySlug: 'jogos',
    isHero: true,
    isPopular: true,
    isNew: true,
    badge: 'EM CONSTRUÇÃO',
    image: '/assets/arm-empires-gameplay.png',
    rating: 4.9,
    plays: '10/12/2027',
    description: 'Jogo em construção, previsão para 10/12/2027. FPS tático multiplayer militar em Unity 3D com física realista, modos competitivos, armas customizáveis e mapas imersivos como Old Sea Port e Dark City.',
    tech: ['Unity 3D', 'C#', 'Photon Network', 'MFPS 2.0', 'WebGL Target'],
    localPath: 'Apps ou Saas/Fila/Arm Empires - Game Play',
    status: 'Em Fila (Unity WebGL)'
  },
  {
    id: 'neon-tetris',
    title: 'Neon Tetris WebGL',
    category: 'Jogos & Arcade',
    categorySlug: 'jogos',
    isPopular: true,
    isNew: false,
    badge: 'ARCADE RETRO',
    image: '/assets/covers/card_neon_tetris.jpg',
    rating: 4.8,
    plays: 'Pronto',
    description: 'A clássica experiência arcade reinventada com iluminação neon cyberpunk, efeitos de queda suave, combo multipliers e trilha sonora hipnótica.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'TypeScript', 'Supabase'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Jogos/Tetris',
    status: 'Pronto para Execução'
  },
  {
    id: 'jogo-xadrez',
    title: 'Jogo de Xadrez dos Mestres',
    category: 'Jogos & Arcade',
    categorySlug: 'jogos',
    isPopular: true,
    isNew: false,
    badge: 'ESTRATÉGIA',
    image: '/assets/covers/card_jogo_xadrez.jpg',
    rating: 4.8,
    plays: 'Pronto',
    description: 'Xadrez de alta fidelidade com motor de avaliação tática, marcação de lances válidos, xeque-mate automático e modos contra IA adaptativa.',
    tech: ['HTML5 Puro', 'CSS3 Avançado', 'JavaScript Nativo', 'Motor de Lógica'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Jogos/Jogo de Xadrez.html',
    status: 'Pronto para Execução'
  },
  {
    id: 'damas-classicas',
    title: 'Damas Masters Clássica',
    category: 'Jogos & Arcade',
    categorySlug: 'jogos',
    isPopular: true,
    isNew: false,
    badge: 'TABULEIRO',
    image: '/assets/covers/card_damas_masters.jpg',
    rating: 4.7,
    plays: 'Pronto',
    description: 'Partidas dinâmicas de Damas com regras internacionais, captura em cadeia, coroação de damas e interface tátil responsiva.',
    tech: ['HTML5 Puro', 'CSS3', 'JavaScript'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Jogos/Damas.html',
    status: 'Pronto para Execução'
  },
  {
    id: 'calculadora-cientifica',
    title: 'Calculadora Científica Pro',
    category: 'Jogos & Arcade',
    categorySlug: 'jogos',
    isPopular: false,
    isNew: false,
    badge: 'UTILITÁRIO',
    image: '/assets/covers/card_calculadora_pro.png',
    rating: 4.6,
    plays: 'Pronto',
    description: 'Ferramenta interativa de alta precisão com suporte a funções trigonométricas, logaritmos, radiciação e memória cumulativa.',
    tech: ['HTML5', 'CSS3 Grid', 'JavaScript Matemático'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Jogos/Calculadora Cientifica.html',
    status: 'Pronto para Execução'
  },
  {
    id: 'kito-esportes',
    title: 'Kito Esportes & Odds Engine',
    category: 'Jogos & Arcade',
    categorySlug: 'jogos',
    isPopular: false,
    isNew: true,
    badge: 'PROBABILIDADES',
    image: '/assets/covers/card_kito_esportes.png',
    rating: 4.7,
    plays: 'Pronto',
    description: 'Simulador e injetor de probabilidades (odds esportivas) em tempo real com análises estatísticas para jogos esportivos.',
    tech: ['JavaScript Engine', 'Odds Parser', 'Automação'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Jogos/Kito Esportes',
    status: 'Pronto para Execução'
  },

  // 2. SAAS & PLATAFORMAS WEB
  {
    id: 'kito-trainner-web',
    title: 'Kito Trainner - Web Platform',
    category: 'SaaS & Gestão',
    categorySlug: 'saas',
    isPopular: true,
    isNew: true,
    badge: 'FITNESS SAAS',
    image: '/assets/covers/card_kito_trainner_web.png',
    rating: 5.0,
    plays: 'Ativo',
    description: 'Sistema completo de alta performance para personal trainers e academias. Gestão biomecânica de treinos, evolução antropométrica de alunos e portal exclusivo.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Design System Kito', 'Supabase'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Kito Trainner - Web',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'agenda-crm',
    title: 'Kito Agenda Online & CRM',
    category: 'SaaS & Gestão',
    categorySlug: 'saas',
    isPopular: true,
    isNew: true,
    badge: 'AGENDAMENTO & CRM',
    image: '/assets/covers/card_kito_agenda.png',
    rating: 4.9,
    plays: 'Ativo',
    description: 'Fluxo em 5 etapas para marcação online de horários com autenticação OTP via e-mail e painel CRM de controle de profissionais e agendamentos.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Resend OTP', 'Edge Functions'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Agenda',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'gestor-os-web',
    title: 'Gestor OS - Ordens de Serviço Web',
    category: 'SaaS & Gestão',
    categorySlug: 'saas',
    isPopular: true,
    isNew: false,
    badge: 'ERP & ASAAS',
    image: '/assets/covers/card_gestor_os_web.png',
    rating: 4.9,
    plays: 'Ativo',
    description: 'Plataforma empresarial para emissão e acompanhamento de Ordens de Serviço técnicas, orçamentos, estoque e faturamento Asaas.',
    tech: ['React Native / Expo Web', 'Tailwind', 'Asaas Billing', 'Supabase'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Gestor OS - Web',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'gestor-mail-marketing',
    title: 'Gestor de Mail Marketing',
    category: 'SaaS & Gestão',
    categorySlug: 'saas',
    isPopular: false,
    isNew: false,
    badge: 'EMAIL MARKETING',
    image: '/assets/covers/card_mail_marketing.png',
    rating: 4.8,
    plays: 'Ativo',
    description: 'Solução para criação e disparo segmentado de campanhas de e-mail marketing com rastreamento em tempo real de aberturas e cliques.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Automação de Campanhas'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Gestor de Mail Marketing',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'teste-qi',
    title: 'Teste de Q.I. Cognitivo Web',
    category: 'SaaS & Gestão',
    categorySlug: 'saas',
    isPopular: true,
    isNew: true,
    badge: 'QUIZ COGNITIVO',
    image: '/assets/covers/card_teste_qi.png',
    rating: 4.9,
    plays: 'Ativo',
    description: 'Bateria de 30 questões de raciocínio lógico e dedução de padrões com emissão instantânea de pontuação calculada por percentil.',
    tech: ['React', 'Node.js', 'Express', 'Supabase Database'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Teste de Q.I - Web',
    status: 'SaaS / Web Ativo'
  },

  // 3. APPS MOBILE
  {
    id: 'kito-trainner-aluno-app',
    title: 'KTO - ALUNO',
    category: 'Apps Mobile',
    categorySlug: 'mobile',
    isPopular: true,
    isNew: true,
    badge: 'ALUNO',
    image: '/assets/covers/card_kto_aluno.png',
    rating: 4.9,
    plays: 'Mobile',
    description: 'Aplicativo mobile com treinos interativos, fichas personalizadas, vídeos demonstrativos de execução biomecânica e acompanhamento de cargas.',
    tech: ['React Native', 'Expo', 'TypeScript', 'Tailwind/NativeWind'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/App/Kito Trainner - Aluno App',
    status: 'App Mobile (Expo)'
  },
  {
    id: 'kito-trainner-personal-app',
    title: 'KTO - PERSONAL',
    category: 'Apps Mobile',
    categorySlug: 'mobile',
    isPopular: true,
    isNew: false,
    badge: 'PERSONAL',
    image: '/assets/covers/card_kto_personal.png',
    rating: 4.9,
    plays: 'Mobile',
    description: 'Aplicativo do treinador para montagem ágil de treinos, ajuste de periodizações e acompanhamento de adesão dos alunos.',
    tech: ['React Native', 'Expo', 'TypeScript'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/App/Kito Trainner - Personal App',
    status: 'App Mobile (Expo)'
  },
  {
    id: 'kito-trainner-admin-app',
    title: 'KTO - ADM',
    category: 'Apps Mobile',
    categorySlug: 'mobile',
    isPopular: false,
    isNew: false,
    badge: 'ADM',
    image: '/assets/covers/card_kto_adm.png',
    rating: 4.8,
    plays: 'Mobile',
    description: 'Controle executivo e gerencial de alunos ativos, mensalidades, faturamento e dados administrativos em tempo real.',
    tech: ['React Native', 'Expo', 'TypeScript'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/App/Kito Trainner - Admin App',
    status: 'App Mobile (Expo)'
  },
  {
    id: 'gestor-os-app',
    title: 'Gestor OS - Mobile App',
    category: 'Apps Mobile',
    categorySlug: 'mobile',
    isPopular: true,
    isNew: false,
    badge: 'APP TÉCNICO',
    image: '/assets/covers/card_gestor_os_mobile.png',
    rating: 4.8,
    plays: 'Mobile',
    description: 'App de campo para técnicos: assinatura na tela, anexo de fotos da ordem de serviço, checklist e conclusão de atendimentos.',
    tech: ['React Native', 'Expo', 'Drizzle ORM', 'Asaas Sync'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/App/Gestor_OS_App',
    status: 'App Mobile (Expo)'
  },

  // 4. SITES & PORTFÓLIOS
  {
    id: 'advocacia-web',
    title: 'Advocacia - Web Jurídica',
    category: 'Sites & Portfólios',
    categorySlug: 'sites',
    isPopular: false,
    isNew: false,
    badge: 'JURÍDICO',
    image: '/assets/covers/card_advocacia_web.png',
    rating: 4.8,
    plays: 'Online',
    description: 'Landing page premium para advogados com posicionamento institucional, áreas de atuação e captação de clientes.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Responsivo'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Advocacia - Web',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'petshop-web',
    title: 'PetShop - Web & Agendamento',
    category: 'Sites & Portfólios',
    categorySlug: 'sites',
    isPopular: false,
    isNew: false,
    badge: 'PET SHOP',
    image: '/assets/covers/card_petshop_web.png',
    rating: 4.7,
    plays: 'Online',
    description: 'Portal completo para estética animal, clínica veterinária e banho & tosa com agendamento direto.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/PetShop  - Web',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'tatoo-web-1',
    title: 'Tattoo Studio - Web (Modelo 1)',
    category: 'Sites & Portfólios',
    categorySlug: 'sites',
    isPopular: false,
    isNew: false,
    badge: 'BLACKWORK',
    image: '/assets/covers/card_tattoo_modelo1.png',
    rating: 4.8,
    plays: 'Online',
    description: 'Vitrine autoral para estúdios de tatuagem com portfólio visual, bio dos artistas e canal de orçamentos.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Tatoo - Web',
    status: 'SaaS / Web Ativo'
  },
  {
    id: 'tatoo-web-2',
    title: 'Tattoo Editorial - Web (Modelo 2)',
    category: 'Sites & Portfólios',
    categorySlug: 'sites',
    isPopular: true,
    isNew: true,
    badge: 'EDITORIAL ART',
    image: '/assets/covers/card_tattoo_modelo2.png',
    rating: 4.9,
    plays: 'Online',
    description: 'Projeto editorial e contemporâneo de tatuagem com tipografia refinada e showcase interativo de projetos autorais.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Shadcn UI'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Tatoo - Web (Modelo 2)',
    status: 'SaaS / Web Ativo'
  },

  // ==========================================
  // 5. CRIAÇÃO DE SITES E APPS (Sem Preço // Foco em Agendamento)
  // ==========================================
  {
    id: 'srv-agenda',
    title: 'Sistema de Agendamento Online & CRM',
    category: 'Criação de Sites e Apps',
    categorySlug: 'servicos',
    isPopular: true,
    isNew: true,
    badge: 'AGENDAMENTO & CRM',
    image: '/assets/covers/card_srv_agenda.png',
    rating: 5.0,
    plays: 'Disponível',
    description: 'Implantação completa de sistema de agendamento online integrado com painel CRM, confirmação em duas etapas via OTP (Resend), gestão multi-profissionais, grade de horários personalizável e sincronização em nuvem.',
    tech: ['React', 'Supabase', 'Resend OTP', 'Tailwind CSS', 'PostgreSQL RLS'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Kito Arcade/Agenda Kito',
    status: 'Serviço sob Demanda',
    ctaLabel: 'Agendar Demonstração'
  },
  {
    id: 'srv-sites',
    title: 'Desenvolvimento de sites modernos e landing pages 3D',
    category: 'Criação de Sites e Apps',
    categorySlug: 'servicos',
    isPopular: true,
    isNew: true,
    badge: '3D JS & WEBGL',
    image: '/assets/covers/card_srv_sites.png',
    rating: 4.9,
    plays: 'Disponível',
    description: 'Projetos com design exclusivo, velocidade máxima, integração com pagamentos, CRM para agendamentos, hospedagem e banco de dados gratuitos, sem mensalidade com foco total em gerar clientes para o seu negócio.',
    tech: ['Three.js', 'WebGL Nativo', 'GSAP', 'React', 'Tailwind CSS'],
    localPath: 'Kito Expert - Institucional',
    status: 'Serviço sob Demanda',
    ctaLabel: 'Solicitar Projeto'
  },
  {
    id: 'srv-mobile',
    title: 'Aplicativos Mobile (Android & iOS)',
    category: 'Criação de Sites e Apps',
    categorySlug: 'servicos',
    isPopular: true,
    isNew: false,
    badge: 'MOBILE NATIVO',
    image: '/assets/covers/card_srv_mobile.png',
    rating: 4.9,
    plays: 'Disponível',
    description: 'Desenvolvimento de aplicativos nativos para Android e iOS com publicação homologada na Google Play e Apple App Store. Notificações push, geolocalização, câmera, biometria e sincronização offline-first.',
    tech: ['React Native', 'Expo SDK 52+', 'TypeScript', 'Supabase Auth', 'Push API'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/App',
    status: 'Serviço sob Demanda',
    ctaLabel: 'Criar Meu App'
  },
  {
    id: 'srv-crm',
    title: 'Sistemas de CRM & Gestão Comercial',
    category: 'Criação de Sites e Apps',
    categorySlug: 'servicos',
    isPopular: true,
    isNew: false,
    badge: 'CRM & FUNIL',
    image: '/assets/covers/card_srv_crm.png',
    rating: 4.8,
    plays: 'Disponível',
    description: 'Sistemas sob medida para gestão comercial e operacional da sua equipe. Funil estilo Kanban com arrastar e soltar, histórico completo de clientes, metas por vendedor e relatórios de conversão em tempo real.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'WebSockets'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web/Portifolio de Sites e Saas/Gestor OS - Web',
    status: 'Serviço sob Demanda',
    ctaLabel: 'Agendar Apresentação'
  },
  {
    id: 'srv-saas',
    title: 'Desenvolvimento de SaaS Sob Medida',
    category: 'Criação de Sites e Apps',
    categorySlug: 'servicos',
    isPopular: true,
    isNew: false,
    badge: 'CLOUD MULTI-TENANT',
    image: '/assets/covers/card_srv_saas.png',
    rating: 4.9,
    plays: 'Disponível',
    description: 'Engenharia completa para seu software como serviço (SaaS). Arquitetura multi-tenant escalável, cobrança recorrente automatizada (Asaas/Stripe), painel superadmin e entrega do código-fonte proprietário.',
    tech: ['Next.js / Vite', 'Supabase RLS', 'Asaas API', 'Stripe Billing', 'Docker'],
    localPath: 'Apps ou Saas/Prontos/Portifolio/Web',
    status: 'Serviço sob Demanda',
    ctaLabel: 'Discutir Projeto'
  },
  {
    id: 'srv-ia',
    title: 'Agentes de I.A & Chatbots Autônomos',
    category: 'Criação de Sites e Apps',
    categorySlug: 'servicos',
    isPopular: true,
    isNew: true,
    badge: 'I.A AUTÔNOMA',
    image: '/assets/covers/card_srv_ia.png',
    rating: 5.0,
    plays: 'Disponível',
    description: 'Atendentes virtuais inteligentes treinados com as regras e conhecimento do seu negócio para o Direct do Instagram. Qualificação automática de clientes, respostas humanizadas e agendamento instantâneo 24/7.',
    tech: ['LLM Neural Engine', 'Instagram Graph API', 'Webhooks'],
    localPath: 'Kito Expert - Institucional',
    status: 'Serviço sob Demanda',
    ctaLabel: 'Testar Agente I.A'
  },

  // ==========================================
  // 6. GESTÃO DE REDES SOCIAIS & AUTOMAÇÃO (Com Preços Transparentes nos Detalhes)
  // ==========================================
  {
    id: 'mkt-organico',
    title: 'Gestão Orgânica + Automações de IA',
    category: 'Gestão de Redes Sociais & Automação',
    categorySlug: 'marketing',
    isPopular: true,
    isNew: true,
    badge: 'CRIATIVOS + AGENDAMENTO',
    image: '/assets/covers/card_mkt_organico.png',
    rating: 5.0,
    plays: 'R$ 500 - R$ 900',
    description: 'Gestão orgânica estratégica completa: criação de criativos de imagem profissionais, vídeos dinâmicos, agendamento programado contínuo e chatbots de IA para o Direct do Instagram 24/7.',
    tech: ['Design Gráfico', 'Copywriting', 'Agendamento Social', 'Chatbot Direct Instagram', 'I.A 24/7'],
    localPath: 'Marketing',
    status: 'Pacote Oficial',
    pricing: {
      type: 'fixed_monthly',
      features: [
        'Automação com Chatbot de IA para o Direct do Instagram',
        'Agendamento automático contínuo das postagens criadas'
      ],
      plans: [
        {
          name: 'Plano Start Orgânico',
          price: 'R$ 500,00',
          period: '/mês',
          tag: 'Ideal para quem está começando',
          volume: '10 Posts Agendados / mês',
          composition: ['8 Criativos de Imagem', '1 Vídeo', '1 Story'],
          features: [
            '8 Criativos de Imagem + 1 Vídeo + 1 Story',
            'Automação com Chatbot de IA para o Direct do Instagram',
            'Agendamento automático contínuo das postagens criadas',
            'Diagnóstico de Perfil Social (Auditoria de bio e concorrência)',
            'Atendimento oficial no Direct do Instagram 24/7',
            'Relatório mensal de métricas e alcance'
          ]
        },
        {
          name: 'Plano Pro Orgânico',
          price: 'R$ 700,00',
          period: '/mês',
          tag: 'O mais escolhido // Crescimento acelerado',
          volume: '16 Posts Agendados / mês',
          composition: ['12 Criativos de Imagem', '2 Vídeos', '2 Stories'],
          isPopular: true,
          highlight: true,
          features: [
            '12 Criativos de Imagem + 2 Vídeos + 2 Stories',
            'Automação com Chatbot de IA para o Direct do Instagram',
            'Agendamento automático contínuo das postagens criadas',
            'Diagnóstico de Perfil Social (Auditoria aprofundada de persona e nicho)',
            'Automação no Direct do Instagram 24/7 com qualificação e triagem de leads',
            'Linha editorial personalizada para autoridade de marca',
            'Relatório mensal de performance e conversões'
          ]
        },
        {
          name: 'Plano Scale Enterprise',
          price: 'R$ 900,00',
          period: '/mês',
          tag: 'Dominância Digital // Alta Escala',
          volume: '21+ Posts Agendados / mês',
          composition: ['16 Criativos de Imagem', '1 Story', '4 Vídeos Reels'],
          features: [
            '16 Criativos de Imagem + 1 Story + 4 Vídeos Reels',
            'Automação com Chatbot de IA para o Direct do Instagram',
            'Agendamento automático contínuo das postagens criadas',
            'Diagnóstico de Perfil Social Completo + Análise de Mercado 360°',
            'Automação no Direct do Instagram 24/7 integrada com CRM e alerta de vendas',
            'Criação contínua de Reels de alta retenção e viralização',
            'Relatório Executivo Mensal com Análise de ROI'
          ]
        }
      ]
    },
    ctaLabel: 'Ver Planos & Contratar'
  },
  {
    id: 'mkt-ugc',
    title: 'Vídeos UGC (Alta Conversão)',
    category: 'Gestão de Redes Sociais & Automação',
    categorySlug: 'marketing',
    isPopular: true,
    isNew: false,
    badge: 'PROVA SOCIAL 4K',
    image: '/assets/covers/card_mkt_ugc.png',
    rating: 4.9,
    plays: 'R$ 500 - R$ 1.150',
    description: 'Esteira de vídeos UGC (User Generated Content) gravados por criadores reais em 4K vertical com storytelling validado, ganchos de retenção e edição profissional com legendas dinâmicas para anúncios.',
    tech: ['Criadores Nativos', 'Vídeo 4K Vertical', 'Roteiro Psicológico', 'Legendas Dinâmicas'],
    localPath: 'Marketing',
    status: 'Pacote Oficial',
    pricing: {
      type: 'packages',
      plans: [
        {
          name: '1 Vídeo UGC',
          price: 'R$ 500,00',
          volume: '1 Vídeo Único de Alta Conversão',
          features: [
            'Roteiro estratégico focado em conversão',
            'Edição profissional com legendas dinâmicas',
            'Entrega em até 5 dias úteis',
            'Direitos de imagem perpétuos'
          ]
        },
        {
          name: '2 Vídeos UGC',
          price: 'R$ 800,00',
          volume: '2 Vídeos (R$ 400,00 / vídeo)',
          tag: 'Economia de R$ 200,00',
          features: [
            '2 Roteiros com ganchos distintos',
            'Edição dinâmica para Reels/TikTok',
            'Maior amostragem de criativos para testes A/B'
          ]
        },
        {
          name: '3 Vídeos UGC',
          price: 'R$ 1.000,00',
          volume: '3 Vídeos (R$ 333,33 / vídeo)',
          tag: 'Economia de R$ 500,00',
          features: [
            '3 Criadores ou abordagens exclusivas',
            'Testes de público e conversão rápida',
            'Formatos 9:16 prontos para campanhas'
          ]
        },
        {
          name: '4 Vídeos UGC',
          price: 'R$ 1.150,00',
          volume: '4 Vídeos (R$ 287,50 / vídeo)',
          tag: 'Melhor Oferta // Economia de R$ 850,00',
          isPopular: true,
          features: [
            '4 Vídeos em alta definição 4K',
            'Roteiros A/B/C/D para escala de anúncios',
            'Melhor retorno sobre investimento e menor custo unitário'
          ]
        }
      ]
    },
    ctaLabel: 'Ver Pacotes UGC'
  },
  {
    id: 'mkt-criativos',
    title: 'Criativos de Imagem Avulsos',
    category: 'Gestão de Redes Sociais & Automação',
    categorySlug: 'marketing',
    isPopular: false,
    isNew: false,
    badge: 'FEED & STORIES',
    image: '/assets/covers/card_mkt_criativos.png',
    rating: 4.8,
    plays: 'R$ 300 - R$ 800',
    description: 'Peças visuais profissionais em alta definição para tráfego pago, feed e carrosséis magnéticos de autoridade, prontas para veiculação no Meta Ads e redes sociais.',
    tech: ['Design Publicitário', 'Feed 1:1', 'Stories 9:16', 'Carrosséis', 'Testes A/B'],
    localPath: 'Marketing',
    status: 'Pacote Oficial',
    pricing: {
      type: 'packages',
      plans: [
        {
          name: 'Pacote Start Criativos',
          price: 'R$ 300,00',
          period: '/avulso',
          volume: '10 Posts Total',
          composition: ['8 Criativos de Imagens em Alta Resolução', '1 Vídeo Curto Editado', '1 Story Interativo'],
          features: [
            'Pacote essencial de mídia para atualização de feed e stories',
            'Design no padrão visual da sua marca'
          ]
        },
        {
          name: 'Pacote Growth Criativos',
          price: 'R$ 500,00',
          period: '/avulso',
          volume: '16 Posts Total',
          composition: ['12 Criativos de Imagens em Alta Resolução', '2 Vídeos Curtos Editados', '2 Stories Interativos'],
          isPopular: true,
          features: [
            'Volume intermediário para marcas com postagens regulares',
            'Arquivos prontos para publicação em Feed e Stories'
          ]
        },
        {
          name: 'Pacote Scale Criativos',
          price: 'R$ 800,00',
          period: '/avulso',
          volume: '21 Posts Total',
          composition: ['16 Criativos de Imagens em Alta Resolução', '4 Vídeos Reels de Alta Conversão', '1 Story Estratégico'],
          features: [
            'Volume robusto de conteúdo visual para o mês inteiro',
            'Formatos otimizados para Feed, Stories e Anúncios'
          ]
        }
      ]
    },
    ctaLabel: 'Escolher Pacote'
  },
  // 3. AUTOMAÇÃO (META API OFICIAL + MCP)
  {
    id: 'auto-instagram',
    title: 'Automação Direct & Comentários (Instagram Meta API)',
    category: 'Automação',
    categorySlug: 'automacao',
    isPopular: true,
    isNew: true,
    badge: 'META GRAPH API',
    image: '/assets/covers/card_auto_instagram.jpg',
    rating: 5.0,
    plays: 'R$ 350,00 por mês',
    description: 'Sistema avançado de automação inteligente para Direct e comentários no Instagram utilizando a Graph API oficial da Meta, webhook em tempo real, servidor externo dedicado e protocolo MCP (Model Context Protocol). Responde leads instantaneamente 24/7 sem risco de bloqueio.',
    tech: ['Meta Graph API', 'Webhooks Realtime', 'Servidor Cloud Externo', 'Protocolo MCP', 'Inteligência Artificial'],
    localPath: 'Automacao',
    status: 'Pacote Oficial',
    pricing: {
      type: 'packages',
      plans: [
        {
          name: 'Automação Instagram Direct & Comentários',
          price: 'R$ 350,00',
          period: 'por mês',
          features: [
            'Integração oficial via Meta Graph API (100% segura contra bloqueios)',
            'Resposta instantânea para quem comenta nos posts e Reels',
            'Envio automático do link do produto/oferta no Direct com CTA',
            'Servidor externo em nuvem dedicado para Webhooks e MCP 24/7',
            'Garantia técnica e monitoramento contínuo no Meta Business'
          ]
        }
      ]
    },
    ctaLabel: 'Contratar Automação Instagram'
  },
  {
    id: 'auto-whatsapp',
    title: 'Automação WhatsApp Cloud API Oficial + MCP',
    category: 'Automação',
    categorySlug: 'automacao',
    isPopular: true,
    isNew: true,
    badge: 'WHATSAPP CLOUD API',
    image: '/assets/covers/card_auto_whatsapp.jpg',
    rating: 5.0,
    plays: 'R$ 500,00 por mês',
    description: 'Automação corporativa para WhatsApp Business Cloud API Oficial da Meta. Conexão direta com servidor em nuvem e agentes de IA via MCP, atendimento 24/7 e CRM. (Atenção: disparos ativos de marketing seguem tarifação da Meta por conversa iniciada).',
    tech: ['WhatsApp Cloud API', 'Meta Business Verificado', 'Servidor Externo Node/Deno', 'Protocolo MCP', 'IA Autônoma'],
    localPath: 'Automacao',
    status: 'Pacote Oficial',
    pricing: {
      type: 'packages',
      plans: [
        {
          name: 'Automação WhatsApp Business Cloud API',
          price: 'R$ 500,00',
          period: 'por mês',
          tag: 'Oficial Meta Platforms',
          features: [
            'Configuração e verificação oficial no Meta Business Manager',
            'Atendimento receptivo automático e inteligente 24/7 (1.000 conversas grátis/mês da Meta)',
            'Servidor externo em nuvem dedicado para webhooks e agentes MCP',
            'Aviso de tarifação: mensagens ativas faturadas diretamente pela Meta conforme consumo'
          ]
        }
      ]
    },
    ctaLabel: 'Contratar Automação WhatsApp'
  },
  {
    id: 'auto-combo',
    title: 'Combo Automação Total (Instagram + WhatsApp + MCP)',
    category: 'Automação',
    categorySlug: 'automacao',
    isPopular: true,
    isNew: true,
    badge: 'COMBO OMNICHANNEL',
    image: '/assets/covers/card_auto_combo.jpg',
    rating: 5.0,
    plays: 'R$ 700,00 por mês',
    description: 'O ecossistema definitivo de automação omni-channel integrado: Instagram Direct + Comentários + WhatsApp Cloud API Oficial. Ambos conectados via servidor cloud com MCP e IA. Economia de R$ 150/mês.',
    tech: ['Instagram Graph API', 'WhatsApp Cloud API', 'Servidor Dedicado Multi-Canal', 'Protocolo MCP Unificado', 'Funil Omnichannel'],
    localPath: 'Automacao',
    status: 'Pacote Oficial',
    pricing: {
      type: 'packages',
      plans: [
        {
          name: 'Combo Automação Total (Insta + Zap + MCP)',
          price: 'R$ 700,00',
          period: 'por mês',
          tag: 'Economia de R$ 150,00/mês',
          isPopular: true,
          features: [
            'Automação completa de Direct e Comentários no Instagram',
            'Automação completa do WhatsApp Cloud API Oficial da Meta',
            'Servidor em nuvem dedicado unificado com protocolo MCP para ambos os canais',
            'Economia de R$ 150,00 mensais em relação à contratação avulsa dos dois módulos',
            'Suporte, homologação e manutenção contínua inclusos na mensalidade'
          ]
        }
      ]
    },
    ctaLabel: 'Contratar Combo Total'
  }
];
