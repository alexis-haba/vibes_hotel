const DailyEntry = require('../models/DailyEntry');

// 📌 Créer une nouvelle entrée
exports.createEntry = async (req, res) => {
  try {
    const { phase, stays = [], expenses = [], notes, totalIncome } = req.body;

    // ✅ Vérifier la phase (obligatoire)
    if (!phase || !["day", "night"].includes(phase)) {
      return res.status(400).json({ message: "Le champ 'phase' est requis et doit être 'day' ou 'night'." });
    }

    // ✅ Calcul automatique des totaux
    let calculatedIncome;
    if (phase === "day") {
      calculatedIncome = Number(totalIncome) || 0;
    } else {
      // On suppose que stays = tableau d’IDs de séjours (réels)
      const linkedStays = await Stay.find({ _id: { $in: stays } });
      calculatedIncome = linkedStays.reduce((sum, s) => sum + (s.amount || 0), 0);
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const entry = await DailyEntry.create({
      phase,
      stays: phase === "night" ? stays : [], // on stocke les IDs des séjours
      expenses,
      notes,
      totalIncome: calculatedIncome,
      totalExpenses,
      createdBy: req.user?.id || null,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la création",
      error: err.message,
    });
  }
};
// 📌 Récupérer toutes les entrées (journée + nuit)
// 📌 Récupérer toutes les entrées (journée + nuit)
exports.getEntries = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    const entries = await DailyEntry.find(filter)
      .populate('stays.room')
      .populate('createdBy', 'username role')
      .sort({ createdAt: -1 });

    // Calculer le solde global pour cette journée
    const totalIncome = entries.reduce((sum, e) => sum + (e.totalIncome || 0), 0);
    const totalExpenses = entries.reduce((sum, e) => sum + (e.totalExpenses || 0), 0);
    const balance = totalIncome - totalExpenses;

    res.json({ entries, balance });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: err.message });
  }
};


// 📌 Récupérer une entrée par ID
exports.getEntryById = async (req, res) => {
  try {
    const entry = await DailyEntry.findById(req.params.id)
      .populate('stays.room')
      .populate('createdBy', 'username role');

    if (!entry) {
      return res.status(404).json({ message: 'Entrée non trouvée' });
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: err.message });
  }
};

// 📌 Supprimer une entrée
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await DailyEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entrée non trouvée' });
    }
    res.json({ message: 'Entrée supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err.message });
  }
};
