import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NightEntry = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomId: '',
    startTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    endTime: '',
    isNight: false,
    paymentMethod: 'cash',
    expenses: [{ description: '', amount: '' }],
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.filter((room) => room.available));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = new Date();
    start.setHours(...form.startTime.split(':').map(Number));
    const end = new Date();
    end.setHours(...form.endTime.split(':').map(Number));
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const tariff = await api.get('/tariffs');
    const amount = form.isNight ? tariff.data.nightRate : hours * tariff.data.hourRate;

    try {
      await api.post('/stays/night', { ...form, startTime: start, endTime: end, amount });
      alert('Saisie nuit enregistrée');
      setForm({
        roomId: '',
        startTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        endTime: '',
        isNight: false,
        paymentMethod: 'cash',
        expenses: [{ description: '', amount: '' }],
      });
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const addExpense = () => {
    setForm({ ...form, expenses: [...form.expenses, { description: '', amount: '' }] });
  };

  const updateExpense = (index, field, value) => {
    const newExpenses = [...form.expenses];
    newExpenses[index][field] = value;
    setForm({ ...form, expenses: newExpenses });
  };

  return (
    <div className="p-4">
      <h2 className="h4 mb-4">Saisie Nuit (18h-08h)</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={form.roomId}
          onChange={(e) => setForm({ ...form, roomId: e.target.value })}
          className="form-select mb-3"
          required
        >
          <option value="">Choisir une chambre</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>{room.number}</option>
          ))}
        </select>
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="form-control mb-3"
          required
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          className="form-control mb-3"
          required
        />
        <div className="form-check mb-3">
          <input
            type="checkbox"
            checked={form.isNight}
            onChange={(e) => setForm({ ...form, isNight: e.target.checked })}
            className="form-check-input"
          />
          <label className="form-check-label">Nuitée</label>
        </div>
        <select
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          className="form-select mb-3"
        >
          <option value="cash">Espèces</option>
          <option value="card">Carte</option>
          <option value="other">Autre</option>
        </select>
        <h3>Dépenses (optionnelles)</h3>
        {form.expenses.map((exp, index) => (
          <div key={index} className="row mb-2">
            <input
              type="text"
              value={exp.description}
              onChange={(e) => updateExpense(index, 'description', e.target.value)}
              placeholder="Motif"
              className="form-control col-md-6 me-2"
            />
            <input
              type="number"
              value={exp.amount}
              onChange={(e) => updateExpense(index, 'amount', e.target.value)}
              placeholder="Montant"
              className="form-control col-md-4"
            />
          </div>
        ))}
        <button type="button" onClick={addExpense} className="btn btn-secondary mb-3">
          Ajouter une dépense
        </button>
        <button type="submit" className="btn btn-primary">
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default NightEntry;