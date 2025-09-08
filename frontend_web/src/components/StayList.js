import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Modal, Button } from 'react-bootstrap';

const StayList = ({ filters, setFilters }) => {
  const [stays, setStays] = useState([]);
  const [selectedStay, setSelectedStay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchStays = useCallback(async () => {
    try {
      // Si aucune date choisie, on prend la date du jour
      const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
      const selectedDate = filters.date || today;

      const params = {
        phase: filters.phase || undefined,
        date: selectedDate,
        roomId: filters.roomId || undefined,
      };

      const stayRes = await api.get('/stays', { params });
      const staysData = stayRes.data || [];
      const entryRes = await api.get('/entries', { params: { date: selectedDate } });
      const entriesData = entryRes.data.entries || [];

      const formattedStays = staysData.map(s => ({
        _id: s._id,
        phase: s.phase,
        amount: s.amount,
        expenses: s.expenses || [],
        balance: (s.amount || 0) - (s.expenses?.reduce((x, e) => x + (e.amount || 0), 0)),
        startTime: s.startTime,
        endTime: s.endTime,
        roomId: s.roomId,
        paymentMethod: s.paymentMethod || "—",
        createdBy: s.createdBy?.username || "Inconnu", // ⚡ ajout
      }));

      const formattedEntries = entriesData.map(e => ({
        _id: e._id,
        phase: "entry",
        amount: e.totalIncome,
        expenses: e.expenses || [],
        balance: (e.totalIncome || 0) - (e.totalExpenses || 0),
        startTime: e.date,
        endTime: e.date,
        roomId: null,
        paymentMethod: "Caisse",
      }));

      const allStays = [...formattedStays, ...formattedEntries].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime)
      );

      setStays(allStays);
    } catch (err) {
      console.error('Erreur /entries:', err.response?.data || err.message);
      setStays([]);
    }
  }, [filters]);


  useEffect(() => {
    fetchStays();
  }, [fetchStays]);

  const handleShowModal = (stay) => {
    setSelectedStay(stay);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStay(null);
  };

  return (
    <div className="mb-4">
      <h2 className="h4 mb-2">Liste des Séjours & Journées</h2>

      <div className="d-flex gap-2 mb-3">
        <select
          value={filters.phase || ''}
          onChange={(e) => setFilters({ ...filters, phase: e.target.value || undefined })}
          className="form-select"
          style={{ maxWidth: 160 }}
        >
          <option value="">Tous</option>
          <option value="day">Journée</option>
          <option value="hour">Heure</option>
          <option value="night">Nuitée</option>
        </select>

        <input
          type="date"
          className="form-control"
          value={filters.date || ''}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          style={{ maxWidth: 180 }}
        />

        <input
          type="text"
          className="form-control"
          placeholder="Filtrer par ID chambre"
          value={filters.roomId || ''}
          onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
          style={{ maxWidth: 220 }}
        />
      </div>

      {stays.length === 0 ? (
        <p className="text-center text-muted">Aucune donnée pour cette période.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chambre</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Solde</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Paiement</th>
            </tr>
          </thead>
          <tbody>
            {stays.map((stay) => (
              <tr key={stay._id} onClick={() => handleShowModal(stay)} style={{ cursor: 'pointer' }}>
                <td>{stay.roomId?.number || (stay.phase === 'day' ? '—' : 'N/A')}</td>
                <td>{stay.phase === 'night' ? 'Nuitée' : stay.phase === 'hour' ? 'Heure' : 'Entrée Caisse (La Journée)'}</td>
                <td>{Number(stay.amount || 0).toLocaleString('fr-FR')} FG</td>
                <td>{Number(stay.balance || 0).toLocaleString('fr-FR')} FG</td>
                <td>{new Date(stay.startTime).toLocaleString()}</td>
                <td>{stay.endTime ? new Date(stay.endTime).toLocaleString() : 'En cours'}</td>
                <td>{stay.paymentMethod || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Détails du Séjour / Journée</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStay && (
            <div>
              <p><strong>Chambre:</strong> {selectedStay.roomId?.number || (selectedStay.phase === 'day' ? '—' : 'N/A')}</p>
              <p><strong>Type:</strong> {selectedStay.phase === 'night' ? 'Nuitée' : 'Journée'}</p>
              <p><strong>Montant:</strong> {Number(selectedStay.amount || 0).toLocaleString('fr-FR')} FG</p>
              <p><strong>Solde:</strong> {Number(selectedStay.balance || 0).toLocaleString('fr-FR')} FG</p>
              <p><strong>Début:</strong> {new Date(selectedStay.startTime).toLocaleString()}</p>
              <p><strong>Fin:</strong> {selectedStay.endTime ? new Date(selectedStay.endTime).toLocaleString() : 'En cours'}</p>
              <p><strong>Paiement:</strong> {selectedStay.paymentMethod || '—'}</p>
              <p><strong>Enregistré par:</strong> {selectedStay.createdBy}</p>
              {selectedStay.expenses?.length > 0 && (
                <div>
                  <h5>Dépenses associées:</h5>
                  <ul>
                    {selectedStay.expenses.map((exp, i) => (
                      <li key={i}>{exp.description}: {Number(exp.amount || 0).toLocaleString('fr-FR')} FG</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Fermer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StayList;
