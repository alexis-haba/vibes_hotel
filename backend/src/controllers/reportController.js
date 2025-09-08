const Stay = require('../models/Stay');
const Expense = require('../models/Expense');
const Room = require('../models/Room');
const Entry = require('../models/DailyEntry');
const { generatePDF } = require('../utils/generatePDF');
const { generateDailyPDF, generateWeeklyPDF, generateMonthlyPDF, generateAnnualPDF } = require('../utils/generatePDF');
const { generateExcel } = require('../utils/generateExcel');
const getWorkdayRange = require('../utils/getWorkdayRange');

// ================== RAPPORTS ==================
exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const { start, end } = getWorkdayRange(new Date(date));

    const [stays, expenses] = await Promise.all([
      Stay.aggregate([
        { $match: { startTime: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
            totalStays: { $sum: 1 },
            nightStays: { $sum: { $cond: ['$isNight', 1, 0] } }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ])
    ]);

    const income = stays[0]?.totalIncome || 0;
    const exp = expenses[0]?.totalExpenses || 0;
    const totalStays = stays[0]?.totalStays || 0;
    const nightStays = stays[0]?.nightStays || 0;
    const occupation = (totalStays / (await Room.countDocuments())) * 100 || 0;

    res.json({
      range: { start, end },
      income,
      expenses: exp,
      remaining: income - exp,
      totalStays,
      nightStays,
      occupation
    });
  } catch (err) {
    console.error("getDailyReport error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1, 8, 0, 0, 0); // commence à 8h
    const end = new Date(year, month, 1, 7, 59, 59, 999);  // finit le dernier jour à 7h59

    const [stays, expenses] = await Promise.all([
      Stay.aggregate([
        { $match: { startTime: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
            totalStays: { $sum: 1 },
            nightStays: { $sum: { $cond: ['$isNight', 1, 0] } }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ])
    ]);

    const income = stays[0]?.totalIncome || 0;
    const exp = expenses[0]?.totalExpenses || 0;
    const totalStays = stays[0]?.totalStays || 0;
    const nightStays = stays[0]?.nightStays || 0;
    const occupation = (totalStays / (await Room.countDocuments())) * 100 || 0;

    res.json({
      range: { start, end },
      income,
      expenses: exp,
      remaining: income - exp,
      totalStays,
      nightStays,
      occupation
    });
  } catch (err) {
    console.error("getMonthlyReport error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};

exports.getAnnualReport = async (req, res) => {
  try {
    const { year } = req.query;
    const start = new Date(year, 0, 1, 8, 0, 0, 0);
    const end = new Date(year + 1, 0, 1, 7, 59, 59, 999);

    const [stays, expenses] = await Promise.all([
      Stay.aggregate([
        { $match: { startTime: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
            totalStays: { $sum: 1 },
            nightStays: { $sum: { $cond: ['$isNight', 1, 0] } }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ])
    ]);

    const income = stays[0]?.totalIncome || 0;
    const exp = expenses[0]?.totalExpenses || 0;
    const totalStays = stays[0]?.totalStays || 0;
    const nightStays = stays[0]?.nightStays || 0;
    const occupation = (totalStays / (await Room.countDocuments())) * 100 || 0;

    res.json({
      range: { start, end },
      income,
      expenses: exp,
      remaining: income - exp,
      totalStays,
      nightStays,
      occupation
    });
  } catch (err) {
    console.error("getAnnualReport error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};

// ================== SUMMARY ==================
exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const { start, end } = getWorkdayRange(date ? new Date(date) : new Date());

    // Stays
    const stays = await Stay.find({ startTime: { $gte: start, $lte: end } });

    const hourIncome = stays
      .filter(s => s.phase === "hour")
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    const nightIncome = stays
      .filter(s => s.phase === "night")
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    const stayExpenses = stays.reduce(
      (sum, s) => sum + (s.expenses || []).reduce((x, e) => x + (e.amount || 0), 0),
      0
    );

    // Daily Entries
    const entries = await Entry.find({ date: { $gte: start, $lte: end } });

    const entriesIncome = entries.reduce((sum, e) => sum + (e.totalIncome || 0), 0);
    const entriesExpenses = entries.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);

    // Dépenses directes
    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);

    const otherExpenses = expenses[0]?.totalExpenses || 0;

    // Totaux
    const totalIncome = hourIncome + nightIncome + entriesIncome;
    const totalExpenses = stayExpenses + entriesExpenses + otherExpenses;
    const remaining = totalIncome - totalExpenses;
    
    res.json({
      range: { start, end },
      hourIncome,
      nightIncome,
      entriesIncome,
      totalIncome,
      totalExpenses,
      remaining
    });
  } catch (err) {
    console.error("getDailySummary error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};



// ================== GRAPHIQUES ==================
// Par heure (quotidien)
exports.getDailyGraphData = async (req, res) => {
  try {
    const { date } = req.query;
    const { start, end } = getWorkdayRange(new Date(date));

    const [stays, expenses] = await Promise.all([
      Stay.aggregate([
        { $match: { startTime: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: { hour: { $hour: "$startTime" } },
            income: { $sum: "$amount" },
            totalStays: { $sum: 1 }
          }
        },
        { $sort: { "_id.hour": 1 } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: { hour: { $hour: "$date" } },
            totalExpenses: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.hour": 1 } }
      ])
    ]);

    const data = [];
    for (let h = 0; h < 24; h++) {
      const stay = stays.find(s => s._id.hour === h);
      const exp = expenses.find(e => e._id.hour === h);
      data.push({
        hour: h,
        income: stay?.income || 0,
        totalStays: stay?.totalStays || 0,
        expenses: exp?.totalExpenses || 0,
        remaining: (stay?.income || 0) - (exp?.totalExpenses || 0)
      });
    }

    res.json({ range: { start, end }, data });
  } catch (err) {
    console.error("getDailyGraphData error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};


// Par mois (revenus + dépenses) dans une année donnée

exports.getMonthlyGraphData = async (req, res) => {
  try {
    const { year } = req.query;

    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);

    const [stays, expenses] = await Promise.all([
      Stay.aggregate([
        { $match: { startTime: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: { month: { $month: "$startTime" } },
            income: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.month": 1 } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: { month: { $month: "$date" } },
            expenses: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.month": 1 } }
      ])
    ]);

    const data = [];
    for (let m = 1; m <= 12; m++) {
      const stay = stays.find(s => s._id.month === m);
      const exp = expenses.find(e => e._id.month === m);
      data.push({
        month: m,
        income: stay?.income || 0,
        expenses: exp?.expenses || 0,
        remaining: (stay?.income || 0) - (exp?.expenses || 0)
      });
    }

    res.json(data);
  } catch (err) {
    console.error("getMonthlyGraphData error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};




// Par année (revenus + dépenses)
exports.getAnnualGraphData = async (req, res) => {
  try {
    const [stays, expenses] = await Promise.all([
      Stay.aggregate([
        {
          $group: {
            _id: { year: { $year: "$startTime" } },
            income: { $sum: "$amount" },
            totalStays: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1 } }
      ]),
      Expense.aggregate([
        {
          $group: {
            _id: { year: { $year: "$date" } },
            totalExpenses: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1 } }
      ])
    ]);

    const years = [
      ...new Set([
        ...stays.map(s => s._id.year),
        ...expenses.map(e => e._id.year)
      ])
    ].sort();

    const data = years.map(y => {
      const stay = stays.find(s => s._id.year === y);
      const exp = expenses.find(e => e._id.year === y);
      return {
        year: y,
        income: stay?.income || 0,
        expenses: exp?.totalExpenses || 0,
        remaining: (stay?.income || 0) - (exp?.totalExpenses || 0),
        totalStays: stay?.totalStays || 0
      };
    });

    res.json(data);
  } catch (err) {
    console.error("getAnnualGraphData error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};




// ================== SUMMARY ==================
exports.getTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    req.query.date = today.toISOString().split("T")[0];
    return this.getDailySummary(req, res);
  } catch (err) {
    console.error("getTodaySummary error:", err);
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
};

exports.getWeeklySummary = async (req, res) => {
  try {
    console.log("📅 Route /weekly-summary appelée");

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);

    const result = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(lastWeek);
      day.setDate(lastWeek.getDate() + i);

      const startOfDay = new Date(day.setHours(0, 0, 0, 0));
      const endOfDay = new Date(day.setHours(23, 59, 59, 999));

      // ✅ corriger ici → utiliser startTime
      const stays = await Stay.find({
        startTime: { $gte: startOfDay, $lte: endOfDay }
      });

      const expenses = await Expense.find({
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      const totalIncome = stays.reduce((sum, s) => sum + (s.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      result.push({
        day: startOfDay.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        in: totalIncome,
        out: totalExpenses,
      });
    }

    console.log("✅ Résumé hebdo généré :", result);
    res.json(result);
  } catch (err) {
    console.error("❌ Erreur getWeeklySummary :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// ================== EXPORTS ==================
// === PDF QUOTIDIEN ===
exports.exportDailyPDF = async (req, res) => {
  try {
    const { date } = req.query;
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const stays = await Stay.find({ startTime: { $gte: dayStart, $lte: dayEnd } });
    const expenses = await Expense.find({ date: { $gte: dayStart, $lte: dayEnd } });

    const totalIncome = stays.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalStays = stays.length;
    const nightStays = stays.filter(s => s.phase === "night").length;

    const pdfBuffer = generateDailyPDF({
      income: totalIncome,
      expenses: totalExpenses,
      remaining: totalIncome - totalExpenses,
      totalStays,
      nightStays
    }, date);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="releve-${date}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("exportDailyPDF error:", err);
    res.status(500).send('Erreur export PDF quotidien');
  }
};

// === PDF HEBDOMADAIRE ===
exports.exportWeeklyPDF = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6); // les 7 derniers jours

    const result = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(lastWeek);
      day.setDate(lastWeek.getDate() + i);

      const start = new Date(day.setHours(0, 0, 0, 0));
      const end = new Date(day.setHours(23, 59, 59, 999));

      const stays = await Stay.find({ startTime: { $gte: start, $lte: end } });
      const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

      const totalIncome = stays.reduce((sum, s) => sum + (s.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      result.push({
        date: start.toLocaleDateString('fr-FR'),
        income: totalIncome,
        expenses: totalExpenses,
        remaining: totalIncome - totalExpenses,
      });
    }

    const pdfBuffer = generateWeeklyPDF(result);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="releve-semaine.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("exportWeeklyPDF error:", err);
    res.status(500).send('Erreur export PDF hebdomadaire');
  }
};


// === PDF MENSUEL ===
exports.exportMonthlyPDF = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59);

    const stays = await Stay.find({ startTime: { $gte: start, $lte: end } });
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

    const daysInMonth = new Date(year, month, 0).getDate();
    const data = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = new Date(year, month - 1, d, 0, 0, 0);
      const dayEnd = new Date(year, month - 1, d, 23, 59, 59);

      const dayStays = stays.filter(s => s.startTime >= dayStart && s.startTime <= dayEnd);
      const dayExpenses = expenses.filter(e => e.date >= dayStart && e.date <= dayEnd);

      data.push({
        date: d + '/' + month,
        income: dayStays.reduce((sum, s) => sum + (s.amount || 0), 0),
        expenses: dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        remaining: dayStays.reduce((sum, s) => sum + (s.amount || 0), 0) - dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      });
    }

    const pdfBuffer = generateMonthlyPDF(data, month, year);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="releve-mois-${month}-${year}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("exportMonthlyPDF error:", err);
    res.status(500).send('Erreur export PDF mensuel');
  }
};

// === PDF ANNUEL ===
exports.exportAnnualPDF = async (req, res) => {
  try {
    const { year } = req.query;
    const result = [];

    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1, 0, 0, 0);
      const end = new Date(year, m + 1, 0, 23, 59, 59);

      const stays = await Stay.find({ startTime: { $gte: start, $lte: end } });
      const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

      result.push({
        label: start.toLocaleString('fr-FR', { month: 'long' }),
        income: stays.reduce((sum, s) => sum + (s.amount || 0), 0),
        expenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        remaining: stays.reduce((sum, s) => sum + (s.amount || 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      });
    }

    const pdfBuffer = generateAnnualPDF(result, year);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="releve-${year}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("exportAnnualPDF error:", err);
    res.status(500).send('Erreur export PDF annuel');
  }
};







// ================== EXPORT EXCEL ==================

exports.exportExcel = async (req, res) => {
  try {
    const { date } = req.query;
    const data = [
      { date: date || '2025-09-04', income: 2000, expenses: 500 },
      { date: date || '2025-09-03', income: 1500, expenses: 300 },
    ];

    const buffer = await generateExcel(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=releve-${date || 'report'}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur export Excel');
  }
};




// ================== GENERATE RECEIPT ==================
exports.generateReceipt = async (req, res) => {
  try {
    const { stayId } = req.params;
    const stay = await Stay.findById(stayId).populate('roomId');

    if (!stay) {
      return res.status(404).json({ msg: "Séjour introuvable" });
    }

    const pdf = generatePDF({
      stay: {
        room: stay.roomId?.number || "N/A",
        amount: stay.amount || 0,
        start: stay.startTime,
        end: stay.endTime || "En cours"
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("generateReceipt error:", err);
    res.status(500).json({ msg: "Erreur génération reçu", error: err.message });
  }
};
