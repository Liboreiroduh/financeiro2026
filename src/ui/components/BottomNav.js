export const BottomNav = () => {
  return `
      <nav class="bottom-nav">
        <a href="/" class="nav-item" data-link>
          <i class="ph ph-house"></i>
          <span>Home</span>
        </a>
        <a href="/transactions" class="nav-item" data-link>
          <i class="ph ph-arrows-left-right"></i>
          <span>Registrar</span>
        </a>
        <a href="/monthly" class="nav-item" data-link>
          <i class="ph ph-calendar"></i>
          <span>Mensal</span>
        </a>
        <a href="/accounts" class="nav-item" data-link>
          <i class="ph ph-wallet"></i>
          <span>Carteira</span>
        </a>
        <a href="/more" class="nav-item" data-link>
          <i class="ph ph-dots-three"></i>
          <span>Mais</span>
        </a>
      </nav>
    `;
};

// Style for Bottom Nav (Updated for Premium Dark)
export const BottomNavStyles = `
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px; /* Taller for mobile */
      background: rgba(9, 9, 11, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255,255,255,0.08); /* Subtle glass border */
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 1000;
    }
  
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 11px;
      font-weight: 500;
      gap: 4px;
      flex: 1;
      height: 100%;
      transition: all 0.2s ease;
      position: relative;
    }
  
    .nav-item i {
      font-size: 26px;
      margin-bottom: 2px;
      transition: transform 0.2s;
    }
  
    .nav-item.active {
      color: var(--md-sys-color-on-surface);
      text-shadow: 0 0 12px rgba(108, 99, 255, 0.35);
    }
    
    .nav-item.active i {
      transform: translateY(-2px);
      color: var(--md-sys-color-primary);
    }
    
    /* Active Indicator Dot */
    .nav-item.active::after {
        content: '';
        position: absolute;
        top: 10px;
        width: 4px; height: 4px;
        background: var(--md-sys-color-primary);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(108, 99, 255, 0.6);
    }
  `;
