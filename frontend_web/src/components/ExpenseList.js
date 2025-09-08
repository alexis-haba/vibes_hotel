import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ExpenseList = ({ filters }) => {
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await api.get('/expenses', { params: { date: filters.date } });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div>
      <h2 className="h4 mb-2">Liste des Dépenses</h2>
      {expenses.length === 0 ? (
        <p className="text-center text-muted">Aucune donnée pour cette période.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Description</th>
              <th>Montant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{expense.description}</td>
                <td>{expense.amount.toLocaleString('fr-FR')} FG</td> {/* Formatage des montants */}
                <td>{new Date(expense.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseList;