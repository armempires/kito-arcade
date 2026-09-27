export interface LegalDocument {
  id: string;
  title: string;
  iconName: string;
  lastUpdated: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Sites & Apps' | 'Pagamentos' | 'Suporte & Prazos' | 'Automação & IA';
}

export const COMPANY_INFO = {
  name: 'Kito Expert',
  legalName: 'Kito Expert Soluções Tecnológicas',
  cnpj: '61.629.735/0001-73',
  tagline: 'Site, App, Marketing e Automação',
  instagramUrl: 'https://instagram.com/kito.expert',
  instagramHandle: '@kito.expert',
  location: 'Atendimento Global • Clientes no Mundo Inteiro',
  year: '2026'
};

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Como funciona o processo de criação de um Site ou Aplicativo?',
    answer: 'Nossos projetos seguem esteiras de desenvolvimento oficiais e estruturadas: Para Site e SaaS (10 etapas): 1. Desenvolvimento + Envio do Contrato, 2. Aprovação e Ajustes, 3. Confirmação de Pagamento, 4. Compra de domínio, 5. Configuração de Domínio e Hospedagem, 6. Criação de Rede Social, 7. Configuração de Chat com I.A, 8. Criação de Conteúdo, 9. Post ou repost (Agendamento) e 10. Acompanhamento. Para App, Software e Jogos (9 etapas): 1. Desenvolvimento do App, 2. Aprovação e Ajustes, 3. Configuração do Servidor, 4. Debug e separação (Android, iOS, Desktop, Web), 5. Criação de Manifest e otimização para Plataformas, 6. Criação de Identidade Visual para Plataformas, 7. Criação de Texto e Descrições para Plataformas, 8. Envio do App para Plataformas e 9. Acompanhamento.',
    category: 'Sites & Apps'
  },
  {
    id: 'faq-2',
    question: 'Eu terei propriedade total do código-fonte e dos dados?',
    answer: 'Sim, 100%. Diferente de plataformas proprietárias que prendem o cliente em mensalidades abusivas, na Kito Expert você é o único proprietário do código-fonte, banco de dados e marca do seu projeto.',
    category: 'Sites & Apps'
  },
  {
    id: 'faq-3',
    question: 'Quais são as formas de pagamento disponíveis?',
    answer: 'Trabalhamos com pagamentos via PIX (com desconto especial à vista), Boleto Bancário e Cartão de Crédito com parcelamento facilitado através de gateway homologado (Asaas / Stripe) com total segurança e emissão de nota.',
    category: 'Pagamentos'
  },
  {
    id: 'faq-4',
    question: 'Qual é o prazo médio de entrega de um projeto?',
    answer: 'Landing pages e sites institucionais de alta conversão costumam ser entregues entre 5 a 12 dias úteis. Aplicativos mobile e sistemas personalizados variam entre 15 a 45 dias úteis, de acordo com o escopo aprovado no cronograma.',
    category: 'Suporte & Prazos'
  },
  {
    id: 'faq-5',
    question: 'Como funciona a garantia e o suporte pós-lançamento?',
    answer: 'Todos os projetos contam com garantia legal e período de acompanhamento assistido para ajustes técnicos. Além disso, oferecemos planos contínuos de manutenção, atualizações de segurança e gestão de servidores.',
    category: 'Suporte & Prazos'
  },
  {
    id: 'faq-6',
    question: 'Vocês também realizam a gestão de redes sociais e anúncios?',
    answer: 'Sim! Possuímos esteira completa de criação de criativos, vídeos UGC de alta retenção, agendamento programado de postagens e implantação de automações de atendimento 24/7 no Direct do Instagram.',
    category: 'Sites & Apps'
  },
  {
    id: 'faq-7',
    question: 'Qual é o prazo para pedir reembolso e como funciona o bônus de marketing?',
    answer: 'Para ter direito ao reembolso, o cliente deve formalizar a solicitação em até 7 dias corridos após o pagamento. Uma vez aprovada, o prazo para que o cliente receba o reembolso é de até 30 dias corridos. Na compra de um site, o cliente ganha 90 dias gratuitos do pacote de Gestão Orgânica + Automações de IA (8 criativos e 2 Reels mensais). Os serviços são independentes: caso o cliente desista ou não queira mais o pacote de marketing, o pagamento do site continua obrigatório (devendo concluir todas as parcelas acordadas), sem direito a reembolso do valor pago pelo site.',
    category: 'Pagamentos'
  },
  {
    id: 'faq-8',
    question: 'Vou precisar pagar mensalidade de hospedagem ou banco de dados?',
    answer: 'Não! Nossos clientes não pagam mensalidade de hospedagem. Hospedamos todos os projetos na Vercel e utilizamos banco de dados Supabase, ambos através de seus planos gratuitos de alta performance. O cliente somente pagará custos de infraestrutura se os provedores passarem a cobrar por esses serviços ou caso seu projeto demande recursos adicionais ou exceda a capacidade de armazenamento gratuita. Recomendamos manutenção e limpeza periódica do sistema a cada no máximo 3 meses para garantir máxima performance dentro da gratuidade.',
    category: 'Suporte & Prazos'
  },
  {
    id: 'faq-9',
    question: 'Como funciona o pagamento do domínio e sua renovação?',
    answer: 'O custo do registro de domínio é anual. O pagamento da anuidade de renovação do domínio é de responsabilidade do cliente e é estritamente vital para que o site, SaaS ou qualquer sistema web desenvolvido permaneça online e disponível após 12 meses da contratação formalizada.',
    category: 'Pagamentos'
  },
  {
    id: 'faq-10',
    question: 'Como funciona a Automação de Direct e Comentários no Instagram? Há risco de bloqueio?',
    answer: 'Nossa automação utiliza 100% a API Oficial da Meta (Instagram Graph API & Webhooks) associada a um servidor externo dedicado com MCP (Model Context Protocol). Diferente de bots clandestinos ou extensões de navegador que violam as diretrizes e levam a bloqueios ou shadowban, nossa arquitetura opera em estrita conformidade técnica com a Meta. Cada comentário gera gatilho instantâneo via webhook e disparo de direct autorizado, respondendo dúvidas, entregando links de checkout e convertendo seguidores em clientes 24 horas por dia.',
    category: 'Automação & IA'
  },
  {
    id: 'faq-11',
    question: 'Quais são os custos de envio de mensagem no WhatsApp Cloud API Oficial (Meta)?',
    answer: 'Ao utilizar a WhatsApp Cloud API Oficial, a Meta Platforms, Inc. disponibiliza uma cota gratuita mensal de 1.000 (mil) conversas de atendimento receptivo (Service Conversations) iniciadas pelo cliente. Para conversas ativas iniciadas pela empresa (notificações, campanhas e recuperação de leads), a Meta cobra uma pequena tarifa por mensagem diretamente no cartão cadastrado no seu Gerenciador de Negócios (Meta Business Suite), conforme a tabela oficial em vigor. O valor contratado com a Kito Expert compreende a assinatura mensal de manutenção, servidor cloud dedicado e conexão MCP, ficando as tarifas de tráfego de mensageria ativa cobradas diretamente pela Meta sob responsabilidade da empresa contratante.',
    category: 'Automação & IA'
  },
  {
    id: 'faq-12',
    question: 'O que é a integração com MCP (Model Context Protocol) e Servidor Externo?',
    answer: 'O Model Context Protocol (MCP) é um protocolo moderno e padronizado que conecta agentes inteligentes de IA diretamente à base de conhecimento da sua empresa — incluindo catálogo de serviços, estoque, sistemas de agendamento e CRM em tempo real. O servidor externo dedicado em nuvem mantém os robôs e webhooks operando ininterruptamente 24/7 com baixíssima latência, sem depender do celular de nenhum atendente estar ligado ou conectado à internet.',
    category: 'Automação & IA'
  },
  {
    id: 'faq-13',
    question: 'Como funciona a contratação dos Planos de Automação? O valor é mensal ou taxa de implantação?',
    answer: 'Os planos de Automação (Instagram por R$ 350,00/mês, WhatsApp por R$ 500,00/mês e Combo Total por R$ 700,00/mês) são planos de ASSINATURA MENSAL RECORRENTE e NÃO se tratam de taxa única ou taxa de implantação. A adesão estabelece um contrato com período de fidelidade e vigência mínima de 12 (doze) meses. A mensalidade cobre os custos de alocação de servidores em nuvem dedicados de alta performance, monitoramento contínuo dos Webhooks oficiais da Meta, segurança de dados e manutenção contínua do protocolo MCP de Inteligência Artificial.',
    category: 'Automação & IA'
  },
  {
    id: 'faq-14',
    question: 'Posso cancelar o plano de automação antes dos 12 meses? Como funciona a multa pró-rata?',
    answer: 'Sim, o cancelamento pode ser formalizado a qualquer momento. Caso a rescisão seja requerida antes de completados os 12 meses de contrato (ressalvado o prazo legal de arrependimento de 7 dias previsto em lei após a adesão), aplica-se uma multa rescisória calculada de forma pró-rata de 30% (trinta por cento) sobre o valor total das mensalidades vincendas restantes para o término dos 12 meses, conforme estipulado na Cláusula 5.4 do contrato de prestação de serviços.',
    category: 'Automação & IA'
  }
];

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'termos-de-uso',
    title: 'Termos de Uso',
    iconName: 'FileText',
    lastUpdated: 'Janeiro de 2026',
    sections: [
      {
        heading: '1. Objeto e Aceitação',
        content: 'Estes Termos de Uso regulam o acesso e a utilização dos serviços prestados por Kito Expert (CNPJ: 61.629.735/0001-73), incluindo o desenvolvimento de sites, aplicativos móveis, softwares personalizados e soluções de automação e marketing digital. Ao acessar nossa plataforma ou contratar nossos serviços, você declara ciência e concordância integral com estes termos.'
      },
      {
        heading: '2. Prestação dos Serviços e Escopo',
        content: 'Os serviços de desenvolvimento sob medida são executados em conformidade estrita com o escopo técnico previamente alinhado e aprovado pelo cliente. Qualquer alteração ou inclusão de novas funcionalidades fora do escopo inicial será formalizada por meio de aditivo contratual.'
      },
      {
        heading: '3. Propriedade Intelectual e Código-Fonte',
        content: 'Mediante a quitação integral dos valores estipulados para o projeto, a titularidade do código-fonte customizado e dos direitos patrimoniais do produto desenvolvido é transferida integralmente ao cliente contratante, ressalvadas bibliotecas de código aberto e recursos de terceiros de uso comum.'
      },
      {
        heading: '4. Hospedagem (Vercel), Banco de Dados (Supabase) e Limites de Gratuidade',
        content: 'Todos os projetos desenvolvidos são hospedados na plataforma Vercel e utilizam banco de dados Supabase, usufruindo de seus planos gratuitos de alta performance, de modo que o cliente não paga mensalidades de hospedagem à Kito Expert. O cliente somente arcará com custos de hospedagem e banco de dados caso: a) os provedores (Vercel ou Supabase) passem a cobrar por seus serviços; b) o cliente necessite de recursos adicionais que o plano gratuito não comporte; ou c) o projeto exceda a capacidade de armazenamento ou tráfego da cota gratuita. Para garantir a continuidade da gratuidade e a velocidade do sistema, recomendamos expressamente manutenção e limpeza periódica do banco de dados em até no máximo 3 (três) meses.'
      },
      {
        heading: '5. Responsabilidades do Usuário/Contratante',
        content: 'O contratante é o único responsável pela veracidade das informações, textos, imagens, logotipos e conteúdos fornecidos para a inserção em sites e aplicativos, garantindo que não infringem direitos autorais ou normas de terceiros.'
      },
      {
        heading: '6. Foro de Eleição',
        content: 'Fica eleito o Foro da Comarca de domicílio da sede da Kito Expert para dirimir quaisquer dúvidas ou litígios decorrentes destes termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.'
      }
    ]
  },
  {
    id: 'privacidade',
    title: 'Política de Privacidade',
    iconName: 'Shield',
    lastUpdated: 'Janeiro de 2026',
    sections: [
      {
        heading: '1. Compromisso com a Privacidade (LGPD)',
        content: 'A Kito Expert (CNPJ: 61.629.735/0001-73) atua em rigorosa conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD). Garantimos que a coleta de dados é limitada exclusivamente ao necessário para a execução de nossos serviços e atendimento ao cliente.'
      },
      {
        heading: '2. Dados Coletados e Finalidade',
        content: 'Coletamos dados cadastrais (como nome completo, endereço de e-mail, telefone/WhatsApp e empresa) exclusivamente para fins de: agendamento de reuniões técnicas, elaboração de orçamentos, cumprimento de obrigações contratuais e fiscais, e suporte aos sistemas contratados.'
      },
      {
        heading: '3. Segurança e Criptografia',
        content: 'Adotamos medidas técnicas e organizacionais avançadas de segurança da informação, incluindo conexões seguras sob protocolo HTTPS/SSL, armazenamento em bancos de dados protegidos por autenticação em dois fatores e políticas estritas de controle de acesso.'
      },
      {
        heading: '4. Não Compartilhamento com Terceiros',
        content: 'Não comercializamos, alugamos ou compartilhamos dados pessoais com terceiros para finalidades publicitárias ou não autorizadas. O compartilhamento ocorre unicamente com provedores estritamente necessários à prestação do serviço (como gateways de pagamento e serviços de envio de e-mails transacionais).'
      },
      {
        heading: '5. Direitos do Titular de Dados',
        content: 'Nos termos do Art. 18 da LGPD, você possui o direito de confirmar a existência de tratamento, acessar seus dados, corrigir dados incompletos ou inexatos, e solicitar a anonimização, bloqueio ou eliminação de seus dados pessoais a qualquer momento.'
      }
    ]
  },
  {
    id: 'cookies',
    title: 'Política de Cookies',
    iconName: 'Cookie',
    lastUpdated: 'Janeiro de 2026',
    sections: [
      {
        heading: '1. O que são Cookies',
        content: 'Cookies são pequenos arquivos de texto armazenados no navegador do seu dispositivo quando você visita nosso portal. Eles servem para garantir o correto funcionamento da aplicação, melhorar sua experiência de navegação e memorizar suas preferências.'
      },
      {
        heading: '2. Tipos de Cookies Utilizados',
        content: 'Utilizamos exclusivamente cookies essenciais e funcionais: 1) Cookies de Sessão: necessários para autenticação e navegação segura; 2) Preferências Locais (LocalStorage): utilizados para salvar itens favoritados, projetos recentes e temas sem coletar informações de identificação invasiva.'
      },
      {
        heading: '3. Como Gerenciar ou Desativar Cookies',
        content: 'Você pode configurar seu navegador a qualquer momento para bloquear cookies ou emitir alertas quando um cookie estiver sendo enviado. Note que a desativação de cookies essenciais pode limitar algumas funcionalidades do catálogo interativo.'
      }
    ]
  },
  {
    id: 'reembolso',
    title: 'Política de Reembolso',
    iconName: 'CreditCard',
    lastUpdated: 'Janeiro de 2026',
    sections: [
      {
        heading: '1. Prazos: Solicitação em até 7 Dias e Pagamento do Reembolso em até 30 Dias',
        content: 'Para ter direito ao reembolso, o cliente deve obrigatoriamente solicitar o cancelamento em até 7 (sete) dias corridos após a realização do pagamento. Estando a solicitação dentro do prazo de 7 dias e homologada, o prazo para que o cliente receba o reembolso efetivo é de até 30 (trinta) dias corridos a contar da confirmação do cancelamento, processado via estorno na operadora do cartão de crédito ou transferência bancária.'
      },
      {
        heading: '2. Bonificação de 90 Dias de Marketing na Compra de Site',
        content: 'Na compra de qualquer projeto de Criação de Site ou Landing Page, o cliente é bonificado com 90 (noventa) dias de gratuidade do primeiro pacote de Gestão Orgânica + Automações de IA, com volume mensal de 8 criativos de imagens em alta resolução e 2 vídeos Reels de alta retenção, além de automação de atendimento.'
      },
      {
        heading: '3. Independência dos Serviços e Desvinculação Legal',
        content: 'O pacote de marketing promocional de 90 dias é uma bonificação e cortesia comercial gratuita agregada à aquisição do site. Um serviço não está atrelado juridicamente ou financeiramente ao outro. A eventual desistência, interrupção voluntária ou não utilização das postagens e vídeos não extingue, não suspende e não altera a contratação do site.'
      },
      {
        heading: '4. Continuidade do Pagamento Parcelado e Inexistência de Estorno do Site',
        content: 'Caso o cliente tenha parcelado a compra do site (seja por cartão de crédito, boleto ou gateway parceiro), o pagamento integral de todas as parcelas do site deverá ser obrigatoriamente honrado até a sua quitação. Não haverá estorno, reembolso ou abatimento de qualquer valor pago ou vincendo pelo site decorrente da desistência do pacote de marketing promocional bonificado.'
      }
    ]
  },
  {
    id: 'exclusao-dados',
    title: 'Política de Exclusão de Dados',
    iconName: 'FileX',
    lastUpdated: 'Janeiro de 2026',
    sections: [
      {
        heading: '1. Solicitação de Exclusão Definitiva',
        content: 'Em cumprimento ao Artigo 16 da LGPD, qualquer usuário ou cliente que tenha fornecido dados cadastrais através de nossos formulários de agendamento ou canais de contato pode solicitar a exclusão integral e definitiva de seus registros de nossos bancos de dados.'
      },
      {
        heading: '2. Procedimento de Exclusão',
        content: 'Para solicitar a eliminação dos seus dados, basta enviar uma mensagem direta com o assunto "Exclusão de Dados" através do nosso canal oficial no Instagram (@kito.expert) ou via WhatsApp informado durante o agendamento. O processo de exclusão é concluído no prazo máximo de 5 (cinco) dias úteis.'
      },
      {
        heading: '3. Exceções Legais',
        content: 'Informações estritamente necessárias para cumprimento de obrigações legais, regulatórias ou fiscais (como notas fiscais emitidas e registros contábeis exigidos pela Receita Federal do Brasil) serão retidas pelo período prescricional exigido pela legislação vigente.'
      }
    ]
  }
];
