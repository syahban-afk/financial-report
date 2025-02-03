const Finance = require('../models/financeModel');

const getFinances = async (req, res) => {
    try {
        const finances = await Finance.find({ user: req.user.id });
        res.status(200).json(finances);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

const createFinance = async (req, res) => {
    const { title, amount, type, category } = req.body;

    if (!title || !amount || !type || !category) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipe harus income atau expense' });
    }

    if (!['salary', 'education', 'health', 'food', 'transportation', 'entertainment', 'utilities', 'others'].includes(category)) {
        return res.status(400).json({ message: 'Kategori harus salary, food, transportation, entertainment, utilities, others' });
    }

    try {
        const finance = await Finance.create({
            user: req.user.id,
            title,
            amount,
            type,
            category
        });

        res.status(201).json(finance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat data finance' });
    }
};

const updateFinance = async (req, res) => {
    const { id } = req.params;

    try {
        const finance = await Finance.findById(id);

        if (!finance || finance.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }

        const updatedFinance = await Finance.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedFinance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate data finance' });
    }
};

const deleteFinance = async (req, res) => {
    const { id } = req.params;

    try {
        const finance = await Finance.findById(id);

        if (!finance || finance.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }

        await finance.deleteOne();
        res.status(200).json({ message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus data finance' });
    }
};

const getFinanceReport = async (req, res) => {
    try {
        const finances = await Finance.find({ user: req.user.id });

        const totalIncomes = finances
            .filter((finance) => finance.type === 'income')
            .reduce((acc, item) => acc + item.amount, 0);

        const totalExpenses = finances
            .filter((finance) => finance.type === 'expense')
            .reduce((acc, item) => acc + item.amount, 0);

        const balance = totalIncomes - totalExpenses;

        res.status(200).json({
            totalIncomes,
            totalExpenses,
            balance,
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

const filterFinances = async (req, res) => {
    try {
        const { type, month, year } = req.query;

        const filter = { user: req.user.id };

        if (type) {
            if (['income', 'expense'].includes(type)) {
                filter.type = type;
            } else {
                return res.status(400).json({ message: 'Tipe tidak valid. Gunakan "income" atau "expense"' });
            }
        }

        if (month) {
            filter.createdAt = {
                ...filter.createdAt,
                $gte: new Date(year || new Date().getFullYear(), month - 1, 1),
                $lt: new Date(year || new Date().getFullYear(), month, 1),
            };
        }

        if (year && !month) {
            filter.createdAt = {
                ...filter.createdAt,
                $gte: new Date(year, 0, 1),
                $lt: new Date(Number(year) + 1, 0, 1),
            };
        }

        const finances = await Finance.find(filter);

        res.status(200).json(finances);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error });
    }
};

const getCategoryStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const finances = await Finance.find({ user: userId });

        const categoryStats = finances.reduce((acc, curr) => {
            if (!acc[curr.category]) {
                acc[curr.category] = { total: 0, count: 0 };
            }
            acc[curr.category].total += curr.amount;
            acc[curr.category].count += 1;
            return acc;
        }, {});

        res.status(200).json(categoryStats);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan statistik kategori' });
    }
};

module.exports = {
    getFinances,
    createFinance,
    updateFinance,
    deleteFinance,
    getFinanceReport,
    filterFinances,
    getCategoryStats,
};