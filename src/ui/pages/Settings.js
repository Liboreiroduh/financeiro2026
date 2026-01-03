import { DataRepository } from '../../core/DataRepository.js';

export const Settings = {
    render: () => {
        return `
            <div class="flex-col h-full bg-surface">
                <!-- TOP APP BAR -->
                <header class="md-top-app-bar elevation-0">
                    <span class="type-title-medium font-bold uppercase tracking-wider">
                        Mais Opções
                    </span>
                </header>

                <!-- CONTENT -->
                <div class="md-content">
                    
                    <section class="mb-6">
                        <span class="type-label text-primary font-bold px-2 mb-2 block uppercase">Geral</span>
                        <div class="md-card p-0 overflow-hidden flex-col">
                            <button class="md-list-item w-full bg-transparent border-none p-4 flex items-center justify-between active:bg-surface-variant transition-colors" onclick="window.router.navigate('/profile')">
                                <div class="flex items-center gap-4">
                                    <i class="ph ph-user text-2xl text-on-surface-variant"></i>
                                    <span class="type-body text-on-surface">Meu Perfil</span>
                                </div>
                                <i class="ph ph-caret-right text-on-surface-variant"></i>
                            </button>
                             <div class="h-px bg-surface-variant mx-4"></div>
                            <button class="md-list-item w-full bg-transparent border-none p-4 flex items-center justify-between active:bg-surface-variant transition-colors" onclick="alert('Funcionalidade futura: Categorias')">
                                <div class="flex items-center gap-4">
                                    <i class="ph ph-tag text-2xl text-on-surface-variant"></i>
                                    <span class="type-body text-on-surface">Gerenciar Categorias</span>
                                </div>
                                <i class="ph ph-caret-right text-on-surface-variant"></i>
                            </button>
                             <div class="h-px bg-surface-variant mx-4"></div>
                            
                            <!-- LOGOUT: Using Button for logic -->
                             <button class="md-list-item w-full bg-transparent border-none p-4 flex items-center justify-between active:bg-surface-variant transition-colors" 
                               id="btn-logout">
                                <div class="flex items-center gap-4">
                                    <i class="ph ph-sign-out text-2xl" style="color:var(--md-sys-color-error)"></i>
                                    <span class="type-body" style="color:var(--md-sys-color-error)">Sair da Conta</span>
                                </div>
                                <i class="ph ph-caret-right text-on-surface-variant"></i>
                            </button>
                        </div>
                    </section>
                    
                    <section class="mb-6">
                        <span class="type-label text-primary font-bold px-2 mb-2 block uppercase">Dados</span>
                        <div class="md-card p-0 overflow-hidden flex-col">
                             <button class="md-list-item w-full bg-transparent border-none p-4 flex items-center justify-between active:bg-surface-variant transition-colors" onclick="if(confirm('Tem certeza? Isso apaga tudo.')) { localStorage.clear(); window.location.reload(); }">
                                <div class="flex items-center gap-4">
                                    <i class="ph ph-trash text-2xl text-error" style="color:var(--md-sys-color-error)"></i>
                                    <span class="type-body text-error" style="color:var(--md-sys-color-error)">Resetar Aplicativo</span>
                                </div>
                            </button>
                        </div>
                        <p class="type-label text-center text-on-surface-variant mt-4">Versão 2.0.0 (Native Android)</p>
                    </section>

                </div>
            </div>
        `;
    },
    afterRender: () => {
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                DataRepository.logout();
                window.router.navigate('/login');
            };
        }
    }
};
