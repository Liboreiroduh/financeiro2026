/**
 * Domain Models based on "Arquitetura de App Financeiro.pdf"
 */

export const TransactionType = {
    INCOME: 'income',   // Entrada
    EXPENSE: 'expense'  // Saída
};

export class Transaction {
    constructor({
        id = crypto.randomUUID(),
        type,
        amount,
        date = new Date().toISOString(),
        categoryId,
        accountId = null,
        cardId = null,
        description = '',
        isPaid = true
    }) {
        this.id = id;
        this.type = type;
        this.amount = Number(amount);
        this.date = date;
        this.categoryId = categoryId;
        this.accountId = accountId; // Null if it's a credit card transaction
        this.cardId = cardId;
        this.description = description;
        this.isPaid = isPaid;
    }
}

export class Account {
    constructor({
        id = crypto.randomUUID(),
        name,
        type = 'checking', // checking, cash, savings
        initialBalance = 0,
        color = '#000000'
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.initialBalance = Number(initialBalance);
        this.color = color;
    }
}

export class Category {
    constructor({
        id = crypto.randomUUID(),
        name,
        type, // income, expense
        color = '#999999',
        icon = 'tag'
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.color = color;
        this.icon = icon;
    }
}

export class Card {
    constructor({
        id = crypto.randomUUID(),
        name,
        limit,
        closingDay,
        dueDay,
        color = '#000000',
        initialUsed = 0 // Adjustment for pre-existing debt
    }) {
        this.id = id;
        this.name = name;
        this.limit = Number(limit);
        this.closingDay = parseInt(closingDay);
        this.dueDay = parseInt(dueDay);
        this.color = color;
        this.initialUsed = Number(initialUsed);
    }
}

export class User {
    constructor({
        id = crypto.randomUUID(),
        name,
        password,
        photo = null
    }) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.photo = photo;
    }
}
