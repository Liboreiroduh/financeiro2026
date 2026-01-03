import { StorageManager } from './StorageManager.js';
import { Transaction, Account, Category, Card } from './Models.js';

const KEYS = {
    TRANSACTIONS: 'transactions',
    ACCOUNTS: 'accounts',
    CATEGORIES: 'categories',
    CARDS: 'cards'
};

const getUserKey = (key) => {
    const userId = StorageManager.get('fin_session');
    if (!userId) return null; // Or throw error? For now safe return null
    return `fin_${userId}_${key}`;
};

export class DataRepository {
    // --- Transactions ---
    static getTransactions() {
        const key = getUserKey(KEYS.TRANSACTIONS);
        if (!key) return [];
        return StorageManager.get(key, []);
    }

    static addTransaction(data) {
        const key = getUserKey(KEYS.TRANSACTIONS);
        if (!key) throw new Error("User not logged in");

        const transactions = this.getTransactions();
        const newTransaction = new Transaction(data);
        transactions.push(newTransaction);
        StorageManager.set(key, transactions);
        return newTransaction;
    }

    // --- Accounts ---
    static getAccounts() {
        const key = getUserKey(KEYS.ACCOUNTS);
        if (!key) return [];
        return StorageManager.get(key, []);
    }

    static addAccount(data) {
        const key = getUserKey(KEYS.ACCOUNTS);
        if (!key) throw new Error("User not logged in");

        const accounts = this.getAccounts();
        const newAccount = new Account(data);
        accounts.push(newAccount);
        StorageManager.set(key, accounts);
        return newAccount;
    }

    static seedAccounts() {
        const existing = this.getAccounts();
        if (existing.length > 0) return;

        const defaultAccount = new Account({
            name: 'Carteira',
            type: 'cash',
            initialBalance: 0,
            color: '#4CAF50'
        });

        const firstAccount = new Account({
            name: 'Carteira',
            type: 'cash',
            initialBalance: 0,
            color: '#4CAF50'
        });

        const accounts = [firstAccount];
        const key = getUserKey(KEYS.ACCOUNTS);
        if (key) StorageManager.set(key, accounts);
        return accounts;
    }

