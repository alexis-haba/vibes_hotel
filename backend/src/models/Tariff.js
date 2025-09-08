const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema({
  hourRate: { type: Number, default: 50 }, // Ajuste à 50 € par heure
  nightRate: { type: Number, default: 100 }, // Ajuste si nécessaire
  tva: { type: Number, default: 0 },
});

module.exports = mongoose.model('Tariff', tariffSchema);