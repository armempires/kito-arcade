import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroBanner } from './components/HeroBanner';
import { ProjectSection } from './components/ProjectSection';
import { ProjectCard } from './components/ProjectCard';
import { PreviewModal } from './components/PreviewModal';
import { AgendaPopupModal } from './components/AgendaPopupModal';
import { ArenaPlayer } from './components/ArenaPlayer';
import { ServicePage } from './components/ServicePage';
import { Footer } from './components/Footer';
import { LegalPagesModal } from './components/LegalPagesModal';
import { AdminCRMModal } from './components/AdminCRMModal';
import { AdminLoginGate } from "./components/AdminLoginGate";
import { ClientPortal } from './components/ClientPortal';
import { BlogHubPage } from './pages/BlogHubPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { NexusPage } from './pages/NexusPage';
import { MultiplayerLobbyPage } from './pages/MultiplayerLobbyPage';
import { DynamicAdBanner } from './components/ads/DynamicAdBanner';
import { REAL_PROJECTS, ProjectItem, CATEGORIES } from './data/gamesData';
import { SearchX, Sparkles, FolderGit2 } from 'lucide-react';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'favorites' | 'popular'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activePlayingProject, setActivePlayingProject] = useState<ProjectItem | null>(null);
  const [isMultiplayerLobby, setIsMultiplayerLobby] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [isAdminCRMOpen, setIsAdminCRMOpen] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [agendaTargetProject, setAgendaTargetProject] = useState<ProjectItem | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('termos-de-uso');
  
  // Favorites persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kito_arcade_favorites');
      return saved ? JSON.parse(saved) : ['arm-empires', 'neon-tetris', 'kito-trainner-web'];
    } catch {
      return ['arm-empires', 'neon-tetris', 'kito-trainner-web'];
    }
  });

  // Recent persistence
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kito_arcade_recents');
      return saved ? JSON.parse(saved) : ['arm-empires', 'kito-trainner-web', 'agenda-crm'];
    } catch {
      return ['arm-empires', 'kito-trainner-web', 'agenda-crm'];
    }
  });

  // Sync hash with active project on mount and popstate
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('multiplayer')) {
        setIsMultiplayerLobby(true);
        setActivePlayingProject(null);
      } else if (hash.startsWith('play=')) {
        setIsMultiplayerLobby(false);
        const params = new URLSearchParams(hash);
        const id = params.get('play') || hash.replace('play=', '').split('&')[0];
        const found = REAL_PROJECTS.find(p => p.id === id);
        if (found) {
          setActivePlayingProject(found);
          setRecents(prev => [found.id, ...prev.filter(i => i !== found.id)].slice(0, 10));
        }
      } else if (!hash) {
        setIsMultiplayerLobby(false);
        setActivePlayingProject(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    localStorage.setItem('kito_arcade_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('kito_arcade_recents', JSON.stringify(recents));
  }, [recents]);

  // Global event listener for opening Admin CRM
  useEffect(() => {
    const handleOpenAdmin = () => {
      setIsAdminCRMOpen(false);
      setShowAdminGate(true);
    };
    window.addEventListener('open-admin-crm', handleOpenAdmin);
    return () => window.removeEventListener('open-admin-crm', handleOpenAdmin);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenAgenda = (project?: ProjectItem | null) => {
    setAgendaTargetProject(project || null);
    setIsAgendaOpen(true);
  };

  const handleSelectProject = (project: ProjectItem) => {
    // Abre no portal (se for serviço/marketing abre a ServicePage, se for jogo/saas/app/site abre o ArenaPlayer)
    handlePlayProject(project);
  };

  const handlePlayProject = (project: ProjectItem) => {
    setActivePlayingProject(project);
    window.location.hash = `play=${project.id}`;
    setRecents(prev => [project.id, ...prev.filter(id => id !== project.id)].slice(0, 10));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSolicitarOrcamento = () => {
    const target = REAL_PROJECTS.find(p => p.id === 'srv-sites') || servicosProjects[0];
    if (target) {
      handlePlayProject(target);
    }
  };

  const handleConhecerServicos = () => {
    const el = document.getElementById('secao-servicos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSelectedCategory('servicos');
    }
  };

  const handleOpenLegal = (tabId: string) => {
    setActiveLegalTab(tabId);
    setIsLegalModalOpen(true);
  };

  const handleNavigateCategory = (slug: string) => {
    if (activePlayingProject) {
      handleBackToArcade();
    }
    setSelectedCategory(slug);
    setActiveFilter('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToArcade = () => {
    setActivePlayingProject(null);
    window.location.hash = '';
  };

  const handleRandomProject = () => {
    const jogosOnly = REAL_PROJECTS.filter(p => p.categorySlug === 'jogos');
    if (jogosOnly.length === 0) return;
    const randomIndex = Math.floor(Math.random() * jogosOnly.length);
    handlePlayProject(jogosOnly[randomIndex]);
  };

  // Filter logic
  const filteredProjects = useMemo(() => {
    return REAL_PROJECTS.filter(project => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesCat = project.category.toLowerCase().includes(query);
        const matchesDesc = project.description.toLowerCase().includes(query);
        const matchesPath = project.localPath.toLowerCase().includes(query);
        const matchesTech = project.tech.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCat && !matchesDesc && !matchesPath && !matchesTech) {
          return false;
        }
      }

      // Sidebar Quick Filters
      if (activeFilter === 'favorites') {
        if (!favorites.includes(project.id)) return false;
      } else if (activeFilter === 'recent') {
        if (!recents.includes(project.id)) return false;
      } else if (activeFilter === 'popular') {
        if (!project.isPopular) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (project.categorySlug !== selectedCategory) return false;
      }

      return true;
    });
  }, [searchQuery, activeFilter, selectedCategory, favorites, recents]);

  const isDefaultHome = !searchQuery.trim() && activeFilter === 'all' && selectedCategory === 'all';

  // Categorized project groups
  const heroProject = useMemo(() => REAL_PROJECTS.find(p => p.id === 'arm-empires'), []);
  const jogosProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'jogos'), []);
  const saasProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'saas'), []);
  const mobileProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'mobile'), []);
  const sitesProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'sites'), []);
  const servicosProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'servicos'), []);
  const marketingProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'marketing'), []);
  const automacaoProjects = useMemo(() => REAL_PROJECTS.filter(p => p.categorySlug === 'automacao'), []);

  const realPortfolioProjectsCount = useMemo(() => {
    return REAL_PROJECTS.filter(p => p.categorySlug !== 'servicos' && p.categorySlug !== 'marketing' && p.categorySlug !== 'automacao').length;
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-['Montserrat']">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activePlayingProject) {
            handleBackToArcade();
          }
        }}
        onRandomGame={handleRandomProject}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        totalProjects={realPortfolioProjectsCount}
      />

      {/* Conditional: Multiplayer Lobby, Active Extended Service Page, Arena Player, OR Catalog View */}
      {isMultiplayerLobby ? (
        <MultiplayerLobbyPage
          onBack={() => {
            setIsMultiplayerLobby(false);
            window.location.hash = '';
          }}
          onPlayGame={(gameId, roomId) => {
            const found = REAL_PROJECTS.find(p => p.id === gameId);
            if (found) {
              setIsMultiplayerLobby(false);
              setActivePlayingProject(found);
              window.location.hash = roomId ? `play=${gameId}&room=${roomId}` : `play=${gameId}`;
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      ) : activePlayingProject ? (
        (activePlayingProject.categorySlug === 'servicos' || activePlayingProject.categorySlug === 'marketing' || activePlayingProject.categorySlug === 'automacao') ? (
          <ServicePage
            project={activePlayingProject}
            onBack={handleBackToArcade}
          />
        ) : (
          <ArenaPlayer
            project={activePlayingProject}
            onBack={handleBackToArcade}
            onSelectProject={handlePlayProject}
            isFavorite={favorites.includes(activePlayingProject.id)}
            onToggleFavorite={toggleFavorite}
          />
        )
      ) : (
        /* Main Catalog Grid */
        <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
          
          {/* Sidebar */}
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
              setSearchQuery('');
            }}
            isOpen={isSidebarOpen}
            activeFilter={activeFilter}
            setActiveFilter={(filter) => {
              setActiveFilter(filter);
              setSearchQuery('');
            }}
            favoritesCount={favorites.length}
          />

          {/* Content Area */}
          <main className="flex-1 p-4 sm:p-8 lg:p-10 min-w-0 overflow-x-hidden">
            
            {isDefaultHome ? (
              /* Home Mode */
              <>
                {/* Hero Banner - Criação de Sites e Apps */}
                <HeroBanner
                  onSolicitarOrcamento={handleSolicitarOrcamento}
                  onConhecerServicos={handleConhecerServicos}
                />

                {/* 1. Jogos & Arcade */}
                <ProjectSection
                  eyebrow="JOGOS // EXPERIÊNCIAS INTERATIVAS"
                  title="JOGOS & ARCADE DO ECOSSISTEMA"
                  moreText="Ver todos os jogos"
                  onMoreClick={() => setSelectedCategory('jogos')}
                  projects={jogosProjects}
                  onSelectProject={handlePlayProject}
                  onInfoProject={setSelectedProject}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />

                {/* 2. SaaS & Gestão */}
                <ProjectSection
                  eyebrow="SAAS // PLATAFORMAS & AUTOMAÇÃO"
                  title="SISTEMAS & SAAS WEB"
                  moreText="Ver todos os SaaS"
                  onMoreClick={() => setSelectedCategory('saas')}
                  projects={saasProjects}
                  onSelectProject={handlePlayProject}
                  onInfoProject={setSelectedProject}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />

                {/* Banner de Anúncio Dinâmico (Rotação de 10s - Gerenciado no CRM) */}
                <div className="my-10">
                  <DynamicAdBanner format="horizontal" />
                </div>

                {/* 3. Apps Mobile */}
                <ProjectSection
                  eyebrow="MOBILE // REACT NATIVE & EXPO"
                  title="APLICATIVOS MOBILE"
                  moreText="Ver todos os apps"
                  onMoreClick={() => setSelectedCategory('mobile')}
                  projects={mobileProjects}
                  onSelectProject={handlePlayProject}
                  onInfoProject={setSelectedProject}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />

                {/* 4. Sites & Portfólios */}
                <ProjectSection
                  eyebrow="WEB // CAPTAÇÃO & CONVERSÃO"
                  title="SITES & PORTFÓLIOS"
                  moreText="Ver todos os sites"
                  onMoreClick={() => setSelectedCategory('sites')}
                  projects={sitesProjects}
                  onSelectProject={handlePlayProject}
                  onInfoProject={setSelectedProject}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />

                {/* 5. Criação de Sites e Apps */}
                <div id="secao-servicos">
                  <ProjectSection
                    eyebrow="DESENVOLVIMENTO // SITES & APPS SOB MEDIDA"
                    title="CRIAÇÃO DE SITES E APPS"
                    moreText="Ver todos os serviços"
                    onMoreClick={() => setSelectedCategory('servicos')}
                    projects={servicosProjects}
                    onSelectProject={handleSelectProject}
                    onInfoProject={setSelectedProject}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>

                {/* 6. Gestão de Redes Sociais & Automação */}
                <ProjectSection
                  eyebrow="CONTEÚDO & VENDAS // GESTÃO & CHATBOTS 24/7"
                  title="GESTÃO DE REDES SOCIAIS & AUTOMAÇÃO"
                  moreText="Ver planos e pacotes"
                  onMoreClick={() => setSelectedCategory('marketing')}
                  projects={marketingProjects}
                  onSelectProject={handleSelectProject}
                  onInfoProject={setSelectedProject}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />

                {/* 7. Automação Comercial (Meta API Oficial) */}
                <ProjectSection
                  eyebrow="META API OFICIAL // DIRECT, WHATSAPP & MCP"
                  title="AUTOMAÇÃO COMERCIAL"
                  moreText="Ver pacotes de automação"
                  onMoreClick={() => setSelectedCategory('automacao')}
                  projects={automacaoProjects}
                  onSelectProject={handleSelectProject}
                  onInfoProject={setSelectedProject}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </>
            ) : (
              /* Filtered or Search View */
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
                      FILTRO ATIVO // RESULTADOS
                    </span>
                    <h1 className="font-['Anton'] text-3xl sm:text-4xl uppercase tracking-wider text-white">
                      {searchQuery.trim()
                        ? `Busca: "${searchQuery}"`
                        : activeFilter === 'favorites'
                        ? 'Projetos Favoritos'
                        : activeFilter === 'recent'
                        ? 'Projetos Recentes'
                        : activeFilter === 'popular'
                        ? 'Projetos em Destaque'
                        : CATEGORIES.find(c => c.slug === selectedCategory)?.name || 'Todos os Projetos'}
                    </h1>
                    <span className="text-xs text-[#888888] font-bold mt-1 block">
                      {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
                    </span>
                  </div>

                  {(searchQuery || activeFilter !== 'all' || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                        setSelectedCategory('all');
                      }}
                      className="text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b5e600] px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(200,255,0,0.25)]"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>

                {filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={handleSelectProject}
                        onInfo={setSelectedProject}
                        isFavorite={favorites.includes(project.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center flex flex-col items-center justify-center bg-[#111111] rounded-3xl border border-dashed border-white/10">
                    <SearchX className="w-12 h-12 text-[#444444] mb-3" />
                    <h3 className="font-['Anton'] text-2xl uppercase tracking-wider text-white mb-2">
                      Nenhum item encontrado
                    </h3>
                    <p className="text-xs text-[#888888] max-w-sm mb-5 leading-relaxed">
                      Nenhum item do ecossistema corresponde aos termos pesquisados.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                        setSelectedCategory('all');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow hover:bg-[#b5e600] transition-colors"
                    >
                      Voltar ao Catálogo Completo
                    </button>
                  </div>
                )}

                {/* Banner de Anúncio Dinâmico no Rodapé dos Resultados */}
                <div className="mt-12">
                  <DynamicAdBanner format="horizontal" />
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* Rodapé Premium com 4 Seções */}
      {!activePlayingProject && (
        <Footer
          onOpenLegal={handleOpenLegal}
          onNavigateCategory={handleNavigateCategory}
          onOpenAgenda={handleSolicitarOrcamento}
          onOpenAdminCRM={() => { setIsAdminCRMOpen(false); setShowAdminGate(true); }}
        />
      )}

      {/* Modal de Políticas Legais e FAQ */}
      <LegalPagesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={activeLegalTab}
      />

      {/* Modal de Ficha Técnica / Apresentação do Serviço */}
      <PreviewModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onPlayProject={handlePlayProject}
        onOpenAgenda={handleOpenAgenda}
        isFavorite={selectedProject ? favorites.includes(selectedProject.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Modal Pop-up de Agendamento Online da Agenda Kito */}
      <AgendaPopupModal
        isOpen={isAgendaOpen}
        onClose={() => {
          setIsAgendaOpen(false);
          setAgendaTargetProject(null);
        }}
        serviceProject={agendaTargetProject}
      />

      {showAdminGate && (
        <AdminLoginGate
          onAuthenticated={() => {
            setShowAdminGate(false);
            setIsAdminCRMOpen(true);
          }}
        />
      )}

      {/* Modal do Painel CRM Administrativo */}
      <AdminCRMModal
        isOpen={isAdminCRMOpen}
        onClose={() => setIsAdminCRMOpen(false)}
      />

    </div>
  );
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/blog" element={<BlogHubPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/portal" element={<ClientPortal />} />
      <Route path="/nexus" element={<NexusPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
