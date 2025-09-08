import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [tariff, setTariff] = useState({ hourRate: 10, nightRate: 50, tva: 0 });
  const [options, setOptions] = useState({ tvaEnabled: false });

  useEffect(() => {
    fetchTariff();
  }, []);

  const fetchTariff = async () => {
    try {
      const res = await api.get('/tariffs');
      if (res.data) {
        setTariff(res.data); // Utilise les données de l'API si présentes
      } else {
        console.warn('Aucun tarif trouvé, utilisation des valeurs par défaut.');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des tarifs:', err);
      // Garde les valeurs par défaut en cas d'erreur
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/tariffs', tariff);
      alert('Paramètres mis à jour');
    } catch (err) {
      console.error('Erreur lors de la mise à jour des tarifs:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const toggleOption = (key) => {
    setOptions({ ...options, [key]: !options[key] });
  };

  return (
    <div className="p-4">
      <h2 className="h4 mb-4">Paramètres Généraux</h2>
      <form onSubmit={handleSubmit}>
        <label>Tarif horaire :</label>
        <input
          type="number"
          value={tariff.hourRate || 0} // Utilise 0 si null/undefined
          onChange={(e) => setTariff({ ...tariff, hourRate: e.target.value })}
          className="form-control mb-3"
        />
        <label>Tarif nuitée :</label>
        <input
          type="number"
          value={tariff.nightRate || 0} // Utilise 0 si null/undefined
          onChange={(e) => setTariff({ ...tariff, nightRate: e.target.value })}
          className="form-control mb-3"
        />
        <label>TVA (%) :</label>
        <input
          type="number"
          value={tariff.tva || 0} // Utilise 0 si null/undefined
          onChange={(e) => setTariff({ ...tariff, tva: e.target.value })}
          className="form-control mb-3"
        />
        <div className="form-check mb-3">
          <input
            type="checkbox"
            checked={options.tvaEnabled}
            onChange={() => toggleOption('tvaEnabled')}
            className="form-check-input"
          />
          <label className="form-check-label">Activer TVA</label>
        </div>
        <button type="submit" className="btn btn-primary">
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default Settings;