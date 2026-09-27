import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { BLOG_CATEGORIES } from '../data/initialBlogPosts';
import { BlogSidebar } from '../components/blog/BlogSidebar';
import { AdSenseSlot } from '../components/blog/AdSenseSlot';
import { Footer } from '../components/Footer';
import { LegalPagesModal } from '../components/LegalPagesModal';
import { 
  Search, Clock, Eye, ChevronRight, Sparkles, 
  ArrowRight, BookOpen, Layers, Filter, X 
} from 'lucide-react';

export const BlogHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { posts } = useBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('termos-de-uso');

  const publishedPosts = useMemo(() => {
    return posts.filter(p => p.is_published);
  }, [posts]);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return publishedPosts.filter(post => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (post.category_slug !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(query);
        const matchesCategory = post.category.toLowerCase().includes(query);
        const matchesTags = post.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesExcerpt && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [publishedPosts, selectedCategory, searchQuery]);

  // When browsing all without search, show hero featured post
  const isDefaultFeed = selectedCategory === 'all' && !searchQuery.trim();

  const featuredPost = useMemo(() => {
    if (!isDefaultFeed) return null;
    return publishedPosts.find(p => p.is_featured) || publishedPosts[0];
  }, [publishedPosts, isDefaultFeed]);

  const regularPosts = useMemo(() => {
    if (isDefaultFeed && featuredPost) {
      return publishedPosts.filter(p => p.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [isDefaultFeed, featuredPost, publishedPosts, filteredPosts]);

  // Other posts to recommend if the filtered category has fewer than 3 items
  const otherRecommendedPosts = useMemo(() => {
    if (isDefaultFeed) return [];
    const currentIds = new Set(filteredPosts.map(p => p.id));
    return publishedPosts.filter(p => !currentIds.has(p.id)).slice(0, 4);
  }, [isDefaultFeed, filteredPosts, publishedPosts]);

  const currentCategoryName = useMemo(() => {
    return BLOG_CATEGORIES.find(c => c.slug === selectedCategory)?.name || 'Todos os Artigos';
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-['Montserrat']">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="font-['Anton'] text-2xl tracking-wider uppercase text-white">
                KITO<span className="text-[#C8FF00]">ARCADE</span>
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#C8FF00] text-black">
                BLOG
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C8FF00]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Voltar ao Arcade
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        
        {/* Hub Title Banner */}
        <div className="mb-10 text-left">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#C8FF00] block mb-2">
            CONTEÚDO & ANÁLISES DO ECOSSISTEMA
          </span>
          <h1 className="font-['Anton'] text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-white">
            BLOG // KITO ARCADE
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl mt-2 leading-relaxed">
            Estratégias, bastidores de desenvolvimento de SaaS, engenharia de odds esportivas e metodologias de software ancoradas nos produtos do ecossistema.
          </p>
        </div>

        {/* Category Pills & Mobile Search */}
        <div className="mb-10 space-y-4">
          <div className="md:hidden">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C8FF00]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)]'
                    : 'bg-[#141416] hover:bg-[#1a1a1d] text-zinc-300 border border-white/5'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Grid: Articles Column + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          
          {/* Main Feed Column */}
          <div className="flex-1 min-w-0 w-full space-y-10">
            
            {/* 1. Hero Featured Post (Only rendered on the main default hub) */}
            {isDefaultFeed && featuredPost && (
              <div className="relative group rounded-3xl bg-[#111113] border border-white/10 hover:border-[#C8FF00]/40 overflow-hidden transition-all shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Hero Cover (7 cols) */}
                  <div className="lg:col-span-7 h-64 sm:h-80 lg:h-[380px] overflow-hidden bg-black/40 relative">
                    <img
                      src={featuredPost.cover_image}
                      alt={featuredPost.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-[#C8FF00] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Destaque // {featuredPost.category}
                    </div>
                  </div>

                  {/* Hero Content (5 cols) */}
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C8FF00]" />
                          {featuredPost.reading_time_minutes} min de leitura
                        </span>
                        <span>•</span>
                        <span>{featuredPost.views_count} views</span>
                      </div>

                      <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white group-hover:text-[#C8FF00] transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-[#C8FF00]/30 shrink-0">
                          <img
                            src={featuredPost.author_avatar || '/assets/kito-avatar-mech.png'}
                            alt={featuredPost.author_name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/kito-avatar-mech.png';
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-300">
                          {featuredPost.author_name}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(200,255,0,0.2)] hover:bg-[#b5e600] transition-all hover:scale-105"
                      >
                        <span>Ler Artigo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* In-Feed Horizontal AdSense Banner */}
            <AdSenseSlot
              slotId="8301271975"
              format="horizontal"
              label="Publicidade // Feed de Artigos"
            />

            {/* Header when category or search is active */}
            {!isDefaultFeed && (
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
                    FILTRO ATIVO // RESULTADOS
                  </span>
                  <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                    {searchQuery.trim() ? `Busca: "${searchQuery}"` : currentCategoryName}
                  </h3>
                  <span className="text-xs text-zinc-500 font-bold mt-1 block">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase border border-white/10 transition-all"
                >
                  Ver Todos
                </button>
              </div>
            )}

            {/* 2. Posts Grid */}
            {regularPosts.length > 0 ? (
              <div className="space-y-6">
                {isDefaultFeed && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-wider text-white">
                      Artigos Recentes
                    </h3>
                    <span className="text-xs font-bold text-zinc-500">
                      {regularPosts.length} {regularPosts.length === 1 ? 'artigo' : 'artigos'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {regularPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group bg-[#111113] rounded-2xl border border-white/5 hover:border-[#C8FF00]/40 overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col text-left shadow-lg"
                    >
                      {/* Thumbnail */}
                      <div className="w-full h-52 bg-black/40 overflow-hidden relative">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-[9px] font-black uppercase text-[#C8FF00]">
                          {post.category}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1 text-[#C8FF00] font-semibold">
                              <Clock className="w-3 h-3" />
                              {post.reading_time_minutes} min
                            </span>
                            <span>•</span>
                            <span>{new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
                          </div>

                          <h4 className="font-['Anton'] text-xl uppercase tracking-wide text-white group-hover:text-[#C8FF00] transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                          <span className="font-medium text-zinc-300">{post.author_name}</span>
                          <span className="flex items-center gap-1 text-[#C8FF00] font-bold group-hover:translate-x-1 transition-transform">
                            <span>Acessar</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-16 text-center bg-[#111113] rounded-3xl border border-dashed border-white/10">
                <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h4 className="font-['Anton'] text-2xl uppercase tracking-wider text-white mb-2">
                  Nenhum Artigo Encontrado
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                  Nenhum conteúdo corresponde aos termos selecionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b5e600] transition-all cursor-pointer"
                >
                  Ver Todos os Artigos
                </button>
              </div>
            ) : null}

            {/* 3. Section: "Outros Artigos Recomendados" (when filtered results are few) */}
            {otherRecommendedPosts.length > 0 && (
              <div className="pt-8 border-t border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
                      MAIS DO ECOSSISTEMA
                    </span>
                    <h4 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                      Outros Artigos Que Podem Te Interessar
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherRecommendedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group bg-[#111113] rounded-2xl border border-white/5 hover:border-[#C8FF00]/40 overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col text-left shadow-lg"
                    >
                      <div className="w-full h-44 bg-black/40 overflow-hidden relative">
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-[9px] font-black uppercase text-[#C8FF00]">
                          {post.category}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <h4 className="font-['Anton'] text-lg uppercase tracking-wide text-white group-hover:text-[#C8FF00] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                          <span>{post.author_name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C8FF00]" />
                            {post.reading_time_minutes} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <BlogSidebar recentPosts={publishedPosts} />

        </div>

      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(tabId) => {
          setActiveLegalTab(tabId);
          setIsLegalModalOpen(true);
        }}
        onNavigateCategory={() => navigate('/')}
        onOpenAgenda={() => navigate('/#secao-servicos')}
      />

      {/* Modal de Políticas Legais e FAQ */}
      <LegalPagesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={activeLegalTab}
      />

    </div>
  );
};
