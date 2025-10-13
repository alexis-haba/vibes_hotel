// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import StayList from './StayList';
import ExpenseList from './ExpenseList';
import Filters from './Filters';
import jsPDF from 'jspdf';
import { 
  FaSun, FaMoon, FaBalanceScale, FaFilePdf, FaFileExcel, 
  FaPrint, FaChartBar, FaCalendarAlt 
} from 'react-icons/fa';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Dashboard = () => {
  // ================== STATES ==================
  const [dailySummary, setDailySummary] = useState({});
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [annualSummary, setAnnualSummary] = useState({});
  
  const [weekData, setWeekData] = useState({ labels: [], datasets: [] });
  const [monthData, setMonthData] = useState({ labels: [], datasets: [] });
  const [annualData, setAnnualData] = useState({ labels: [], datasets: [] });

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    roomId: '',
    type: '',
    phase: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ================== HELPERS ==================
  const currentDate = new Date();
  const getDateBadge = () => {
    const selectedDate = new Date(filters.date);
    if (selectedDate.toDateString() === currentDate.toDateString()) {
      return <span className="badge bg-success">Aujourd'hui: {selectedDate.toLocaleDateString('fr-FR')}</span>;
    } else if (selectedDate < currentDate) {
      return <span className="badge bg-warning">Date passée: {selectedDate.toLocaleDateString('fr-FR')}</span>;
    } else {
      return <span className="badge bg-danger">Date future: {selectedDate.toLocaleDateString('fr-FR')}</span>;
    }
  };

  const setToday = () => setFilters({ ...filters, date: new Date().toISOString().split('T')[0] });
  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setFilters({ ...filters, date: yesterday.toISOString().split('T')[0] });
  };
  const setLastWeek = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    setFilters({ ...filters, date: lastWeek.toISOString().split('T')[0] });
  };

  // ================== API CALLS ==================
  const fetchDailySummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports/summary', { params: { date: filters.date } });
      setDailySummary(res.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de récupérer le résumé journalier.");
    } finally {
      setLoading(false);
    }
  }, [filters.date]);

  const fetchWeeklySummary = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/reports/weeklysummary');
      setWeeklySummary(res.data);

      setWeekData({
        labels: res.data.map(item => item.day),
        datasets: [
          { label: 'Entrées', data: res.data.map(i => i.in), backgroundColor: 'rgba(75,192,192,0.5)' },
          { label: 'Dépenses', data: res.data.map(i => i.out), backgroundColor: 'rgba(255,99,132,0.5)' },
        ],
      });
    } catch (err) {
      console.error(err);
      setError("Impossible de récupérer les données hebdomadaires.");
    }
  }, []);

  const fetchMonthlySummary = useCallback(async () => {
    try {
      const today = new Date(filters.date);

      const res = await api.get('/reports/monthly', { 
        params: { month: today.getMonth() + 1, year: today.getFullYear() } 
      });
      setMonthlySummary(res.data);

      const graphRes = await api.get('/reports/graph/monthly', { 
        params: { year: today.getFullYear() } 
      });

      const monthNames = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];

      // Prépare des tableaux remplis de 0
      const revenus = Array(12).fill(0);
      const depenses = Array(12).fill(0);

      // Injecte les données reçues dans le bon mois
      graphRes.data.forEach(i => {
        const idx = i.month - 1; // 0-based
        revenus[idx] = i.income || 0;
        depenses[idx] = i.expenses || 0;
      });

      // Mets à jour le graphe avec les 12 mois
      setMonthData({
        labels: monthNames,
        datasets: [
          { label: 'Revenus', data: revenus, backgroundColor: 'rgba(54,162,235,0.5)' },
          { label: 'Dépenses', data: depenses, backgroundColor: 'rgba(255,99,132,0.5)' },
        ],
      });
    } catch (err) {
      console.error("Erreur fetchMonthlySummary:", err);
    }
  }, [filters.date]);

  const fetchAnnualSummary = useCallback(async () => {
    try {
      const today = new Date(filters.date);

      const res = await api.get('/reports/annual', { params: { year: today.getFullYear() } });
      setAnnualSummary(res.data);

      const graphRes = await api.get('/reports/graph/annual');

      setAnnualData({
        labels: graphRes.data.map(i => i.year.toString()),
        datasets: [
          { label: 'Revenus', data: graphRes.data.map(i => i.income), backgroundColor: 'rgba(153,102,255,0.5)' },
          { label: 'Dépenses', data: graphRes.data.map(i => i.expenses), backgroundColor: 'rgba(255,159,64,0.5)' },
        ],
      });
    } catch (err) {
      console.error("Erreur fetchAnnualSummary:", err);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchDailySummary();
    fetchWeeklySummary();
    fetchMonthlySummary();
    fetchAnnualSummary();
  }, [fetchDailySummary, fetchWeeklySummary, fetchMonthlySummary, fetchAnnualSummary]);

  // ================== PDF ==================
  const printDailyReport = () => {
    const doc = new jsPDF();
    doc.text('Relevé Journalier', 10, 10);
    doc.text(`Date: ${filters.date}`, 10, 20);
    doc.text(`Séjours Heure: ${dailySummary.hourIncome || 0}`, 10, 30);
    doc.text(`Séjours Nuit: ${dailySummary.nightIncome || 0}`, 10, 40);
    doc.text(`Entrées Caisse: ${dailySummary.entriesIncome || 0}`, 10, 50);
    doc.text(`Total: ${dailySummary.totalIncome || 0}`, 10, 60);
    doc.text(`Dépenses: ${dailySummary.totalExpenses || 0}`, 10, 70);
    doc.text(`Solde: ${dailySummary.remaining || 0}`, 10, 80);
    doc.save(`releve-journalier-${filters.date}.pdf`);
  };

  // ================== EXPORTS ==================
  const exportDailyPDF = async () => {
    try {
      const response = await api.get(`/reports/export/daily?date=${filters.date}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `releve-journalier-${filters.date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur export PDF quotidien :", err);
      alert("Impossible de télécharger le PDF quotidien.");
    }
  };

  const exportWeeklyPDF = async () => {
    try {
      const response = await api.get(`/reports/export/weekly`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `releve-hebdomadaire.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur export PDF hebdo :", err);
      alert("Impossible de télécharger le PDF hebdomadaire.");
    }
  };

  const exportMonthlyPDF = async () => {
    try {
      const today = new Date(filters.date);
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const response = await api.get(`/reports/export/monthly?month=${month}&year=${year}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `releve-mensuel-${month}-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur export PDF mensuel :", err);
      alert("Impossible de télécharger le PDF mensuel.");
    }
  };

  const exportAnnualPDF = async () => {
    try {
      const year = new Date(filters.date).getFullYear();
      const response = await api.get(`/reports/export/annual?year=${year}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `releve-annuel-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur export PDF annuel :", err);
      alert("Impossible de télécharger le PDF annuel.");
    }
  };

  const exportExcel = async () => {
    try {
      const response = await api.get(`/reports/export/excel?date=${filters.date}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `releve-journalier-${filters.date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur export Excel :", err);
      alert("Impossible de télécharger le fichier Excel.");
    }
  };

  // ================== CHART OPTIONS ==================
  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true } },
    scales: { y: { beginAtZero: true } },
  };

  // ================== RENDER ==================
  return (
    <div className="p-4" style={{ backgroundColor: '#f9fafc', minHeight: '100vh' }}>
      <h1 className="h2 mb-4">Tableau de bord Admin</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Filters filters={filters} setFilters={setFilters}/>
        <div className="btn-group">
          <button onClick={setToday} className="btn btn-outline-primary"><FaCalendarAlt /> Aujourd'hui</button>
          <button onClick={setYesterday} className="btn btn-outline-warning"><FaCalendarAlt /> Hier</button>
          <button onClick={setLastWeek} className="btn btn-outline-info"><FaCalendarAlt /> Semaine passée</button>
        </div>
      </div>

      <div className="mb-3">{getDateBadge()}</div>
      {loading && <div className="alert alert-info">Chargement en cours...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Résumé Journalier */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg-2"><div className="p-3 text-white rounded shadow-sm bg-primary"><FaSun /> Heure: {dailySummary.hourIncome}</div></div>
        <div className="col-md-4 col-lg-2"><div className="p-3 text-white rounded shadow-sm bg-info"><FaMoon /> Nuitée: {dailySummary.nightIncome}</div></div>
        <div className="col-md-4 col-lg-2"><div className="p-3 text-white rounded shadow-sm bg-secondary">☀️ Journée: {dailySummary.entriesIncome}</div></div>
        <div className="col-md-4 col-lg-2"><div className="p-3 text-white rounded shadow-sm bg-primary">💰 Total: {dailySummary.totalIncome}</div></div>
        <div className="col-md-4 col-lg-2"><div className="p-3 text-white rounded shadow-sm bg-danger">💸 Dépenses: {dailySummary.totalExpenses}</div></div>
        <div className="col-md-4 col-lg-2"><div className="p-3 text-white rounded shadow-sm bg-success"><FaBalanceScale /> Solde: {dailySummary.remaining}</div></div>
      </div>

      <StayList filters={filters} setFilters={setFilters} />
      <ExpenseList filters={filters} />

      {/* Actions */}
      <div className="d-flex gap-3 mt-4 flex-wrap">
        {/* <button onClick={printDailyReport} className="btn btn-outline-dark"><FaPrint /> Imprimer</button> */}
        <button onClick={exportDailyPDF} className="btn btn-outline-primary"><FaFilePdf /> PDF Journalier</button>
        <button onClick={exportWeeklyPDF} className="btn btn-outline-info"><FaFilePdf /> PDF Hebdomadaire</button>
        <button onClick={exportMonthlyPDF} className="btn btn-outline-warning"><FaFilePdf /> PDF Mensuel</button>
        <button onClick={exportAnnualPDF} className="btn btn-outline-success"><FaFilePdf /> PDF Annuel</button>
        {/* <button onClick={exportExcel} className="btn btn-outline-success"><FaFileExcel /> Exporter Excel</button> */}
      </div>

      {/* Graphiques */}
      <div className="mt-5 p-4 bg-white rounded shadow-sm border">
        <h4><FaChartBar /> Graphique Hebdomadaire</h4>
        <Bar data={weekData} options={{ ...chartOptions, title: { text: "Entrées / Dépenses de la Semaine" } }} />
        {weeklySummary.length > 0 && (
          <p>
            Résumé Hebdomadaire: Revenus {weeklySummary.reduce((sum, i) => sum + (i.in || 0), 0)} 
            - Dépenses {weeklySummary.reduce((sum, i) => sum + (i.out || 0), 0)} 
            - Solde {weeklySummary.reduce((sum, i) => sum + (i.in || 0) - (i.out || 0), 0)}
          </p>
        )}
      </div>

      <div className="mt-5 p-4 bg-white rounded shadow-sm border">
        <h4><FaChartBar /> Graphique Mensuel</h4>
        <Bar data={monthData} options={{ ...chartOptions, title: { text: "Revenus / Dépenses Mensuels" } }} />
        <p>Résumé Mensuel: Revenus {monthlySummary.income} - Dépenses {monthlySummary.expenses} - Solde {monthlySummary.remaining}</p>
      </div>

      <div className="mt-5 p-4 bg-white rounded shadow-sm border">
        <h4><FaChartBar /> Graphique Annuel</h4>
        <Bar data={annualData} options={{ ...chartOptions, title: { text: "Revenus / Dépenses Annuels" } }} />
        <p>Résumé Annuel: Revenus {annualSummary.income} - Dépenses {annualSummary.expenses} - Solde {annualSummary.remaining}</p>
      </div>
    </div>
  );
};

export default Dashboard;
