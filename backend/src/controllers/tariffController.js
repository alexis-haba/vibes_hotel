const Tariff = require('../models/Tariff');

exports.getTariff = async (req, res) => {
  try {
    const tariff = await Tariff.findOne();
    console.log('Tariff returned:', tariff); // Débogage
    res.json(tariff || { hourRate: 50, nightRate: 100 }); // Valeurs par défaut si aucune donnée
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateTariff = async (req, res) => {
  try {
    const { hourRate, nightRate } = req.body;
    const tariff = await Tariff.findOneAndUpdate({}, { hourRate, nightRate }, { new: true, upsert: true });
    res.json(tariff);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};