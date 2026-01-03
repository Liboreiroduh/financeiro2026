import { DataRepository } from '../../core/DataRepository.js';
import { TransactionType } from '../../core/Models.js';

export const MonthlyView = {
    render: () => {
        return `
            <div class="flex-col h-full bg-surface">
                <!-- TOP APP BAR -->
                <header class="md-top-app-bar elevation-0">
                    <div class="flex-1">
                        <span class="type-title-medium font-bold uppercase tracking-wider block" id="header-title">Extrato</span>
                        <span class="type-label text-on-surface-variant">Visão Mensal</span>
                    </div>
                    <!-- DATE SELECTOR -->
                    <div class="relative">
                        <input type="month" id="month-selector" class="bg-transparent border-none text-on-surface font-bold text-right outline-none absolute inset-0 opacity-0 cursor-pointer">
                        <button class="md-icon-btn"><i class="ph ph-calendar-blank"></i></button>
                    </div>
                </header>

                <div class="md-content">
                    <!-- SUMMARY CARDS (Global System) -->
                     <div class="flex gap-4 mb-6">
                        <div class="md-card flex-1 p-4 flex-col gap-1 items-start">
                            <span class="type-label text-secondary uppercase tracking-wider text-xs">Entradas</span>
                            <span class="type-headline font-bold text-success" id="month-income">R$ 0,00</span>
                        </div>
                         <div class="md-card flex-1 p-4 flex-col gap-1 items-start">
                            <span class="type-label text-secondary uppercase tracking-wider text-xs">Saídas</span>
                            <span class="type-headline font-bold text-error" id="month-expense">R$ 0,00</span>
                        </div>
                    </div>

                    <!-- CHART SECTION -->
                    <div class="md-card flex-col mb-6">
                         <span class="type-title font-bold mb-4 text-on-background">Por Categoria</span>
                         <div style="height: 220px; position: relative;">
                             <canvas id="expenses-chart"></canvas>
                         </div>
                    </div>

                    <!-- TRANSACTIONS LIST -->
                    <span class="type-label text-secondary font-bold px-2 mb-2 block uppercase text-xs tracking-widest">Extrato</span>
                    <div id="month-list" class="flex-col gap-1">
                        <!-- Injected -->
                    </div>
                </div>
            </div>
        `;
    },
    afterRender: () => {
        // 1. DATE SETUP
        const selector = document.getElementById('month-selector');
        const headerTitle = document.getElementById('header-title');

        // Defaults to current month or URL param logic could go here
        const now = new Date();
        const currentY = now.getFullYear();
        const currentM = now.getMonth() + 1; // 1-12

        // Use stored state or default? Simple local var for now, but UI needs persistence if reloading?
        // Let's use the selector value as state.
        if (!selector.value) {
            selector.value = `${currentY}-${currentM.toString().padStart(2, '0')}`;
        }

        const updateView = () => {
            if (!selector.value) return;
            const parts = selector.value.split('-');
            if (parts.length < 2) return;

            const selYear = Number(parts[0]);
            const selMonth = Number(parts[1]);

            // Validate date parts
            if (isNaN(selYear) || isNaN(selMonth)) return;

            const dateObj = new Date(selYear, selMonth - 1, 1);
            if (isNaN(dateObj.getTime())) return;

            const selectedYearMonth = selector.value; // YYYY-MM

            // Update Header
            try {
                headerTitle.innerText = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            } catch (e) {
                console.error("Date error:", e);
                return;
            }

            // FILTER
            const allTransactions = DataRepository.getTransactions();
            const transactions = allTransactions.filter(t => {
                if (!t.date) return false;
                const raw = typeof t.date === 'string' ? t.date : '';
                const yearMonth = raw.length >= 7 ? raw.slice(0, 7) : '';
                if (yearMonth) return yearMonth === selectedYearMonth;

                try {
                    const d = new Date(t.date);
                    if (isNaN(d.getTime())) return false;
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    return `${d.getFullYear()}-${m}` === selectedYearMonth;
                } catch {
                    return false;
                }
            });

            // LOGIC (Reused)
            const categories = DataRepository.getCategories();
            let totalIncome = 0;
            let totalExpense = 0;
            const categoryTotals = {};

            transactions.forEach(t => {
                if (t.type === TransactionType.INCOME) {
                    totalIncome += t.amount;
                } else {
                    // Include 'expense' and 'payment' ?
                    // Usually 'payment' is internal. Only 'expense' affects charts?
                    // If I filter by month, strict filter.
                    if (t.type === TransactionType.EXPENSE) {
                        totalExpense += t.amount;
                        if (!categoryTotals[t.categoryId]) categoryTotals[t.categoryId] = 0;
                        categoryTotals[t.categoryId] += t.amount;
                    }
                }
            });

            // DOM UPDATES
            // Summary
            document.getElementById('month-income').innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome);
            document.getElementById('month-expense').innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense);

            // Chart
            const chartContainer = document.getElementById('expenses-chart').parentElement;
            chartContainer.innerHTML = '<canvas id="expenses-chart"></canvas>'; // Reset canvas

            if (totalExpense > 0 && window.Chart) {
                const ctx = document.getElementById('expenses-chart').getContext('2d');
                const dataVals = Object.values(categoryTotals);
                const dataLabels = Object.keys(categoryTotals).map(id => (categories.find(c => c.id === id) || {}).name || 'Outros');
                const bgColors = Object.keys(categoryTotals).map(id => (categories.find(c => c.id === id) || {}).color || '#ccc');

                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: dataLabels,
                        datasets: [{ data: dataVals, backgroundColor: bgColors, borderWidth: 0 }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true, color: '#fff' } } }
                    }
                });
            } else {
                // Empty State for Chart
                chartContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50">
                        <i class="ph ph-chart-pie mb-2 text-2xl"></i>
                        <span class="text-sm">Sem despesas registradas</span>
                    </div>
                `;
            }

            // List
            const listEl = document.getElementById('month-list');
            if (transactions.length === 0) {
                listEl.innerHTML = '<p class="text-center text-on-surface-variant py-4">Sem movimentações neste mês</p>';
            } else {
                listEl.innerHTML = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => {
                    const cat = categories.find(c => c.id === t.categoryId) || {};
                    const isIncome = t.type === TransactionType.INCOME;
                    const sign = isIncome ? '+' : '-';
                    return `
                        <div class="md-list-item">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl" style="background:rgba(255,255,255,0.05); color:white;">
                                    <i class="ph ph-${cat.icon || 'receipt'}"></i>
                                </div>
                                <div class="flex-col">
                                    <span class="type-body font-bold text-on-background">${t.description || cat.name}</span>
                                    <span class="type-label text-secondary text-xs">${new Date(t.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <span class="type-body font-bold ${isIncome ? 'text-success' : 'text-on-background'}">
                                ${sign}${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    `;
                }).join('');
            }
        };

        // Init
        updateView();

        // Listen
        selector.onchange = updateView;
    }
}
