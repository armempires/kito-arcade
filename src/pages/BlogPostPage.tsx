import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { ShareButtons } from '../components/blog/ShareButtons';
import { AdSenseSlot } from '../components/blog/AdSenseSlot';
import { BlogSidebar } from '../components/blog/BlogSidebar';
import { RelatedProductCard } from '../components/blog/RelatedProductCard';
import { 
  ChevronRight, Calendar, Clock, Eye, User, ArrowLeft, 
  Home, Tag, Sparkles, Share2, BookmarkCheck, ExternalLink, Play, Zap 
} from 'lucide-react';
import { Footer } from '../components/Footer';
import { LegalPagesModal } from '../components/LegalPagesModal';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { posts, incrementViews } = useBlogPosts();
  const [isLegalModalOpen, setIsLegalModalOpen] = React.useState(false);
  const [activeLegalTab, setActiveLegalTab] = React.useState('termos-de-uso');

  const post = useMemo(() => {
    return posts.find(p => p.slug === slug);
  }, [posts, slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter(p => p.id !== post.id && p.is_published)
      .slice(0, 3);
  }, [posts, post]);

  // Scroll to top and increment view count
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (post) {
      incrementViews(post.id);
    }
  }, [slug]);

  // Helper function to render bold and links inside paragraphs
  const renderFormattedInline = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let keyCounter = 0;

    const parseBold = (raw: string, subPrefix: string): React.ReactNode[] => {
      const boldSegments = raw.split(/\*\*([^*]+)\*\*/g);
      return boldSegments.map((seg, sIdx) => {
        if (sIdx % 2 === 1) {
          return (
            <strong key={`${subPrefix}-bold-${sIdx}`} className="font-bold text-white tracking-wide">
              {seg}
            </strong>
          );
        }
        return seg;
      });
    };

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(...parseBold(text.slice(lastIdx, match.index), `txt-${keyCounter++}`));
      }

      const linkLabel = match[1];
      const linkTarget = match[2];
      const isCtaButton = linkLabel.startsWith('CTA:') || linkLabel.startsWith('BOTÃO:');
      const cleanLabel = linkLabel.replace(/^(CTA:|BOTÃO:)\s*/, '');

      if (isCtaButton) {
        parts.push(
          <a
            key={`inline-cta-${keyCounter++}`}
            href={linkTarget}
            className="inline-flex items-center gap-1.5 px-3 py-1 my-0.5 rounded-lg bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(200,255,0,0.3)] hover:scale-105 active:scale-95 mx-1"
          >
            <Play className="w-3 h-3 fill-black" />
            <span>{cleanLabel}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      } else {
        parts.push(
          <a
            key={`inline-link-${keyCounter++}`}
            href={linkTarget}
            target={linkTarget.startsWith('http') ? '_blank' : '_self'}
            rel={linkTarget.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-[#C8FF00] font-semibold underline underline-offset-4 decoration-[#C8FF00]/50 hover:decoration-[#C8FF00] transition-colors"
          >
            {cleanLabel}
          </a>
        );
      }

      lastIdx = linkRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(...parseBold(text.slice(lastIdx), `txt-${keyCounter++}`));
    }

    return parts;
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center font-['Montserrat']">
        <h2 className="font-['Anton'] text-3xl uppercase tracking-wider mb-3">Artigo Não Encontrado</h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          O artigo solicitado não existe ou pode ter sido movido.
        </p>
        <Link
          to="/blog"
          className="px-6 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b5e600] transition-all"
        >
          Voltar para o Blog
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Format date
  const formattedDate = new Date(post.published_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col font-['Montserrat']">
      
      {/* Top Navigation Bar */}
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

            <span className="text-zinc-600 hidden sm:inline">|</span>

            <Link
              to="/blog"
              className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>Ver Todos os Artigos</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Voltar ao Arcade
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 flex-wrap font-medium">
          <Link to="/" className="hover:text-[#C8FF00] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <Link to="/blog" className="hover:text-[#C8FF00]">
            Blog
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span className="text-zinc-400">{post.category}</span>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span className="text-zinc-300 truncate max-w-[200px] sm:max-w-md">{post.title}</span>
        </nav>

        {/* Category Badge & Meta Bar */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-[#C8FF00] text-black font-black text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(200,255,0,0.3)]">
              {post.category}
            </span>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C8FF00]" />
                {post.reading_time_minutes} min de leitura
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#C8FF00]" />
                {post.views_count} visualizações
              </span>
            </div>
          </div>

          {/* H1 Title */}
          <h1 className="font-['Anton'] text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-white leading-tight">
            {post.title}
          </h1>

          {/* Lead Paragraph / Excerpt */}
          <p className="text-base sm:text-lg text-zinc-300 font-medium leading-relaxed max-w-4xl border-l-2 border-[#C8FF00] pl-4 py-1">
            {post.excerpt}
          </p>
        </div>

        {/* Featured Hero Image */}
        <div className="w-full h-[280px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden bg-black/50 border border-white/10 mb-10 shadow-2xl relative">
          <img
            src={post.cover_image}
            alt={post.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
        </div>

        {/* Main Grid: Left Sub-sidebar (Author & Share) + Content + Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          
          {/* Left Sub-Sidebar (Meta, Author & Social Share) - Sticky on Desktop */}
          <div className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24 space-y-6 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/10 lg:pr-6">
            
            {/* Published Date */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Publicado em
              </span>
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8FF00]" />
                {formattedDate}
              </span>
            </div>

            {/* Author Card */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Autor
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-[#C8FF00]/40 shrink-0">
                  <img
                    src={post.author_avatar || '/assets/kito-avatar-mech.png'}
                    alt={post.author_name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/kito-avatar-mech.png';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {post.author_name}
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    {post.author_role || 'Kito Expert'}
                  </span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <ShareButtons
              url={currentUrl}
              title={post.title}
              coverImage={post.cover_image}
              sharesCount={post.shares_count}
              orientation="vertical"
            />
          </div>

          {/* Article Body Content */}
          <article className="flex-1 min-w-0 text-left">
            <div className="prose prose-invert max-w-none space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
              
              {/* Normalizing content to ensure images and callouts are cleanly isolated from lists and paragraphs */}
              {post.content
                .replace(/\r\n/g, '\n')
                .replace(/(!\[[^\]]*\]\([^)]+\))/g, '\n\n$1\n\n')
                .split('\n\n')
                .map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Markdown Image: ![Alt Text](url)
                  const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
                  if (imgMatch) {
                    const alt = imgMatch[1].trim();
                    const url = imgMatch[2].trim();
                    return (
                      <figure key={index} className="my-8 rounded-2xl overflow-hidden border border-white/10 bg-[#121214] shadow-2xl transition-all duration-300 hover:border-[#C8FF00]/40 group">
                        {/* Modern software window header with dots */}
                        <div className="px-4 py-2.5 bg-[#18181B] border-b border-white/5 flex items-center justify-between select-none">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/90" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/90" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/90" />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400 font-medium tracking-wide truncate max-w-xs sm:max-w-md">
                            {alt || 'Demonstração do Sistema // Kito Expert'}
                          </span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-[#C8FF00] border border-[#C8FF00]/20">
                            FULL HD
                          </span>
                        </div>

                        {/* Image canvas with object-contain to preserve 100% of the UI without cropping */}
                        <div className="relative w-full bg-[#080809] flex items-center justify-center p-1 sm:p-2">
                          <img
                            src={url}
                            alt={alt || post.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                            }}
                            className="w-full h-auto max-h-[540px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
                          />
                        </div>

                        {alt && (
                          <figcaption className="text-xs text-center text-zinc-300 py-3 px-4 bg-[#141416] border-t border-white/5 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] shrink-0" />
                            <span className="font-semibold text-zinc-300">{alt}</span>
                          </figcaption>
                        )}
                      </figure>
                    );
                  }

                  // Callout Banner: :::cta
                  if (trimmed.startsWith(':::cta')) {
                    const lines = trimmed.replace(':::cta\n', '').replace(':::cta', '').split('\n').filter(Boolean);
                    const title = lines[0] || 'Experimente o Sistema Agora';
                    const desc = lines[1] || 'Acesse a página estendida e teste em tempo real todas as funcionalidades.';
                    const targetUrl = lines[2] || `/#play=${post.related_project_id || 'gestor-os-web'}`;
                    const btnText = lines[3] || 'Acessar Página Estendida & Testar Sistema';

                    return (
                      <div
                        key={index}
                        className="my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#18181B] via-[#141416] to-[#0D0D0E] border-2 border-[#C8FF00]/40 shadow-[0_0_30px_rgba(200,255,0,0.12)] relative group"
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8FF00]/20 text-[#C8FF00] text-[10px] font-black uppercase tracking-wider border border-[#C8FF00]/30">
                              <Sparkles className="w-3.5 h-3.5" />
                              Demonstração Interativa
                            </span>
                            <h4 className="font-['Anton'] text-2xl sm:text-3xl text-white uppercase tracking-wider leading-tight">
                              {title}
                            </h4>
                            <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                              {desc}
                            </p>
                          </div>

                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                            <a
                              href={targetUrl}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:scale-105 active:scale-95 text-center"
                            >
                              <span>{btnText}</span>
                              <ExternalLink className="w-4 h-4 shrink-0" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                // H2 Heading
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2
                      key={index}
                      className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white pt-8 pb-2 border-b border-white/10"
                    >
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }

                // H3 Heading
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={index}
                      className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-wider text-[#C8FF00] pt-5"
                    >
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }

                // Blockquote
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote
                      key={index}
                      className="my-6 p-4 sm:p-5 rounded-xl bg-white/5 border-l-4 border-[#C8FF00] text-zinc-200 italic font-medium"
                    >
                      {renderFormattedInline(trimmed.replace('> ', '').replace(/^"|"$/g, ''))}
                    </blockquote>
                  );
                }

                // List items
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
                  const items = trimmed.split('\n');
                  return (
                    <ul key={index} className="space-y-2.5 my-4 pl-2">
                      {items.map((it, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] mt-2 shrink-0" />
                          <span className="leading-relaxed">
                            {renderFormattedInline(it.replace(/^[\*\-\d\.]\s+/, ''))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Standard paragraph
                return (
                  <p key={index} className="leading-relaxed text-zinc-300 text-sm sm:text-base">
                    {renderFormattedInline(trimmed)}
                  </p>
                );
              })}

              {/* In-Article AdSense Slot */}
              <AdSenseSlot
                slotId="8301271975"
                format="horizontal"
                label="Publicidade // Dentro do Conteúdo"
              />

              {/* Featured Portfolio Product Box */}
              <RelatedProductCard projectId={post.related_project_id} />

              {/* Tags Cloud */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-8 mt-8 border-t border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-3">
                    Tags Relacionadas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1a1a1d] border border-white/10 text-xs font-bold text-zinc-300 transition-all hover:border-[#C8FF00]/40"
                      >
                        <Tag className="w-3 h-3 text-[#C8FF00]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Horizontal Share Buttons at Bottom for Mobile View */}
              <div className="lg:hidden pt-8 mt-8 border-t border-white/10">
                <ShareButtons
                  url={currentUrl}
                  title={post.title}
                  coverImage={post.cover_image}
                  sharesCount={post.shares_count}
                  orientation="horizontal"
                />
              </div>

            </div>
          </article>

          {/* Right Sidebar */}
          <BlogSidebar
            recentPosts={posts}
            currentPostId={post.id}
          />

        </div>

        {/* Bottom Section: "Você Pode Gostar Disso" */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
                  Recomendações
                </span>
                <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                  Você Pode Gostar Disso
                </h3>
              </div>
              <Link
                to="/blog"
                className="text-xs font-bold text-[#C8FF00] hover:underline flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  to={`/blog/${rPost.slug}`}
                  className="group bg-[#111113] rounded-2xl border border-white/5 hover:border-[#C8FF00]/40 overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col"
                >
                  <div className="w-full h-44 bg-black/40 overflow-hidden relative">
                    <img
                      src={rPost.cover_image}
                      alt={rPost.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-[9px] font-black uppercase text-[#C8FF00]">
                      {rPost.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <h4 className="font-['Anton'] text-lg uppercase tracking-wide text-white group-hover:text-[#C8FF00] transition-colors line-clamp-2">
                      {rPost.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {rPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                      <span>{rPost.author_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C8FF00]" />
                        {rPost.reading_time_minutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
