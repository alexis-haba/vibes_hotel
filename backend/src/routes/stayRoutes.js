// backend/src/routes/stayRoutes.js
const express = require('express');
const router = express.Router();

// 🔹 Import des controllers avec chemin correct
const stayController = require('../controllers/stayController'); 
const { protect } = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const Stay = require('../models/Stay');

// Vérifie que les fonctions existent
if (!stayController.addStay || !stayController.getStays || !stayController.endStay) {
  throw new Error("Controllers stayController incomplets ou mal importés");
}

// ================== GET LISTE DES SÉJOURS ==================
router.get('/', protect, role(['employee', 'admin']), stayController.getStays);

// ================== GET HISTORIQUE UTILISATEUR ==================
// ================== GET HISTORIQUE GLOBAL ==================
router.get('/history', protect, async (req, res) => {
  try {
    const stays = await Stay.find()
      .populate('roomId', 'number')
      .populate('createdBy', 'username role')
      .sort({ createdAt: -1 }); // plus récents en premier

    const formatted = stays.map((s) => ({
      _id: s._id,
      roomId: s.roomId?.number || "Inconnue",
      checkIn: s.startTime,
      checkOut: s.endTime,
      amount: s.amount,
      paymentMethod: s.paymentMethod,
      expenses: s.expenses || 0, // ✅ corrigé (pas de reduce)
      stayType: s.phase,
      createdAt: s.createdAt,
      createdBy: s.createdBy?.username || "Système"
    }));

    res.json(formatted);
  } catch (err) {
    console.error('GET /stays/history error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ================== CRÉATION D’UN SÉJOUR ==================
router.post('/', protect, role(['employee', 'admin']), stayController.addStay);

// ================== FIN D’UN SÉJOUR ==================
router.put('/:id/end', protect, role(['employee', 'admin']), stayController.endStay);

module.exports = router;
