import React, { useState } from 'react';
import api from '../services/api';

const DayEntry = ({ onSaved }) => { // onSaved = callback pour refresh liste stays
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([{ description: '', amount: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return alert('Entrez le montant total');

    try {
      const payload = {
        phase: 'day',
        totalIncome: Number(amount),
        expenses: expenses
          .filter(e => e.description.trim() && e.amount)
          .map(e => ({ description: e.description.trim(), amount: Number(e.amount) })),
      };

      await api.post('/entries', payload);
      alert('Saisie jour enregistrée');

      setAmount('');
      setExpenses([{ description: '', amount: '' }]);

      if (onSaved) onSaved(); // notifier le parent pour refresh liste stays
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const addExpense = () => setExpenses([...expenses, { description: '', amount: '' }]);

  const updateExpense = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };

  return (
    <div className="p-4">
      <h2 className="h4 mb-4">Saisie Jour (08h-18h)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Montant total encaissé"
          className="form-control mb-3"
          required
        />
        <h3>Dépenses</h3>
        {expenses.map((exp, index) => (
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

export default DayEntry;
