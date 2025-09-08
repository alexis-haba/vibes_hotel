// ... le reste ...
exports.getMonthlyReport = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  // Aggregation similar to daily, but for month
  const stays = await Stay.aggregate([
    { $match: { startTime: { $gte: start, $lt: end } } },
    { $group: { _id: null, totalIncome: { $sum: '$amount' }, totalStays: { $sum: 1 }, nightStays: { $sum: { $cond: ['$isNight', 1, 0] } } } }
  ]);
  const expenses = await Expense.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
  ]);
  const income = stays[0]?.totalIncome || 0;
  const exp = expenses[0]?.totalExpenses || 0;
  const totalStays = stays[0]?.totalStays || 0;
  const nightStays = stays[0]?.nightStays || 0;
  const occupation = (totalStays / (await Room.countDocuments())) * 100 || 0; // Simple calculation
  res.json({ income, expenses: exp, remaining: income - exp, totalStays, nightStays, occupation });
};

exports.getAnnualReport = async (req, res) => {
  const { year } = req.query;
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  // Similar aggregation for year
  // ... implémentation similaire à monthly, groupe par mois si besoin
  res.json({ /* data */ });
};