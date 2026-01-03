import { DataRepository } from '../../core/DataRepository.js';

export const ProfileView = {
    render: () => {
        const user = DataRepository.getCurrentUser();
        if (!user) {
            window.location.href = '/login';
            return '';
        }

        const initial = user.name.charAt(0).toUpperCase();

        return `
            <div class="flex-col h-full bg-surface">
                <!-- TOP APP BAR -->
                <header class="md-top-app-bar elevation-0">
                    <button class="md-icon-btn" onclick="window.history.back()">
                        <i class="ph ph-arrow-left"></i>
                    </button>
                    <span class="type-title-medium font-bold uppercase tracking-wider">
                        Meu Perfil
                    </span>
                    <div class="w-12"></div>
                </header>

                <!-- CONTENT -->
                <div class="md-content flex-col items-center pt-8">
                    
                    <!-- AVATAR (Interactive) -->
                    <div class="relative group mb-6">
                        <div class="w-24 h-24 rounded-full bg-surface-variant border-2 border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden">
                            ${user.photo
                ? `<img src="${user.photo}" class="w-full h-full object-cover">`
                : `<span class="type-display text-4xl font-bold text-primary">${initial}</span>`
            }
                            
                            <!-- HOVER OVERLAY (Desktop/Touch) -->
                            <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onclick="alert('Feature Futura: Upload de Foto')">
                                <i class="ph ph-camera text-2xl text-white"></i>
                            </div>
                        </div>
                    </div>

                    <!-- USER DATA FORM -->
                    <div class="md-card w-full flex-col gap-4">
                        <form id="profile-form" class="flex-col gap-4">
                            <div class="md-outlined-field">
                                <label>Nome</label>
                                <input type="text" name="name" value="${user.name}" required>
                            </div>
                            
                            <div class="md-outlined-field">
                                <label>Senha (Reset)</label>
                                <input type="password" name="password" value="${user.password}" placeholder="Nova senha">
                            </div>

                            <button type="submit" class="md-btn-filled">
                                Salvar Alterações
                            </button>
                        </form>
                    </div>

                    <!-- LOGOUT -->
                    <div class="w-full mt-6">
                        <button id="btn-logout" class="md-btn-tonal text-error w-full border-error/20 hover:bg-error/10" style="color: var(--md-sys-color-error); border-color: rgba(255,82,82,0.3)">
                            <i class="ph ph-sign-out mr-2"></i>
                            Sair do App
                        </button>
                    </div>

                    <p class="type-label text-on-surface-variant mt-8 opacity-50">ID: ${user.id.substring(0, 8)}...</p>

                </div>
            </div>
        `;
    },
    afterRender: () => {
        const form = document.getElementById('profile-form');
        const logoutBtn = document.getElementById('btn-logout');

        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const user = DataRepository.getCurrentUser();

            const updates = {
                name: formData.get('name'),
                password: formData.get('password')
            };

            DataRepository.updateUser(user.id, updates);
            alert('Perfil atualizado!');
        };

        logoutBtn.onclick = () => {
            if (confirm('Deseja realmente sair?')) {
                DataRepository.logout();
                window.location.href = '/login';
            }
        };
    }
};
