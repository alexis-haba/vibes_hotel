// backend/src/controllers/ExpenseController.js
const Expense = require('../models/Expense');
const AuditLog = require('../models/AuditLog');

exports.addExpense = async (req, res) => {
  try {
    const { expenses } = req.body;

    // ✅ Vérifie que c’est bien un tableau
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ message: "Aucune dépense reçue" });
    }

    // ✅ Sauvegarder chaque dépense
    const saved = [];
    for (const exp of expenses) {
      const expense = new Expense({
        description: exp.description,
        amount: exp.amount,
        date: new Date(),
      });
      await expense.save();
      saved.push(expense);

      // ✅ Audit log par dépense
      await new AuditLog({
        action: "add_expense",
        userId: req.user.id,
        details: { expenseId: expense._id },
      }).save();
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("Erreur addExpense:", err);
    res.status(500).json({ message: "Erreur lors de l’enregistrement" });
  }
};

exports.getExpenses = async (req, res) => {
  const { date } = req.query;
  let filter = {};
  if (date) {
    filter.date = {
      $gte: new Date(date),
      $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
    };
  }
  const expenses = await Expense.find(filter);
  res.json(expenses);
};
