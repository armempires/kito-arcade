import React, { useState } from 'react';
import { BlogPost } from '../../types/blog';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { REAL_PROJECTS } from '../../data/gamesData';
import { BLOG_CATEGORIES } from '../../data/initialBlogPosts';
import { 
  Plus, Edit, Trash2, Eye, Save, X, Sparkles, 
  CheckCircle, AlertCircle, FileText, Image, Tag, 
  ExternalLink, Clock, FolderGit2 
} from 'lucide-react';

export const BlogAdminTab: React.FC = () => {
  const { posts, createPost, updatePost, deletePost } = useBlogPosts();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('/assets/covers/card_gestor_os_web.jpg');
  const [categorySlug, setCategorySlug] = useState('saas');
  const [tagsInput, setTagsInput] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState<string>('');
  const [authorName, setAuthorName] = useState('Kito Expert');
  const [authorRole, setAuthorRole] = useState('Especialista em Software');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPostId) {
      setSlug(generateSlug(val));
    }
  };

  // When a portfolio project is selected, auto-fill relevant fields
  const handleSelectRelatedProject = (pId: string) => {
    setRelatedProjectId(pId);
    if (!pId) return;

    const project = REAL_PROJECTS.find(p => p.id === pId);
    if (project) {
      if (!coverImage || coverImage.includes('/assets/covers/')) {
        setCoverImage(project.image);
      }
      
      // Auto map category
      if (project.categorySlug === 'saas') setCategorySlug('saas');
      else if (project.categorySlug === 'jogos') setCategorySlug('jogos');
      else if (project.categorySlug === 'servicos' || project.categorySlug === 'sites') setCategorySlug('sites');
      else if (project.id.includes('odds') || project.id.includes('esportes')) setCategorySlug('odds');
      else if (project.id.includes('trainner')) setCategorySlug('fitness');

      // Append project tech as tags
      const newTags = [project.title, ...project.tech.slice(0, 3)].join(', ');
      setTagsInput(prev => prev ? `${prev}, ${newTags}` : newTags);
    }
  };

  const openCreateModal = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent(`## Introdução\n\nDescreva aqui o problema que o seu produto resolve...\n\n> "Uma citação de destaque para prender a atenção do leitor."\n\n### Como Funciona na Prática\n\n* Ponto chave 1\n* Ponto chave 2\n* Ponto chave 3\n\n## Conclusão e Resultados\n\nExplique os benefícios de contratar ou testar a solução.`);
    setCoverImage('/assets/covers/card_gestor_os_web.jpg');
    setCategorySlug('saas');
    setTagsInput('SaaS, Inovação, Tecnologia');
    setRelatedProjectId('');
    setAuthorName('Kito Expert');
    setAuthorRole('Especialista em Software');
    setIsPublished(true);
    setIsFeatured(false);
    setIsEditing(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCoverImage(post.cover_image);
    setCategorySlug(post.category_slug || 'saas');
    setTagsInput(post.tags?.join(', ') || '');
    setRelatedProjectId(post.related_project_id || '');
    setAuthorName(post.author_name || 'Kito Expert');
    setAuthorRole(post.author_role || 'Especialista em Software');
    setIsPublished(post.is_published);
    setIsFeatured(post.is_featured || false);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    // Calculate reading time (approx 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 180));

    const selectedCategoryObj = BLOG_CATEGORIES.find(c => c.slug === categorySlug) || BLOG_CATEGORIES[1];

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const postPayload = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage,
      category: selectedCategoryObj.name,
      category_slug: categorySlug,
      tags: tagsArray,
      author_name: authorName,
      author_avatar: '/assets/covers/card_kito_expert.jpg',
      author_role: authorRole,
      reading_time_minutes: readingTime,
      is_published: isPublished,
      is_featured: isFeatured,
      related_project_id: relatedProjectId || undefined
    };

    if (editingPostId) {
      await updatePost(editingPostId, postPayload);
    } else {
      await createPost(postPayload);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  const handleDelete = async (post: BlogPost) => {
    if (window.confirm(`Tem certeza que deseja excluir o artigo "${post.title}"?`)) {
      await deletePost(post.id);
    }
  };

  return (
    <div className="space-y-6 text-left font-['Montserrat']">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
            CRM // GESTÃO DE CONTEÚDO
          </span>
          <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
            Gerenciador de Artigos & Blog
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Crie e edite artigos conectados aos produtos do seu portfólio para ranqueamento e captação de clientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(200,255,0,0.25)] hover:bg-[#b5e600] transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Artigo</span>
        </button>
      </div>

      {/* Posts Table / List */}
      {!isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#111113] border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title & Info */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#C8FF00]/15 text-[#C8FF00] font-black text-[9px] uppercase">
                        {post.category}
                      </span>
                      {post.is_featured && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] uppercase">
                          Destaque
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        post.is_published ? 'bg-green-500/20 text-green-300' : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {post.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>

                    <h4 className="font-['Anton'] text-base uppercase text-white truncate max-w-md">
                      {post.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C8FF00]" />
                        {post.reading_time_minutes} min
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views_count} views
                      </span>
                      <span>•</span>
                      <span>{new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                    title="Ver no site"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ver</span>
                  </a>

                  <button
                    onClick={() => openEditModal(post)}
                    className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                    title="Editar artigo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(post)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all text-xs cursor-pointer"
                    title="Excluir artigo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Edit / Create Form */
        <form onSubmit={handleSave} className="space-y-6 bg-[#111113] p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h4 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
              {editingPostId ? 'Editar Artigo' : 'Criar Novo Artigo'}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Select Related Portfolio Product */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#18181B] to-[#121214] border border-[#C8FF00]/30 space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[#C8FF00] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Produto do Portfólio Vinculado (Preenchimento Automático)
            </label>
            <select
              value={relatedProjectId}
              onChange={(e) => handleSelectRelatedProject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#09090B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
            >
              <option value="">Nenhum (Artigo Geral)</option>
              {REAL_PROJECTS.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title} ({proj.category})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-zinc-400 block">
              Ao selecionar um produto, a capa, categoria e links diretos para testar o sistema são configurados automaticamente.
            </span>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Título do Artigo *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Como o Gestor OS Transforma Ordens de Serviço"
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Slug da URL (amigável) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="como-o-gestor-os-transforma-ordens-de-servico"
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-[#C8FF00]"
              />
              <span className="text-[10px] text-zinc-500">URL final: /blog/{slug || '...'}</span>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Categoria</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
              >
                {BLOG_CATEGORIES.filter(c => c.slug !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Gestor OS, SaaS, Ordens de Serviço"
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
              />
            </div>
          </div>

          {/* Cover Image & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Capa do Artigo (URL ou Caminho local)</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/assets/covers/card_gestor_os_web.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Nome do Autor</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Kito Expert"
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Resumo / Chamada (Excerpt) *</label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Uma frase marcante que resume o valor do artigo para aparecer no card e no Google..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#18181B] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C8FF00]"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300">Conteúdo do Artigo (Markdown / Texto Rico) *</label>
              <span className="text-[10px] text-zinc-500">
                Suporta ## Título H2, ### Subtítulo H3, &gt; Citação, * Listas
              </span>
            </div>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full font-mono p-4 rounded-xl bg-[#18181B] border border-white/10 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-[#C8FF00]"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-zinc-700 text-[#C8FF00] focus:ring-[#C8FF00]"
              />
              <span>Publicado Imediatamente</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-zinc-700 text-[#C8FF00] focus:ring-[#C8FF00]"
              />
              <span>Destacar no Topo do Blog</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:bg-[#b5e600] transition-all hover:scale-105 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Artigo Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Artigo</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
