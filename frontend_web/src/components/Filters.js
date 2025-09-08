import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Filters = ({ filters, setFilters }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Date par défaut = aujourd'hui (format YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mb-4">
      <label className="me-2">Date:</label>
      <input
        type="date"
        value={filters.date || today}
        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        className="form-control d-inline-block w-auto me-2"
      />

      <label className="me-2">Chambre:</label>
      <input
        value={filters.roomId}
        onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
        placeholder="ID chambre"
        className="form-control d-inline-block w-auto me-2"
        list="roomList"
      />
      <datalist id="roomList">
        {rooms.map((room) => (
          <option key={room._id} value={room._id}>
            Chambre {room.number}
          </option>
        ))}
      </datalist>
    </div>
  );
};

export default Filters;
