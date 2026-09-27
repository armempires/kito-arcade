import React, { useState } from 'react';
import { 
  Megaphone, Plus, Trash2, Edit3, Check, X, 
  ExternalLink, Sparkles, Clock, Globe, RotateCcw,
  CheckSquare, Square, Eye, AlertCircle
} from 'lucide-react';
import { AdCampaign, AdFormat, ECOSYSTEM_PAGES } from '../../types/ads';
import { useAdCampaigns } from '../../hooks/useAdCampaigns';

export const AdsAdminTab: React.FC = () => {
  const { 
    campaigns, 
    addCampaign, 
    updateCampaign, 
    deleteCampaign, 
    toggleActive, 
    resetToDefaults 
  } = useAdCampaigns();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [format, setFormat] = useState<AdFormat>('horizontal');
  const [imageUrl, setImageUrl] = useState('/assets/nexus/nexus_banner_horizontal.png');
  const [ctaText, setCtaText] = useState('Fazer Teste Grátis');
  const [targetUrl, setTargetUrl] = useState('/nexus');
  const [badgeText, setBadgeText] = useState('Destaque Interno');
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [targetPages, setTargetPages] = useState<string[]>(ECOSYSTEM_PAGES.map(p => p.path));
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setFormat('horizontal');
    setImageUrl('/assets/nexus/nexus_banner_horizontal.png');
    setCtaText('Fazer Teste Grátis');
    setTargetUrl('/nexus');
    setBadgeText('Destaque Interno');
    setDurationSeconds(10);
    setTargetPages(ECOSYSTEM_PAGES.map(p => p.path));
    setIsActive(true);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (campaign: AdCampaign) => {
    setEditingId(campaign.id);
    setTitle(campaign.title);
    setSubtitle(campaign.subtitle || '');
    setFormat(campaign.format);
    setImageUrl(campaign.imageUrl);
    setCtaText(campaign.ctaText);
    setTargetUrl(campaign.targetUrl);
    setBadgeText(campaign.badgeText || '');
    setDurationSeconds(campaign.durationSeconds || 10);
    setTargetPages(campaign.targetPages || []);
    setIsActive(campaign.isActive);
    setIsEditing(true);
  };

  const handleTogglePage = (path: string) => {
    setTargetPages(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const handleSelectAllPages = () => {
    setTargetPages(ECOSYSTEM_PAGES.map(p => p.path));
  };

  const handleDeselectAllPages = () => {
    setTargetPages([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !imageUrl.trim() || !targetUrl.trim()) {
      alert('Preencha os campos obrigatórios: Título, Imagem e Link de Destino.');
      return;
    }

    if (targetPages.length === 0) {
      alert('Selecione ao menos 1 página onde o anúncio deve ser veiculado.');
      return;
    }

    if (editingId) {
      updateCampaign(editingId, {
        title,
        subtitle,
        format,
        imageUrl,
        ctaText,
        targetUrl,
        badgeText,
        durationSeconds: Number(durationSeconds) || 10,
        targetPages,
        isActive
      });
      setMessage('Campanha de anúncio atualizada com sucesso!');
    } else {
      addCampaign({
        title,
        subtitle,
        format,
        imageUrl,
        ctaText,
        targetUrl,
        badgeText,
        durationSeconds: Number(durationSeconds) || 10,
        targetPages,
        isActive
      });
      setMessage('Novo anúncio criado e ativado com sucesso!');
    }

    resetForm();
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141418] border border-white/10 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-['Anton']">
              Gestor de Anúncios & Campanhas Internas
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Configure banners dinâmicos com alternância automática a cada 10 segundos. Escolha individualmente em quais páginas cada anúncio aparece ou selecione todas com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all cursor-pointer"
            title="Restaurar anúncios originais do Nexus"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões Nexus</span>
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={handleStartCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Anúncio</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {message && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm animate-in fade-in">
          <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Formulário de Criação/Edição */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-[#141418] border border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {editingId ? 'Editar Anúncio' : 'Novo Anúncio Dinâmico'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Título do Anúncio *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Nexus Cognição & Teste de Q.I."
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            {/* Badge / Tag Superior */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Tag / Selo do Banner
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={e => setBadgeText(e.target.value)}
                placeholder="Ex: Avaliação Cognitiva, Novo, Destaque"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            {/* Subtítulo / Descrição */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Subtítulo / Descrição Curta
              </label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Ex: Avaliação psicométrica de alta precisão baseada em matrizes progressivas. Conheça seu potencial analítico."
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 text-sm resize-none"
              />
            </div>

            {/* Formato do Anúncio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Formato do Banner *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormat('horizontal');
                    if (imageUrl.includes('sidebar')) {
                      setImageUrl('/assets/nexus/nexus_banner_horizontal.png');
                    }
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    format === 'horizontal'
                      ? 'border-emerald-400 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-black text-sm text-emerald-400 mb-0.5">Horizontal (16:9)</div>
                  <div className="text-[10px] text-zinc-400">Para meio de páginas, feeds e artigos</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormat('sidebar');
                    if (imageUrl.includes('horizontal')) {
                      setImageUrl('/assets/nexus/nexus_banner_sidebar.png');
                    }
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    format === 'sidebar'
                      ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-black text-sm text-cyan-400 mb-0.5">Sidebar (3:4 Vertical)</div>
                  <div className="text-[10px] text-zinc-400">Para barras laterais e colunas de apoio</div>
                </button>
              </div>
            </div>

            {/* Tempo de Transição */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>Duração na Tela (Segundos)</span>
                <span className="text-emerald-400 font-mono text-xs">{durationSeconds}s</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={durationSeconds}
                  onChange={e => setDurationSeconds(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-xs text-zinc-400 font-mono shrink-0 w-12 text-right">
                  {durationSeconds} seg
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Padrão recomendado: 10 segundos antes de alternar suavemente para o próximo banner.
              </p>
            </div>

            {/* Imagem do Banner & Presets */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Caminho / URL da Imagem *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="/assets/nexus/nexus_banner_horizontal.png"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 text-sm font-mono"
                />
              </div>

              {/* Botões de Seleção Rápida de Imagens Oficiais do Nexus */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                  Presets Nexus:
                </span>
                <button
                  type="button"
                  onClick={() => setImageUrl('/assets/nexus/nexus_banner_horizontal.png')}
                  className="text-[11px] px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                >
                  Banner Horizontal (Nexus Q.I.)
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl('/assets/nexus/nexus_banner_sidebar.png')}
                  className="text-[11px] px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                >
                  Banner Vertical Sidebar (Nexus Radar)
                </button>
              </div>
            </div>

            {/* Link de Destino */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Link de Destino ao Clicar *
              </label>
              <input
                type="text"
                required
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="Ex: /nexus ou /blog ou https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 text-sm font-mono"
              />
              <p className="text-[10px] text-zinc-500">
                Use <code className="text-emerald-400 font-mono">/nexus</code> para abrir a página dedicada em tela cheia sem container.
              </p>
            </div>

            {/* Texto do Botão CTA */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Texto do Botão de Ação (CTA)
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                placeholder="Ex: Fazer Teste Grátis, Iniciar Avaliação"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            {/* SELEÇÃO MANUAL DE PÁGINAS COM BOTÃO SELECIONAR TODAS */}
            <div className="md:col-span-2 space-y-3 pt-2 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    Páginas e Subpáginas Onde Deve Aparecer *
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Marque manualmente as telas ou use os botões rápidos abaixo.
                  </p>
                </div>

                {/* BOTÃO SELECIONAR TODAS E DESMARCAR TODAS */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllPages}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Selecionar Todas</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeselectAllPages}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Desmarcar Todas</span>
                  </button>
                </div>
              </div>

              {/* Lista de Checkboxes de Páginas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3 rounded-xl bg-black/50 border border-white/10">
                {ECOSYSTEM_PAGES.map(page => {
                  const isChecked = targetPages.includes(page.path);
                  return (
                    <button
                      type="button"
                      key={page.id}
                      onClick={() => handleTogglePage(page.path)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-emerald-500/50 bg-emerald-950/30 text-white'
                          : 'border-white/5 bg-transparent text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {page.name}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 truncate">
                          {page.path}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Ativo / Inativo */}
            <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="text-xs font-bold text-white block">Status da Campanha</span>
                <span className="text-[11px] text-zinc-400">
                  {isActive ? 'O anúncio será veiculado nas páginas selecionadas' : 'Campanha pausada temporariamente'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {isActive ? 'Ativo' : 'Pausado'}
              </button>
            </div>
          </div>

          {/* Botões de Ação do Formulário */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Salvar Alterações' : 'Criar Campanha'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de Anúncios Cadastrados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
          <span>Campanhas Cadastradas ({campaigns.length})</span>
          <span className="text-zinc-500">Alternância dinâmica de 10s ativa</span>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#141418] border border-white/10 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-sm text-zinc-400 font-bold">Nenhum anúncio cadastrado no momento.</p>
            <button
              type="button"
              onClick={resetToDefaults}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              Carregar Anúncios do Nexus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map(camp => (
              <div
                key={camp.id}
                className={`p-5 rounded-2xl border transition-all ${
                  camp.isActive
                    ? 'bg-[#141418] border-white/10 hover:border-emerald-500/40 shadow-xl'
                    : 'bg-[#0f0f12] border-white/5 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  {/* Thumbnail e Info Básica */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                      <img
                        src={camp.imageUrl}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-emerald-400 uppercase">
                        {camp.format}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          camp.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}>
                          {camp.isActive ? '● Ativo' : '○ Pausado'}
                        </span>

                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded border border-white/5">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          {camp.durationSeconds || 10}s
                        </span>

                        {camp.badgeText && (
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            {camp.badgeText}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-white truncate">
                        {camp.title}
                      </h4>

                      {camp.subtitle && (
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {camp.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          Destino: <code className="text-emerald-300 font-mono">{camp.targetUrl}</code>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span>Botão: <strong className="text-white">{camp.ctaText}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Páginas onde o anúncio está ativo & Ações */}
                  <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Tags de Páginas */}
                    <div className="flex items-center gap-1 flex-wrap md:justify-end max-w-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase mr-1">
                        Páginas:
                      </span>
                      {camp.targetPages.length === ECOSYSTEM_PAGES.length ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                          Todas as páginas ({ECOSYSTEM_PAGES.length})
                        </span>
                      ) : (
                        camp.targetPages.map(pagePath => {
                          const pageObj = ECOSYSTEM_PAGES.find(p => p.path === pagePath);
                          return (
                            <span
                              key={pagePath}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300"
                              title={pageObj?.name || pagePath}
                            >
                              {pagePath}
                            </span>
                          );
                        })
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(camp.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          camp.isActive
                            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                        }`}
                      >
                        {camp.isActive ? 'Pausar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(camp)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir a campanha "${camp.title}"?`)) {
                            deleteCampaign(camp.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                        title="Excluir campanha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
