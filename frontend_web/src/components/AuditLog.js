import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="h4 mb-4">Historique des Actions</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Action</th>
            <th>Utilisateur</th>
            <th>Détails</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.action}</td>
              <td>{log.userId.username}</td>
              <td>{JSON.stringify(log.details)}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;