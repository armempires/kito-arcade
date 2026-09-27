(function () {
  if (window.__KITO_GAME_AD_SLOT_INITIALIZED__) return;
  window.__KITO_GAME_AD_SLOT_INITIALIZED__ = true;

  const DEFAULT_CAMPAIGNS = [
    {
      id: 'nexus-horizontal-promo',
      title: 'Nexus Cognição & Teste de Q.I.',
      subtitle: 'Avaliação psicométrica de alta precisão baseada em matrizes de Raven e lógica analítica. Conheça seu potencial.',
      format: 'horizontal',
      imageUrl: '/assets/nexus/nexus_banner_horizontal.png',
      ctaText: 'Fazer Teste Grátis',
      targetUrl: '/nexus',
      badgeText: 'Avaliação Cognitiva'
    },
    {
      id: 'nexus-sidebar-promo',
      title: 'Teste seu Q.I. com Nexus',
      subtitle: 'Desafie seu raciocínio espacial, dedução e memória em uma experiência neurocientífica imersiva.',
      format: 'sidebar',
      imageUrl: '/assets/nexus/nexus_banner_sidebar.png',
      ctaText: 'Iniciar Avaliação',
      targetUrl: '/nexus',
      badgeText: 'Destaque Kito Arcade'
    }
  ];

  function getCampaigns() {
    try {
      const raw = localStorage.getItem('kito_arcade_ad_campaigns_v2') || localStorage.getItem('kito_arcade_ad_campaigns_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(c => c.isActive !== false);
          if (active.length > 0) return active;
        }
      }
    } catch (e) {
      console.warn('[KitoAds] Erro ao ler campanhas do localStorage:', e);
    }
    return DEFAULT_CAMPAIGNS;
  }

  let campaigns = getCampaigns();
  let currentIndex = 0;
  let isHovered = false;

  // Injetar estilos CSS de alta fidelidade (idêntico ao Kito Arcade Blog)
  const styleEl = document.createElement('style');
  styleEl.id = 'kito-game-ad-slot-styles';
  styleEl.textContent = `
    /* SLOT HORIZONTAL ENCORPADO NO CONTEÚDO */
    .kito-arcade-ad-wrapper {
      width: 100%;
      max-width: 1500px;
      margin: 32px auto 40px auto;
      padding: 0 16px;
      box-sizing: border-box;
      font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
      clear: both;
      display: block !important;
    }
    .kito-arcade-ad-card {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      border: 1px solid rgba(16, 185, 129, 0.35);
      background: linear-gradient(135deg, rgba(8, 14, 28, 0.97) 0%, rgba(11, 20, 36, 0.98) 50%, rgba(6, 15, 26, 0.97) 100%);
      padding: 22px 26px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.15);
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 26px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    .kito-arcade-ad-card:hover {
      border-color: rgba(52, 211, 153, 0.65);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.3);
      transform: translateY(-2px);
    }
    .kito-arcade-ad-thumb {
      width: 300px;
      height: 165px;
      border-radius: 14px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      background: #030712;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .kito-arcade-ad-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.5s ease;
      display: block;
    }
    .kito-arcade-ad-card:hover .kito-arcade-ad-thumb img {
      transform: scale(1.04);
    }
    .kito-arcade-ad-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 700;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #34d399;
      background: rgba(6, 78, 59, 0.7);
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(52, 211, 153, 0.4);
      margin-bottom: 10px;
    }
    .kito-arcade-ad-content {
      flex: 1;
      min-width: 0;
      text-align: left;
    }
    .kito-arcade-ad-title {
      font-size: 21px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px 0;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .kito-arcade-ad-subtitle {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 16px 0;
      max-width: 720px;
    }
    .kito-arcade-ad-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 24px;
      border-radius: 12px;
      background: linear-gradient(90deg, #10b981 0%, #14b8a6 100%);
      color: #022c22 !important;
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-decoration: none !important;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .kito-arcade-ad-btn:hover {
      background: linear-gradient(90deg, #34d399 0%, #2dd4bf 100%);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.55);
    }

    /* SLOT LATERAL COMPACTO (PARA SIDEBAR DE APPS COMO KITO ESPORTES) */
    .kito-arcade-sidebar-ad {
      margin: 16px 12px;
      padding: 12px;
      border-radius: 16px;
      border: 1px solid rgba(34, 211, 238, 0.3);
      background: linear-gradient(180deg, rgba(8, 14, 28, 0.95), rgba(6, 12, 22, 0.98));
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
      text-align: left;
      font-family: 'Montserrat', system-ui, sans-serif;
      box-sizing: border-box;
    }
    .kito-arcade-sidebar-ad .sidebar-thumb {
      width: 100%;
      height: 110px;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 10px;
      background: #000;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .kito-arcade-sidebar-ad .sidebar-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .kito-arcade-sidebar-ad .sidebar-title {
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }
    .kito-arcade-sidebar-ad .sidebar-sub {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0 0 10px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .kito-arcade-sidebar-ad .sidebar-btn {
      display: block;
      width: 100%;
      text-align: center;
      padding: 8px 12px;
      border-radius: 8px;
      background: linear-gradient(90deg, #06b6d4, #3b82f6);
      color: #021a28 !important;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none !important;
      box-sizing: border-box;
    }

    /* RESPONSIVIDADE (MOBILE & TABLET) */
    @media (max-width: 768px) {
      .kito-arcade-ad-card {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding: 16px;
      }
      .kito-arcade-ad-thumb {
        width: 100%;
        height: 160px;
      }
      .kito-arcade-ad-title {
        font-size: 18px;
      }
      .kito-arcade-ad-subtitle {
        font-size: 12px;
        margin-bottom: 14px;
      }
      .kito-arcade-ad-btn {
        width: 100%;
        justify-content: center;
        text-align: center;
      }
    }
  `;
  document.head.appendChild(styleEl);

  function createHorizontalAd() {
    const wrapper = document.createElement('div');
    wrapper.className = 'kito-arcade-ad-wrapper';
    wrapper.id = 'kito-arcade-content-ad-slot';

    wrapper.addEventListener('mouseenter', () => { isHovered = true; });
    wrapper.addEventListener('mouseleave', () => { isHovered = false; });

    function renderCampaign() {
      const camp = campaigns[currentIndex] || DEFAULT_CAMPAIGNS[0];
      const isHorizontal = camp.format === 'horizontal';
      const imgUrl = camp.imageUrl || (isHorizontal ? '/assets/nexus/nexus_banner_horizontal.png' : '/assets/nexus/nexus_banner_sidebar.png');

      wrapper.innerHTML = `
        <div class="kito-arcade-ad-card">
          <div class="kito-arcade-ad-thumb">
            <img src="${imgUrl}" alt="${camp.title}" />
          </div>
          <div class="kito-arcade-ad-content">
            <div class="kito-arcade-ad-badge">
              <span>●</span>
              <span>${camp.badgeText || 'Parceria & Destaque // Kito Arcade'}</span>
            </div>
            <h3 class="kito-arcade-ad-title">${camp.title}</h3>
            <p class="kito-arcade-ad-subtitle">${camp.subtitle || 'Avaliação cognitiva e teste psicométrico interativo de alta precisão.'}</p>
            <a href="${camp.targetUrl || '/nexus'}" target="_top" class="kito-arcade-ad-btn">
              <span>${camp.ctaText || 'Fazer Teste Grátis'}</span>
              <span>→</span>
            </a>
          </div>
        </div>
      `;
    }

    renderCampaign();

    // Rotação dinâmica de 10 segundos
    setInterval(() => {
      if (isHovered || campaigns.length <= 1) return;
      currentIndex = (currentIndex + 1) % campaigns.length;
      renderCampaign();
    }, 10000);

    return wrapper;
  }

  function createSidebarAd() {
    const asideWrapper = document.createElement('div');
    asideWrapper.className = 'kito-arcade-sidebar-ad';
    asideWrapper.id = 'kito-arcade-sidebar-ad-slot';

    function renderSidebarCampaign() {
      const camp = campaigns.find(c => c.format === 'sidebar') || campaigns[0] || DEFAULT_CAMPAIGNS[1];
      const imgUrl = camp.imageUrl || '/assets/nexus/nexus_banner_sidebar.png';

      asideWrapper.innerHTML = `
        <div class="sidebar-thumb">
          <img src="${imgUrl}" alt="${camp.title}" />
        </div>
        <h4 class="sidebar-title">${camp.title}</h4>
        <p class="sidebar-sub">${camp.subtitle || 'Teste psicométrico de alta precisão.'}</p>
        <a href="${camp.targetUrl || '/nexus'}" target="_top" class="sidebar-btn">
          ${camp.ctaText || 'Iniciar Avaliação'} →
        </a>
      `;
    }

    renderSidebarCampaign();
    return asideWrapper;
  }

  function mountAds() {
    // 1. Inserir Anúncio Horizontal Encorpado no Conteúdo Principal
    if (!document.getElementById('kito-arcade-content-ad-slot')) {
      const horizontalAd = createHorizontalAd();

      // Kito Esportes: inserir após os cards na .space-y-6
      const esportesContainer = document.querySelector('.space-y-6');
      if (esportesContainer) {
        esportesContainer.appendChild(horizontalAd);
      } else {
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.appendChild(horizontalAd);
        } else {
          const rootEl = document.getElementById('root');
          if (rootEl && rootEl.firstElementChild) {
            rootEl.firstElementChild.appendChild(horizontalAd);
          } else {
            document.body.appendChild(horizontalAd);
          }
        }
      }
    }

    // 2. Se a página tiver barra lateral (como Kito Esportes), inserir o anúncio lateral
    if (!document.getElementById('kito-arcade-sidebar-ad-slot')) {
      const sidebarNav = document.querySelector('.border-sidebar-border') || document.querySelector('aside');
      if (sidebarNav) {
        const sidebarAd = createSidebarAd();
        // Inserir antes do rodapé do sidebar ou no final do container
        const sidebarFooter = sidebarNav.querySelector('.p-3') || sidebarNav.lastElementChild;
        if (sidebarFooter) {
          sidebarNav.insertBefore(sidebarAd, sidebarFooter);
        } else {
          sidebarNav.appendChild(sidebarAd);
        }
      }
    }
  }

  // Executar na montagem e após carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(mountAds, 300);
    });
  } else {
    setTimeout(mountAds, 300);
  }

  // Observer para SPA/React que montam após o carregamento inicial
  const observer = new MutationObserver(() => {
    if (!document.getElementById('kito-arcade-content-ad-slot') || (!document.getElementById('kito-arcade-sidebar-ad-slot') && document.querySelector('.border-sidebar-border'))) {
      mountAds();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
