(function () {
  if (window.__KITO_GAME_AD_INITIALIZED__) return;
  window.__KITO_GAME_AD_INITIALIZED__ = true;

  const DEFAULT_CAMPAIGNS = [
    {
      id: 'nexus-sidebar-promo',
      title: 'Teste seu Q.I. com Nexus',
      subtitle: 'Avaliação psicométrica baseada em matrizes progressivas. Conheça seu potencial analítico.',
      format: 'sidebar',
      imageUrl: '/assets/nexus/nexus_banner_sidebar.png',
      ctaText: 'Iniciar Avaliação',
      targetUrl: '/nexus',
      badgeText: 'Avaliação Cognitiva',
      durationSeconds: 10,
      isActive: true
    },
    {
      id: 'nexus-horizontal-promo',
      title: 'Nexus Cognição & Q.I.',
      subtitle: '26 desafios de raciocínio espacial, dedução e lógica analítica com percentil imediato.',
      format: 'horizontal',
      imageUrl: '/assets/nexus/nexus_banner_horizontal.png',
      ctaText: 'Fazer Teste Grátis',
      targetUrl: '/nexus',
      badgeText: 'Destaque Oficial',
      durationSeconds: 10,
      isActive: true
    }
  ];

  function getStoredCampaigns() {
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
      console.warn('[KitoAds] Erro ao ler anúncios do localStorage:', e);
    }
    return DEFAULT_CAMPAIGNS;
  }

  let campaigns = getStoredCampaigns();
  let currentIndex = 0;
  let isHovered = false;
  let timer = null;

  // Injetar estilos CSS
  const style = document.createElement('style');
  style.id = 'kito-game-ad-styles';
  style.textContent = `
    .kito-ad-root {
      font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      z-index: 2147483640;
    }
    .kito-ad-root * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* DESKTOP BANNER: FLUTUANTE NA LATERAL DIREITA */
    @media (min-width: 1024px) {
      .kito-ad-container {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 270px;
        background: linear-gradient(180deg, rgba(11, 17, 30, 0.95), rgba(7, 12, 22, 0.98));
        border: 1px solid rgba(34, 211, 238, 0.35);
        border-radius: 20px;
        padding: 14px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(6, 182, 212, 0.2);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
      }
      .kito-ad-container:hover {
        border-color: rgba(34, 211, 238, 0.7);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(6, 182, 212, 0.35);
        transform: translateY(-52%) scale(1.02);
      }
      .kito-ad-thumb {
        width: 100%;
        height: 140px;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 12px;
        position: relative;
        background: #000;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .kito-ad-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      .kito-ad-container:hover .kito-ad-thumb img {
        transform: scale(1.05);
      }
    }

    /* MOBILE BANNER: BARRA INFERIOR DOCK RESPONSIVA */
    @media (max-width: 1023px) {
      .kito-ad-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        background: linear-gradient(180deg, rgba(13, 19, 33, 0.96), rgba(6, 10, 18, 0.99));
        border-top: 1px solid rgba(34, 211, 238, 0.4);
        padding: 8px 12px;
        box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      .kito-ad-thumb {
        width: 58px;
        height: 58px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        background: #000;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .kito-ad-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .kito-ad-content {
        flex: 1;
        min-width: 0;
      }
      .kito-ad-cta-btn {
        flex-shrink: 0;
        padding: 8px 14px !important;
        font-size: 11px !important;
      }
    }

    /* ELEMENTOS COMUNS */
    .kito-ad-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .kito-ad-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #38bdf8;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.35);
      padding: 2px 7px;
      border-radius: 6px;
    }
    .kito-ad-tag-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 6px #38bdf8;
      animation: kito-pulse 1.8s infinite;
    }
    @keyframes kito-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .kito-ad-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 2px 5px;
      border-radius: 4px;
      transition: color 0.2s;
    }
    .kito-ad-close:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
    .kito-ad-title {
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 3px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .kito-ad-subtitle {
      color: #94a3b8;
      font-size: 10px;
      line-height: 1.35;
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    @media (max-width: 1023px) {
      .kito-ad-subtitle {
        margin-bottom: 0;
        -webkit-line-clamp: 1;
      }
      .kito-ad-header {
        margin-bottom: 2px;
      }
    }
    .kito-ad-cta-btn {
      display: block;
      width: 100%;
      text-align: center;
      background: linear-gradient(90deg, #10b981, #06b6d4);
      color: #041019;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 10px 14px;
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
      transition: all 0.25s ease;
      cursor: pointer;
      border: none;
    }
    .kito-ad-cta-btn:hover {
      background: linear-gradient(90deg, #34d399, #22d3ee);
      box-shadow: 0 0 25px rgba(34, 211, 238, 0.6);
      transform: translateY(-1px);
    }
    .kito-ad-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 8px;
    }
    @media (max-width: 1023px) {
      .kito-ad-dots { display: none; }
    }
    .kito-ad-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.2s;
      cursor: pointer;
    }
    .kito-ad-dot.active {
      width: 12px;
      border-radius: 3px;
      background: #38bdf8;
      box-shadow: 0 0 6px #38bdf8;
    }
  `;
  document.head.appendChild(style);

  // Criar elemento container
  const wrapper = document.createElement('div');
  wrapper.className = 'kito-ad-root';
  wrapper.id = 'kito-game-ad-banner-widget';

  function render() {
    campaigns = getStoredCampaigns();
    if (!campaigns || campaigns.length === 0) {
      wrapper.innerHTML = '';
      return;
    }

    if (currentIndex >= campaigns.length) currentIndex = 0;
    const current = campaigns[currentIndex];
    if (!current) return;

    const dotsHtml = campaigns.length > 1
      ? campaigns.map((_, i) => `<span class="kito-ad-dot ${i === currentIndex ? 'active' : ''}" data-idx="${i}"></span>`).join('')
      : '';

    wrapper.innerHTML = `
      <div class="kito-ad-container" id="kito-ad-card">
        <div class="kito-ad-thumb" id="kito-ad-link-img">
          <img src="${current.imageUrl || '/assets/nexus/nexus_banner_sidebar.png'}" alt="${current.title}" />
        </div>
        <div class="kito-ad-content">
          <div class="kito-ad-header">
            <span class="kito-ad-tag">
              <span class="kito-ad-tag-dot"></span>
              ${current.badgeText || 'Parceria Oficial'}
            </span>
            <button class="kito-ad-close" id="kito-ad-close-btn" title="Ocultar anúncio">✕</button>
          </div>
          <div class="kito-ad-title">${current.title}</div>
          ${current.subtitle ? `<div class="kito-ad-subtitle">${current.subtitle}</div>` : ''}
          <a class="kito-ad-cta-btn" id="kito-ad-cta" href="${current.targetUrl || '/nexus'}">
            ${current.ctaText || 'Acessar'} →
          </a>
          ${dotsHtml ? `<div class="kito-ad-dots">${dotsHtml}</div>` : ''}
        </div>
      </div>
    `;

    bindEvents(current);
  }

  function handleNavigate(url) {
    const target = url || '/nexus';
    // Se estiver em iframe no Arcade, redireciona a janela principal do navegador
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = target;
        return;
      }
    } catch (e) {
      // Cross-origin fallback
    }
    window.location.href = target;
  }

  function bindEvents(current) {
    const card = wrapper.querySelector('#kito-ad-card');
    const closeBtn = wrapper.querySelector('#kito-ad-close-btn');
    const ctaBtn = wrapper.querySelector('#kito-ad-cta');
    const thumb = wrapper.querySelector('#kito-ad-link-img');
    const dots = wrapper.querySelectorAll('.kito-ad-dot');

    if (card) {
      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mouseleave', () => { isHovered = false; });
      card.addEventListener('touchstart', () => { isHovered = true; }, { passive: true });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(100%)';
          setTimeout(() => { wrapper.style.display = 'none'; }, 300);
        }
      });
    }

    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigate(current.targetUrl);
      });
    }

    if (thumb) {
      thumb.style.cursor = 'pointer';
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigate(current.targetUrl);
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(dot.getAttribute('data-idx'), 10);
        if (!isNaN(idx)) {
          currentIndex = idx;
          render();
        }
      });
    });
  }

  function startRotation() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (isHovered) return;
      if (campaigns && campaigns.length > 1) {
        const card = wrapper.querySelector('#kito-ad-card');
        if (card) {
          card.style.opacity = '0.3';
          setTimeout(() => {
            currentIndex = (currentIndex + 1) % campaigns.length;
            render();
          }, 250);
        } else {
          currentIndex = (currentIndex + 1) % campaigns.length;
          render();
        }
      }
    }, 10000); // 10 segundos
  }

  // Inicializar quando o DOM estiver pronto
  function init() {
    if (!document.body) {
      window.addEventListener('DOMContentLoaded', init);
      return;
    }
    document.body.appendChild(wrapper);
    render();
    startRotation();

    // Ouvir atualizações de anúncios no CRM
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.includes('kito_arcade_ad_campaigns')) {
        render();
      }
    });
  }

  init();
})();
