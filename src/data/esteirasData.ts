export interface EsteiraStep {
  step: number;
  title: string;
  description: string;
  tag: string;
  completed?: boolean;
}

export interface EsteiraPipeline {
  id: 'app-software-jogos' | 'site-saas';
  name: string;
  subtitle: string;
  targetCategory: string;
  totalSteps: number;
  steps: EsteiraStep[];
}

export const ESTEIRA_APP_SOFTWARE_JOGOS: EsteiraPipeline = {
  id: 'app-software-jogos',
  name: 'App, Software e Jogos',
  subtitle: 'Esteira Oficial de Engenharia Mobile, Multiplataforma & Jogos',
  targetCategory: 'Aplicativos Mobile, Softwares Customizados e Jogos',
  totalSteps: 10,
  steps: [
    {
      step: 1,
      title: 'Desenvolvimento do App',
      description: 'Construção da arquitetura, interfaces, lógica de telas e funcionalidades nativas do aplicativo.',
      tag: 'Desenvolvimento'
    },
    {
      step: 2,
      title: 'Aprovação e Ajustes',
      description: 'Apresentação do build de homologação ao cliente para validação de fluxos e refinamentos.',
      tag: 'Homologação'
    },
    {
      step: 3,
      title: 'Configuração do Servidor',
      description: 'Provisionamento de infraestrutura em nuvem, banco de dados (Supabase/PostgreSQL), APIs e autenticação.',
      tag: 'Infraestrutura'
    },
    {
      step: 4,
      title: 'Debug e separação (Android, iOS, Desktop, Web)',
      description: 'Testes de estabilidade, resolução de bugs e compilação dos binários específicos para cada plataforma.',
      tag: 'Multiplataforma'
    },
    {
      step: 5,
      title: 'Criação de Manifest e otimização para Plataformas',
      description: 'Geração dos arquivos de manifesto, permissões de sistema, ícones adaptativos e metadados de loja.',
      tag: 'Otimização'
    },
    {
      step: 6,
      title: 'Criação de Identidade Visual para Plataformas',
      description: 'Design de artes oficiais de capa, banners de destaque e capturas de tela (screenshots) para as lojas.',
      tag: 'Design de Lojas'
    },
    {
      step: 7,
      title: 'Criação de Texto e Descrições para Plataformas',
      description: 'Redação de copy persuasiva com técnicas de ASO (App Store Optimization), palavras-chave e políticas.',
      tag: 'ASO & Copy'
    },
    {
      step: 8,
      title: 'Envio do App para Plataformas',
      description: 'Submissão e envio oficial para publicação na Google Play Console, Apple App Store ou distribuição web.',
      tag: 'Publicação'
    },
    {
      step: 9,
      title: 'Acompanhamento',
      description: 'Monitoramento contínuo de aprovação das lojas, estabilidade de versão, métricas e suporte assistido.',
      tag: 'Garantia'
    },
    {
      step: 10,
      title: 'Configuração de Cobrança Automática',
      description: 'Ativação do sistema de cobrança recorrente via PIX e Cartão de Crédito com notificações automáticas de vencimento.',
      tag: 'Financeiro'
    }
  ]
};

export const ESTEIRA_SITE_SAAS: EsteiraPipeline = {
  id: 'site-saas',
  name: 'Site e SaaS',
  subtitle: 'Esteira Oficial de Desenvolvimento Web, Lançamento & Crescimento',
  targetCategory: 'Sites 3D, Landing Pages de Alta Conversão e Plataformas SaaS',
  totalSteps: 11,
  steps: [
    {
      step: 1,
      title: 'Desenvolvimento + Envio do Contrato',
      description: 'Início da engenharia visual e funcional com formalização contratual de escopo e prazos.',
      tag: 'Contrato & Dev'
    },
    {
      step: 2,
      title: 'Aprovação e Ajustes',
      description: 'Demonstração online para o cliente testar, solicitar ajustes finos e validar a experiência.',
      tag: 'Homologação'
    },
    {
      step: 3,
      title: 'Confirmação de Pagamento',
      description: 'Validação e liquidação do marco de entrega acordado com emissão de recibo/nota.',
      tag: 'Financeiro'
    },
    {
      step: 4,
      title: 'Compra de domínio',
      description: 'Registro e aquisição do domínio oficial do negócio (.com.br, .com, etc.) em nome do cliente.',
      tag: 'Domínio'
    },
    {
      step: 5,
      title: 'Configuração de Domínio e Hospedagem',
      description: 'Apontamento de DNS, ativação de certificados SSL (HTTPS), CDN ultrarrápida e servidores de alta disponibilidade.',
      tag: 'Infra Web'
    },
    {
      step: 6,
      title: 'Criação de Rede Social',
      description: 'Estruturação profissional das contas oficiais de marca com identidade visual e bio magnética.',
      tag: 'Presença Digital'
    },
    {
      step: 7,
      title: 'Configuração de Chat com I.A',
      description: 'Instalação e treinamento de robô inteligente para atendimento 24/7 no Direct do Instagram.',
      tag: 'Automação I.A'
    },
    {
      step: 8,
      title: 'Criação de Conteúdo',
      description: 'Produção de criativos de imagem, vídeos dinâmicos e copywriting persuasivo alinhado à oferta.',
      tag: 'Conteúdo'
    },
    {
      step: 9,
      title: 'Post ou repost (Agendamento)',
      description: 'Agendamento e publicação estratégica das postagens nos melhores horários de engajamento.',
      tag: 'Agendamento'
    },
    {
      step: 10,
      title: 'Acompanhamento',
      description: 'Análise de métricas de alcance, conversão de visitantes, suporte técnico e evolução da plataforma.',
      tag: 'Suporte & Métricas'
    },
    {
      step: 11,
      title: 'Configuração de Cobrança Automática',
      description: 'Ativação do sistema de cobrança recorrente via PIX e Cartão de Crédito com notificações automáticas de vencimento.',
      tag: 'Financeiro'
    }
  ]
};

export const getEsteiraForProject = (categorySlug?: string, projectId?: string): EsteiraPipeline => {
  if (categorySlug === 'mobile' || projectId === 'srv-mobile' || categorySlug === 'jogos') {
    return ESTEIRA_APP_SOFTWARE_JOGOS;
  }
  return ESTEIRA_SITE_SAAS;
};

export const getClientSteps = (c: {
  pipeline_id?: string;
  pipeline_current_step?: number;
  custom_pipeline_steps?: EsteiraStep[];
}): EsteiraStep[] => {
  if (c.custom_pipeline_steps && Array.isArray(c.custom_pipeline_steps) && c.custom_pipeline_steps.length > 0) {
    return c.custom_pipeline_steps.map((s, idx) => ({
      ...s,
      step: s.step || idx + 1,
      completed: Boolean(s.completed)
    }));
  }
  const defaultPipeline = getEsteiraForProject(c.pipeline_id === 'app-software-jogos' ? 'mobile' : undefined);
  const currentStep = c.pipeline_current_step ?? 0;
  return defaultPipeline.steps.map(s => ({
    ...s,
    completed: currentStep > 0 && s.step <= currentStep
  }));
};