    static getAccountBalance(accountId) {
        const accounts = this.getAccounts();
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;

        const transactions = this.getTransactions();

        // Sum incomes
        const income = transactions
            .filter(t => t.accountId === accountId && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Sum expenses (including card payments if they are linked to this account)
        const expense = transactions
            .filter(t => t.accountId === accountId && (t.type === 'expense' || t.type === 'payment'))
            .reduce((sum, t) => sum + t.amount, 0);

        // Payments (Transactions where type is payment? Or expense with special category?)
        // In this model, 'payment' type is used for Credit Card Payment.
        // If I pay a credit card from my account, it's an expense or transfer?
        // Usually: Expense on Account (Category: Payment) -> Credit to Card.
        // If strictly following the 'payment' type added in addCardPayment:
        // It has accountId = null in the code right now. 
        // We need to fix addCardPayment to potentially link an account if we want it to decrease balance.
        // For now, let's stick to the prompt requirement: 
        // "Account.balance ... = initialBalance + sum(incomes) - sum(expenses)"

        return (account.initialBalance || 0) + income - expense;
    }

    // --- Categories ---
    static getCategories() {
        const key = getUserKey(KEYS.CATEGORIES);
        if (!key) return [];
        return StorageManager.get(key, []);
    }

    static seedCategories() {
        const existing = this.getCategories();
        if (existing.length > 0) return;

        const defaults = [
            { name: 'Alimentação', type: 'expense', color: '#FF5252', icon: 'pizza' },
            { name: 'Transporte', type: 'expense', color: '#448AFF', icon: 'car' },
            { name: 'Moradia', type: 'expense', color: '#FFC107', icon: 'house' },
            { name: 'Lazer', type: 'expense', color: '#E040FB', icon: 'confetti' },
            { name: 'Salário', type: 'income', color: '#4CAF50', icon: 'money' }
        ];

        const seeded = defaults.map(d => new Category(d));
        const key = getUserKey(KEYS.CATEGORIES);
        if (key) StorageManager.set(key, seeded);
        return seeded;
    }

    // --- Cards ---
    static getCards() {
        const key = getUserKey(KEYS.CARDS);
        if (!key) return [];
        return StorageManager.get(key, []);
    }

    static addCard(data) {
        const key = getUserKey(KEYS.CARDS);
        if (!key) throw new Error("User not logged in");

        const cards = this.getCards();
        const newCard = new Card(data);
        cards.push(newCard);
        StorageManager.set(key, cards);
        return newCard;
    }

    static getCardMetrics(cardId) {
        const card = this.getCards().find(c => c.id === cardId);
        if (!card) return { used: 0, available: 0, limit: 0 };

        const transactions = this.getTransactions();

        // Payments (Credits to the card)
        const payments = transactions
            .filter(t => t.cardId === cardId && t.type === 'payment')
            .reduce((sum, t) => sum + t.amount, 0);

        // Limit used: sum of unpaid card expenses (including future installments) + initialUsed - payments
        const unpaidCardExpenses = transactions
            .filter(t => t.cardId === cardId && t.type === 'expense' && t.isPaid !== true)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalUsed = (unpaidCardExpenses + (card.initialUsed || 0)) - payments;

        return {
            limit: card.limit,
            used: Math.max(0, totalUsed),
            available: Math.min(card.limit, card.limit - totalUsed)
        };
    }

    static addCardPayment(cardId, amount, accountId = null) {
        // Record a 'Payment' transaction for the card
        this.addTransaction({
            type: 'payment',
            amount: amount,
            description: 'Pagamento de Fatura',
            categoryId: null,
            accountId: accountId, // If we pay from account, we link it
            cardId: cardId,
            date: new Date().toISOString()
        });

        // If accountId is provided, we should also record an expense on the account?
        // Or does 'payment' type automatically reduce account balance?
        // In getAccountBalance above, I didn't include 'payment' type.
        // Let's handle it by creating a separate expense for the account OR 
        // updating getAccountBalance to subtract 'payment' type if accountId is present.
        // I'll update getAccountBalance (in my head/next step) or just treat this as the record.
        // Simpler: Just make 'payment' reduce account balance in getAccountBalance?
        // No, let's keep it simple. If I pay a card, I usually create a transaction.
        // Let's just create this transaction. I need to make sure getAccountBalance handles it.
        // I will add 'payment' to the expense filter in getAccountBalance in a future edit or verify it now.
        // Actually, let's update getAccountBalance in the previous chunk? 
        // Too late, I'm in this chunk. I will assume I need to revisit getAccountBalance or 
        // just accept that for now 'payment' type might not reduce account balance unless I add it to the filter.
        // WAIT. I can modify the getAccountBalance chunk above? No, it's sequential.
        // I'll stick to the specific request for now.
    }

    // --- Authentication (Users & Session) ---
    static getUsers() {
        return StorageManager.get('fin_users', []);
    }

    static registerUser(name, password) {
        const users = this.getUsers();
        if (users.find(u => u.name === name)) {
            throw new Error('Usuário já existe');
        }
        // Import User from Models dynamically or assume simple object if import fails? 
        // We imported models above. Ideally use new User() but simpler object is persistent-safe.
        const newUser = {
            id: crypto.randomUUID(),
            name,
            password, // Stored in plain text as requested for local-first simplicity
            photo: null
        };
        users.push(newUser);
        StorageManager.set('fin_users', users);
        return newUser;
    }

    static loginUser(name, password) {
        const users = this.getUsers();
        const user = users.find(u => u.name === name && u.password === password);
        if (!user) return null;

        StorageManager.set('fin_session', user.id);
        return user;
    }

    static getCurrentUser() {
        const userId = StorageManager.get('fin_session', null);
        if (!userId) return null;
        return this.getUsers().find(u => u.id === userId) || null;
    }

    static logout() {
        StorageManager.remove('fin_session');
    }

    static updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updates };
        StorageManager.set('fin_users', users);
        return users[index];
    }
}
