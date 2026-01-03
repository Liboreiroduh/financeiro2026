import { DataRepository } from '../../core/DataRepository.js';
import { TransactionType } from '../../core/Models.js';

export const TransactionForm = {
    render: () => {
        const urlParams = new URLSearchParams(window.location.search);
        let currentType = urlParams.get('type') || TransactionType.EXPENSE;

        const cards = DataRepository.getCards();
        const isExp = currentType === 'expense';
        const accounts = DataRepository.getAccounts();

        return `
            <!-- SCAFFOLD -->
            <div class="flex-col h-full bg-surface">
                
                <!-- TOP APP BAR (Material 3) -->
                <header class="md-top-app-bar elevation-0">
                    <button class="md-icon-btn" id="btn-back">
                        <i class="ph ph-arrow-left"></i>
                    </button>
                    <span class="type-title-medium font-bold uppercase tracking-wider">
                        Nova Transação
                    </span>
                    <div class="w-12"></div> <!-- Spacer -->
                </header>

                <!-- CONTENT (Scrollable) -->
                <div class="md-content">
                    
                    <form id="md-form" class="flex-col gap-4">
                        <input type="hidden" name="type" value="${currentType}">
                        
                        <!-- 1. MODE TABS (Global System) -->
                        <div class="flex gap-4 mb-6">
                            <button type="button" class="flex-1 ${isExp ? 'md-btn-filled' : 'md-btn-tonal'} mode-switch" data-type="expense">
                                Despesa
                            </button>
                            <button type="button" class="flex-1 ${!isExp ? 'md-btn-filled' : 'md-btn-tonal'} mode-switch" data-type="income">
                                Receita
                            </button>
                        </div>

                        <!-- 2. AMOUNT INPUT (Display Large + Centered + High Contrast) -->
                        <div class="flex-col items-center justify-center py-6">
                            <label class="md-sys-typescale-label-large text-secondary mb-1">Valor</label>
                            <div class="relative w-full flex justify-center items-center">
                                <span class="md-sys-typescale-headline-small absolute left-0 text-right w-[45%] pointer-events-none text-secondary">R$</span>
                                <input type="number" name="amount" class="bg-transparent border-none text-center outline-none w-full md-sys-typescale-display-large font-bold text-on-background" 
                                       placeholder="0,00" autofocus style="font-size: 57px; appearance: textfield;">
                            </div>
                        </div>

                        <!-- 3. DESCRIPTION (Outlined Field) -->
                        <div class="md-outlined-field mt-4">
                            <label>Descrição</label>
                            <input type="text" name="description" placeholder="Ex: Mercado">
                        </div>

                        <!-- 4. CATEGORY (Chips) -->
                        <div class="flex-col gap-2">
                             <label class="md-sys-typescale-label-large text-secondary">Categoria</label>
                             <div class="md-chip-group" id="chip-container">
                                <!-- JS Injection -->
                             </div>
                             <input type="hidden" name="categoryId" required>
                        </div>

                        <!-- 5. DETAILS (Date, Payment) -->
                        <div class="md-outlined-field mt-4">
                            <label>Data</label>
                            <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <!-- Payment Method -->
                        <div class="md-outlined-field">
                             <label>Conta / Cartão</label>
                             <select name="sourceId">
                                ${accounts.map(a => `<option value="ACC_${a.id}">${a.name} (Conta)</option>`).join('')}
                                <option value="wallet">Carteira (Padrão)</option>
                                ${cards.map(c => `<option value="CARD_${c.id}">${c.name} (Crédito)</option>`).join('')}
                             </select>
                        </div>

                        <!-- Installments (Only for card expenses) -->
                        <div class="md-outlined-field hidden" id="installments-field">
                            <label>Parcelas</label>
                            <input type="number" name="installments" min="1" max="24" value="1">
                        </div>

                        <!-- 6. ACTION (In-Flow, bottom of scroll) -->
                        <div class="mt-8 mb-4">
                            <button type="button" id="btn-submit" class="md-btn-filled">
                                Confirmar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },
    afterRender: () => {
        const form = document.getElementById('md-form');
        const submitBtn = document.getElementById('btn-submit');
        const urlParams = new URLSearchParams(window.location.search);
        let currentType = urlParams.get('type') || 'expense';

        const installmentsField = document.getElementById('installments-field');
        const sourceSelect = form.querySelector('select[name="sourceId"]');

        const updateInstallmentsVisibility = () => {
            const sourceId = sourceSelect?.value || '';
            const isCard = sourceId.startsWith('CARD_');
            const isExpense = currentType === TransactionType.EXPENSE || currentType === 'expense';
            if (installmentsField) {
                installmentsField.classList.toggle('hidden', !(isCard && isExpense));
            }
        };

        // Chip Logic
        const container = document.getElementById('chip-container');
        const categories = DataRepository.getCategories().filter(c => c.type === currentType);

        container.innerHTML = categories.map(cat => `
            <button type="button" class="md-chip" data-id="${cat.id}">
                ${cat.name}
            </button>
        `).join('');

        container.querySelectorAll('.md-chip').forEach(chip => {
            chip.onclick = () => {
                container.querySelectorAll('.md-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                form.querySelector('input[name="categoryId"]').value = chip.dataset.id;
            }
        });

        // Mode Switch (FIXED: Uses currentTarget to catch click anywhere on button)
        // Mode Switch (FIXED: Uses currentTarget to catch click anywhere on button)
        document.querySelectorAll('.mode-switch').forEach(btn => {
            btn.onclick = (e) => {
                const targetType = e.currentTarget.dataset.type;
                if (targetType !== currentType) {
                    // 1. VISUAL UPDATE (Optimistic UI)
                    document.querySelectorAll('.mode-switch').forEach(b => {
                        b.classList.remove('md-btn-filled');
                        b.classList.add('md-btn-tonal');
                    });

                    const clickedBtn = e.currentTarget;
                    clickedBtn.classList.remove('md-btn-tonal');
                    clickedBtn.classList.add('md-btn-filled');

                    // 2. NAVIGATE via Router
                    // Use router to update query param without full reload
                    const newPath = `/transactions?type=${targetType}`;
                    if (window.router) {
                        window.router.navigate(newPath);
                    } else {
                        window.location.href = newPath;
                    }
                }
            }
        });

        if (sourceSelect) {
            sourceSelect.onchange = updateInstallmentsVisibility;
        }
        updateInstallmentsVisibility();

        // Submit Interaction
        submitBtn.onclick = () => {
            const formData = new FormData(form);
            if (!formData.get('amount') || !formData.get('categoryId')) {
                alert('Preencha valor e categoria');
                return;
            }
            // ... save logic (simplified) ...
            const amount = parseFloat(formData.get('amount'));
            const sourceId = formData.get('sourceId');

            let accId = null;
            let cardId = null;
            let type = currentType;

            if (sourceId?.startsWith('ACC_')) {
                accId = sourceId.replace('ACC_', '');
            } else if (sourceId === 'wallet') {
                accId = DataRepository.getAccounts()[0]?.id;
                if (!accId) {
                    alert('Nenhuma conta encontrada. Crie uma conta primeiro.');
                    return;
                }
            } else if (sourceId?.startsWith('CARD_')) {
                cardId = sourceId.replace('CARD_', '');
            } else {
                accId = DataRepository.getAccounts()[0]?.id;
            }

            const baseDate = new Date(formData.get('date'));
            const categoryId = formData.get('categoryId');
            const description = formData.get('description');

            const isCardExpense = Boolean(cardId) && type === TransactionType.EXPENSE;
            const installments = Math.max(1, Math.min(24, parseInt(formData.get('installments') || '1', 10) || 1));

            if (isCardExpense && installments > 1) {
                const total = Math.round(amount * 100);
                const per = Math.floor(total / installments);
                let remainder = total - (per * installments);

                for (let i = 1; i <= installments; i++) {
                    const cents = per + (remainder > 0 ? 1 : 0);
                    remainder = Math.max(0, remainder - 1);

                    const d = new Date(baseDate);
                    d.setMonth(d.getMonth() + (i - 1));

                    DataRepository.addTransaction({
                        type,
                        amount: cents / 100,
                        description: `${description || ''}${description ? ' ' : ''}(${i}/${installments})`.trim(),
                        categoryId,
                        accountId: null,
                        cardId,
                        isPaid: false,
                        date: d.toISOString()
                    });
                }
            } else {
                DataRepository.addTransaction({
                    type,
                    amount,
                    description,
                    categoryId,
                    accountId: accId,
                    cardId,
                    isPaid: cardId ? false : true,
                    date: baseDate.toISOString()
                });
            }
            window.history.back();
        }

        // Back Button
        const btnBack = document.getElementById('btn-back');
        if (btnBack) {
            btnBack.onclick = () => window.history.back();
        }
    }
}
