import { DataRepository } from '../../core/DataRepository.js';
import { TransactionType } from '../../core/Models.js';

export const HomePage = {
    render: () => {
        const transactions = DataRepository.getTransactions();

        let income = 0;
        let expense = 0;
        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) income += t.amount;
            else if (t.type === TransactionType.EXPENSE) expense += t.amount;
        });

        const accounts = DataRepository.getAccounts();
        const totalBalance = accounts.reduce((acc, account) => acc + DataRepository.getAccountBalance(account.id), 0);

        const cards = DataRepository.getCards();

        income = 0;
        expense = 0;
        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) income += t.amount;
            else if (t.type === TransactionType.EXPENSE) expense += t.amount;
        });

        const balance = totalBalance;
        const recent = [...transactions].reverse().slice(0, 5);
        const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

        return `
            <div class="flex-col h-full">
                <!-- Top App Bar -->
                <header class="md-top-app-bar elevation-0">
                    <div class="flex items-center gap-2">
                         <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-surface-variant font-bold">D</div>
                         <span class="type-title text-on-surface">Olá, Duh</span>
                    </div>
                    <button class="md-icon-btn"><i class="ph ph-bell"></i></button>
                </header>

                <!-- Content with Padding for Bottom Nav -->
                <div class="md-content">
                    
                    <!-- Balance Card -->
                    <div class="md-card flex-col gap-2 relative overflow-hidden">
                        <span class="type-label text-on-surface-variant">Saldo Total</span>
                        <h1 class="type-display font-bold text-on-surface" style="font-size: 45px;">${fmt(balance)}</h1>
                        <div class="flex gap-4 mt-2">
                             <div class="flex items-center gap-2">
                                <i class="ph ph-arrow-down text-success"></i>
                                <span class="type-body text-success font-bold">${fmt(income)}</span>
                             </div>
                             <div class="flex items-center gap-2">
                                <i class="ph ph-arrow-up text-error" style="color:var(--md-sys-color-error)"></i>
                                <span class="type-body text-error font-bold" style="color:var(--md-sys-color-error)">${fmt(expense)}</span>
                             </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-between gap-2 mb-4">
                        <button class="md-btn-tonal flex-1" onclick="window.router.navigate('/transactions?type=expense')">
                            <i class="ph ph-minus mr-2"></i> Pagar
                        </button>
                        <button class="md-btn-tonal flex-1" onclick="window.router.navigate('/transactions?type=income')">
                            <i class="ph ph-plus mr-2"></i> Receber
                        </button>
                    </div>

                    <!-- Recent Transactions -->
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="type-title">Últimas</h3>
                        <button class="text-primary type-label font-bold border-none bg-transparent" onclick="window.router.navigate('/monthly')">Ver tudo</button>
                    </div>

                    <!-- Quick View: Accounts -->
                    <div class="flex justify-between items-center mb-2 mt-4">
                        <h3 class="type-title">Contas</h3>
                        <button class="text-primary type-label font-bold border-none bg-transparent" onclick="window.router.navigate('/accounts')">Gerenciar</button>
                    </div>

                    <div class="flex-col gap-2 mb-4">
                        ${accounts.length === 0 ? '<p class="type-body text-center text-on-surface-variant py-4">Sem contas</p>' : ''}
                        ${accounts.map(acc => `
                            <div class="md-card p-4 flex items-center justify-between" style="margin-bottom:0;">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                                        <i class="ph ph-wallet text-xl" style="color:var(--md-sys-color-primary)"></i>
                                    </div>
                                    <div class="flex-col">
                                        <span class="type-body font-bold text-on-background">${acc.name}</span>
                                        <span class="type-label text-secondary text-xs">${acc.type === 'checking' ? 'Conta Corrente' : (acc.type === 'cash' ? 'Dinheiro' : 'Poupança')}</span>
                                    </div>
                                </div>
                                <span class="type-body font-bold text-on-background">${fmt(DataRepository.getAccountBalance(acc.id))}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Quick View: Cards -->
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="type-title">Cartões</h3>
                        <button class="text-primary type-label font-bold border-none bg-transparent" onclick="window.router.navigate('/accounts')">Ver todos</button>
                    </div>

                    <div class="flex-col gap-2 mb-4">
                        ${cards.length === 0 ? '<p class="type-body text-center text-on-surface-variant py-4">Sem cartões</p>' : ''}
                        ${cards.map(card => {
                            const metrics = DataRepository.getCardMetrics(card.id);
                            const percent = card.limit > 0 ? Math.min((metrics.used / card.limit) * 100, 100) : 0;
                            return `
                                <div class="md-card p-4 flex-col gap-2" style="margin-bottom:0;">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,0.05);">
                                                <i class="ph ph-credit-card text-xl" style="color:var(--md-sys-color-primary)"></i>
                                            </div>
                                            <div class="flex-col">
                                                <span class="type-body font-bold text-on-background">${card.name}</span>
                                                <span class="type-label text-secondary text-xs">Fatura: ${fmt(metrics.used)}</span>
                                            </div>
                                        </div>
                                        <span class="type-label text-secondary text-xs">Disp: <strong class="text-success">${fmt(metrics.available)}</strong></span>
                                    </div>
                                    <div class="w-full bg-surface-variant rounded-full h-1">
                                        <div class="bg-primary h-1 rounded-full" style="width:${percent}%; background:var(--gradient-furtacor);"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="flex-col gap-2">
                        ${recent.length === 0 ? '<p class="type-body text-center text-on-surface-variant py-4">Sem movimentações</p>' : ''}
                        ${recent.map(t => {
            const cat = DataRepository.getCategories().find(c => c.id === t.categoryId) || {};
            const isExp = t.type === TransactionType.EXPENSE;
            return `
                                <div class="flex items-center justify-between py-3 border-b border-surface-variant mb-1">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xl">
                                            <i class="ph ph-${cat.icon || 'receipt'}"></i>
                                        </div>
                                        <div class="flex-col">
                                            <span class="type-body font-bold text-on-surface">${t.description || cat.name}</span>
                                            <span class="type-label text-on-surface-variant">${new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span class="type-body font-bold ${isExp ? 'text-on-surface' : 'text-success'}">
                                        ${isExp ? '-' : '+'}${fmt(t.amount)}
                                    </span>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    afterRender: () => { }
};
