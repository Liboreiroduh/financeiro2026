import { DataRepository } from '../../core/DataRepository.js';

export const LoginPage = {
    render: () => {
        return `
            <div class="md-screen bg-surface auth-screen">
                <!-- BACKGROUND BLOBS -->
                <div class="auth-blob" style="top:-25%; right:-25%; width:80%; height:80%; background: radial-gradient(circle, rgba(108, 99, 255, 0.85) 0%, transparent 70%);"></div>
                <div class="auth-blob" style="bottom:-20%; left:-20%; width:70%; height:70%; background: radial-gradient(circle, rgba(46, 230, 166, 0.55) 0%, transparent 70%);"></div>

                <!-- LOGO / BRAND -->
                <div class="auth-brand animate-fade-in-up">
                    <div class="auth-logo" aria-hidden="true">
                        <i class="ph ph-wallet" style="font-size:34px; color:#fff;"></i>
                    </div>
                    <div class="text-center">
                        <div class="type-headline font-bold text-on-surface">Financeiro</div>
                        <div class="type-body text-on-surface-variant opacity-80">Controle simples, do seu jeito</div>
                    </div>
                </div>

                <!-- LOGIN CARD -->
                <div class="md-card auth-card flex-col gap-4 p-6 animate-fade-in-up" style="animation-delay: 0.06s;">
                    
                    <!-- TOGGLE -->
                    <div class="md-segment mb-2" role="tablist" aria-label="Autenticação">
                        <button type="button" id="tab-login" class="md-segment-btn active" role="tab" aria-selected="true">Entrar</button>
                        <button type="button" id="tab-register" class="md-segment-btn" role="tab" aria-selected="false">Criar conta</button>
                    </div>

                    <form id="auth-form" class="flex-col gap-4">
                        <input type="hidden" id="auth-mode" value="login">
                        
                        <div class="md-outlined-field">
                            <label>Usuário</label>
                            <input type="text" name="username" placeholder="Seu nome" required autocomplete="username">
                        </div>

                        <div class="md-outlined-field">
                            <label>Senha</label>
                            <input type="password" name="password" placeholder="••••••" required autocomplete="current-password">
                        </div>

                        <button type="submit" class="md-btn-filled mt-2">
                            <span id="btn-text">ACESSAR</span>
                        </button>
                    </form>

                    <p id="error-msg" class="text-error text-center type-label font-bold opacity-0 transition-all" style="min-height:20px;"></p>
                </div>

                <div class="type-label text-on-surface-variant opacity-50 text-center" style="position:relative; z-index:1;">
                    Local-first • Offline • Privado
                </div>
            </div>
        `;
    },
    afterRender: () => {
        const form = document.getElementById('auth-form');
        const loginTab = document.getElementById('tab-login');
        const registerTab = document.getElementById('tab-register');
        const modeInput = document.getElementById('auth-mode');
        const btnText = document.getElementById('btn-text');
        const errorMsg = document.getElementById('error-msg');

        const setMode = (mode) => {
            modeInput.value = mode;
            errorMsg.style.opacity = '0';
            if (mode === 'login') {
                loginTab.classList.add('active');
                loginTab.setAttribute('aria-selected', 'true');
                registerTab.classList.remove('active');
                registerTab.setAttribute('aria-selected', 'false');
                btnText.innerText = 'ACESSAR';
            } else {
                registerTab.classList.add('active');
                registerTab.setAttribute('aria-selected', 'true');
                loginTab.classList.remove('active');
                loginTab.setAttribute('aria-selected', 'false');
                btnText.innerText = 'CRIAR CONTA';
            }
        };

        loginTab.onclick = () => setMode('login');
        registerTab.onclick = () => setMode('register');

        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const user = formData.get('username');
            const pass = formData.get('password');
            const mode = modeInput.value;

            try {
                let sessionUser;
                if (mode === 'login') {
                    sessionUser = DataRepository.loginUser(user, pass);
                    if (!sessionUser) throw new Error('Usuário ou senha incorretos');
                } else {
                    sessionUser = DataRepository.registerUser(user, pass);
                    DataRepository.loginUser(user, pass); // Auto-login after register
                    // Seed initial data for new user if needed (Accounts/Categories are global currently but could be localized later)
                }

                // Success
                window.location.href = '/'; // Full reload to init session
            } catch (err) {
                errorMsg.innerText = err.message;
                errorMsg.style.opacity = '1';

                // Shake animation
                const card = document.querySelector('.md-card');
                card.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 300 });
            }
        };
    }
};
