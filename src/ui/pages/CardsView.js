import { DataRepository } from '../../core/DataRepository.js';

export const CardsView = {
    render: () => {
        const cards = DataRepository.getCards();
        const accounts = DataRepository.getAccounts();

        // Helper to format currency
        const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

        return `
            <div class="flex-col h-full bg-surface">
                <!-- TOP APP BAR -->
                <header class="md-top-app-bar elevation-0">
                    <span class="type-title-medium font-bold uppercase tracking-wider">
                        Minha Carteira
                    </span>
                    <button class="md-icon-btn" id="btn-add-asset">
                        <i class="ph ph-plus"></i>
                    </button>
                </header>

                <!-- CONTENT -->
                <div class="md-content">
                    
                    <!-- 1. ACCOUNTS SECTION -->
                    <div class="flex items-center justify-between mb-2 px-1">
                        <span class="type-label text-secondary font-bold uppercase">Contas Bancárias</span>
                    </div>

                    ${accounts.length === 0 ? `
                        <div class="md-card flex items-center justify-center p-6 text-on-surface-variant bg-surface" style="border-style:dashed;">
                            <span class="type-body">Nenhuma conta registrada</span>
                        </div>
                    ` : ''}

                    <div class="flex-col gap-2 mb-6">
                        ${accounts.map(acc => `
                            <!-- Account Card: Interactive Global Style -->
                            <div class="md-card p-4 flex items-center justify-between active:bg-surface-variant transition-colors" style="margin-bottom:0;">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,0.05); color:white;">
                                        <i class="ph ph-bank text-xl"></i>
                                    </div>
                                    <div class="flex-col">
                                        <span class="type-title font-bold text-on-background">${acc.name}</span>
                                        <span class="type-label text-secondary capitalize text-xs">${acc.type === 'checking' ? 'Conta Corrente' : (acc.type === 'cash' ? 'Dinheiro' : 'Poupança')}</span>
                                    </div>
                                </div>
                                <span class="type-body font-bold text-on-background">${fmt(DataRepository.getAccountBalance(acc.id))}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- 2. CARDS SECTION -->
                    <div class="flex items-center justify-between mb-2 px-1">
                        <span class="type-label text-secondary font-bold uppercase">Cartões de Crédito</span>
                    </div>

                    ${cards.length === 0 ? `
                        <div class="md-card flex items-center justify-center p-6 text-on-surface-variant bg-surface" style="border-style:dashed;">
                            <span class="type-body">Nenhum cartão registrado</span>
                        </div>
                    ` : ''}

                    <div id="cards-list" class="flex-col gap-4">
                        ${cards.map(card => {
            const metrics = DataRepository.getCardMetrics(card.id);
            const percent = card.limit > 0 ? Math.min((metrics.used / card.limit) * 100, 100) : 0;

            return `
                                <div class="md-card overflow-hidden relative">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full flex items-center justify-center text-primary" style="background:rgba(255,255,255,0.05)">
                                                <i class="ph ph-credit-card text-xl"></i>
                                            </div>
                                            <div class="flex-col">
                                                <span class="type-title font-bold text-on-background">${card.name}</span>
                                                <span class="type-label text-secondary">Crédito</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <div class="flex justify-between type-label text-secondary mb-2">
                                            <span>Fatura Atual</span>
                                            <span class="text-on-background font-bold">${fmt(metrics.used)}</span>
                                        </div>
                                        <div class="w-full bg-surface-variant rounded-full h-1">
                                            <div class="bg-primary h-1 rounded-full" style="width: ${percent}%; background:var(--gradient-furtacor);"></div>
                                        </div>
                                        <div class="flex justify-between text-xs mt-2 text-secondary">
                                            <span>Limite: ${fmt(card.limit)}</span>
                                            <span>Disp: <strong class="text-success">${fmt(metrics.available)}</strong></span>
                                        </div>
                                    </div>

                                    <div class="flex justify-between items-center pt-3 border-t border-surface-variant">
                                        <div class="flex-col">
                                            <span class="type-label text-secondary text-xs">Vencimento</span>
                                            <span class="type-body font-bold text-on-background">Dia ${card.dueDay}</span>
                                        </div>
                                        <div class="flex-col items-end">
                                            <span class="type-label text-secondary text-xs">Fechamento</span>
                                            <span class="type-body font-bold text-on-background">Dia ${card.closingDay}</span>
                                        </div>
                                    </div>

                                    <div class="flex justify-end gap-2 mt-4">
                                        <button type="button" class="md-btn-tonal w-auto px-8" data-pay-card="${card.id}" style="height:44px;">
                                            Pagar fatura
                                        </button>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>

                </div>

                <!-- SELECTION DIALOG (Standard Bottom Sheet) -->
                <dialog id="type-dialog" class="bg-surface rounded-t-2xl p-0 w-full fixed bottom-0 left-0 right-0 shadow-2xl m-0 max-w-full transform translate-y-full transition-transform duration-300" style="border:none; border-top:1px solid var(--color-border-subtle);">
                    <div class="flex-col p-6 pb-safe bg-surface">
                        <span class="type-headline font-bold mb-6 text-center text-on-background">Adicionar Novo</span>
                        <div class="flex gap-4">
                            <button id="opt-account" class="flex-1 md-card bg-surface flex-col items-center gap-3 py-8 active:scale-95 transition-transform" style="border:1px solid var(--color-border-subtle)">
                                <i class="ph ph-bank text-4xl text-primary"></i>
                                <span class="font-bold text-on-background">Conta</span>
                            </button>
                            <button id="opt-card" class="flex-1 md-card bg-surface flex-col items-center gap-3 py-8 active:scale-95 transition-transform" style="border:1px solid var(--color-border-subtle)">
                                <i class="ph ph-credit-card text-4xl text-success" style="color:#2EE6A6 !important"></i>
                                <span class="font-bold text-on-background">Cartão</span>
                            </button>
                        </div>
                        <button class="mt-6 py-4 text-center text-secondary font-bold w-full uppercase tracking-widest text-sm" onclick="closeTypeDialog()">Cancelar</button>
                    </div>
                </dialog>

                 <!-- ADD ACCOUNT DIALOG -->
                 <dialog id="account-dialog" class="bg-surface rounded-2xl p-0 shadow-lg" style="width: 90%; max-width: 400px; border:1px solid var(--color-border-subtle);">
                    <form id="account-form" class="flex-col">
                        <div class="p-6 pb-2 bg-surface">
                            <h3 class="type-headline font-bold text-on-background mb-6">Nova Conta</h3>
                            <div class="flex-col gap-2">
                                <div class="md-outlined-field">
                                    <label>Nome da Conta</label>
                                    <input type="text" name="name" placeholder="Ex: Bradesco" required>
                                </div>
                                <div class="md-outlined-field">
                                    <label>Tipo</label>
                                    <select name="type">
                                        <option value="checking">Conta Corrente</option>
                                        <option value="savings">Poupança</option>
                                        <option value="cash">Dinheiro Físico</option>
                                    </select>
                                </div>
                                <div class="md-outlined-field">
                                    <label>Saldo Inicial (R$)</label>
                                    <input type="number" step="0.01" name="initialBalance" placeholder="0,00">
                                </div>
                            </div>
                        </div>
                        <div class="p-4 flex justify-end gap-2 bg-surface items-center border-t" style="border-color:var(--color-border-subtle)">
                            <button type="button" class="md-btn-tonal" onclick="document.getElementById('account-dialog').close()">Cancelar</button>
                            <button type="submit" class="md-btn-filled w-auto px-8">Salvar</button>
                        </div>
                    </form>
                 </dialog>

                 <!-- ADD CARD DIALOG -->
                 <dialog id="card-dialog" class="bg-surface rounded-2xl p-0 shadow-lg" style="width: 90%; max-width: 400px; border:1px solid var(--color-border-subtle);">
                    <form id="card-form" class="flex-col">
                        <div class="p-6 pb-2 bg-surface">
                            <h3 class="type-headline font-bold text-on-background mb-6">Novo Cartão</h3>
                            <div class="flex-col gap-2">
                                <div class="md-outlined-field">
                                    <label>Nome do Cartão</label>
                                    <input type="text" name="name" placeholder="Ex: Nubank" required>
                                </div>
                                <div class="md-outlined-field">
                                    <label>Limite Total (R$)</label>
                                    <input type="number" step="0.01" name="limit" required>
                                </div>
                                <div class="md-outlined-field">
                                    <label>Limite Disponível (R$)</label>
                                    <input type="number" step="0.01" name="availableLimit" placeholder="Ex: 2500,00">
                                </div>
                                <div class="flex gap-4">
                                    <div class="md-outlined-field flex-1">
                                        <label>Fechamento</label>
                                        <input type="number" name="closingDay" placeholder="Dia" required>
                                    </div>
                                    <div class="md-outlined-field flex-1">
                                        <label>Pagamento</label>
                                        <input type="number" name="dueDay" placeholder="Dia" required>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 flex justify-end gap-2 bg-surface items-center border-t" style="border-color:var(--color-border-subtle)">
                            <button type="button" class="md-btn-tonal" onclick="document.getElementById('card-dialog').close()">Cancelar</button>
                            <button type="submit" class="md-btn-filled w-auto px-8">Salvar</button>
                        </div>
                    </form>
                 </dialog>

                 <!-- PAY BILL DIALOG -->
                 <dialog id="pay-dialog" class="bg-surface rounded-2xl p-0 shadow-lg" style="width: 90%; max-width: 400px; border:1px solid var(--color-border-subtle);">
                    <form id="pay-form" class="flex-col">
                        <div class="p-6 pb-2 bg-surface">
                            <h3 class="type-headline font-bold text-on-background mb-6">Pagamento de Fatura</h3>
                            <input type="hidden" name="cardId" value="">
                            <div class="flex-col gap-2">
                                <div class="md-outlined-field">
                                    <label>Valor (R$)</label>
                                    <input type="number" step="0.01" name="amount" placeholder="0,00" required>
                                </div>
                                <div class="md-outlined-field">
                                    <label>Pagar com</label>
                                    <select name="accountId" required>
                                        ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 flex justify-end gap-2 bg-surface items-center border-t" style="border-color:var(--color-border-subtle)">
                            <button type="button" class="md-btn-tonal" onclick="document.getElementById('pay-dialog').close()">Cancelar</button>
                            <button type="submit" class="md-btn-filled w-auto px-8">Confirmar</button>
                        </div>
                    </form>
                 </dialog>
            </div>
        `;
    },
    afterRender: () => {
        const typeDialog = document.getElementById('type-dialog');
        const accDialog = document.getElementById('account-dialog');
        const cardDialog = document.getElementById('card-dialog');
        const payDialog = document.getElementById('pay-dialog');

        // Main FAB
        const btnAdd = document.getElementById('btn-add-asset');
        if (btnAdd) {
            btnAdd.onclick = () => {
                typeDialog.showModal();
                // Simple animation hack
                typeDialog.style.transform = 'translateY(0)';
            }
        }

        // Global Close Helper
        window.closeTypeDialog = () => {
            typeDialog.style.transform = 'translateY(100%)';
            setTimeout(() => typeDialog.close(), 300);
        };

        // Option: Account
        document.getElementById('opt-account').onclick = () => {
            window.closeTypeDialog();
            setTimeout(() => accDialog.showModal(), 300);
        };

        // Option: Card
        document.getElementById('opt-card').onclick = () => {
            window.closeTypeDialog();
            setTimeout(() => cardDialog.showModal(), 300);
        };

        // Form: Account
        document.getElementById('account-form').onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            DataRepository.addAccount({
                name: fd.get('name'),
                type: fd.get('type'),
                initialBalance: parseFloat(fd.get('initialBalance') || 0)
            });
            accDialog.close();
            if (window.router?.refresh) window.router.refresh();
            else window.location.reload();
        };

        // Form: Card
        document.getElementById('card-form').onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const limitTotal = parseFloat(fd.get('limit'));
            const availableRaw = fd.get('availableLimit');
            const availableLimit = availableRaw === null || String(availableRaw).trim() === '' ? limitTotal : parseFloat(availableRaw);
            const initialUsed = Math.max(0, limitTotal - (Number.isFinite(availableLimit) ? availableLimit : limitTotal));

            DataRepository.addCard({
                name: fd.get('name'),
                limit: limitTotal,
                closingDay: fd.get('closingDay'),
                dueDay: fd.get('dueDay'),
                initialUsed
            });
            cardDialog.close();
            if (window.router?.refresh) window.router.refresh();
            else window.location.reload();
        };

        // Pay bill buttons
        document.querySelectorAll('[data-pay-card]').forEach(btn => {
            btn.onclick = () => {
                const cardId = btn.getAttribute('data-pay-card');
                const form = document.getElementById('pay-form');
                form.querySelector('input[name="cardId"]').value = cardId;
                form.querySelector('input[name="amount"]').value = '';
                payDialog.showModal();
            };
        });

        // Pay form submit
        document.getElementById('pay-form').onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const cardId = fd.get('cardId');
            const amount = parseFloat(fd.get('amount'));
            const accountId = fd.get('accountId');

            if (!cardId || !Number.isFinite(amount) || amount <= 0) {
                alert('Informe um valor válido.');
                return;
            }

            DataRepository.addCardPayment(cardId, amount, accountId);
            payDialog.close();
            if (window.router?.refresh) window.router.refresh();
            else window.location.reload();
        };
    }
};
