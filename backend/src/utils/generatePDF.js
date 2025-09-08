const { jsPDF } = require("jspdf");

// === Helper formatage FG ===
function formatFG(value) {
  if (typeof value !== "number") value = Number(value) || 0;
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FG";
}

// === PDF pour les reçus individuels ===
function generatePDF(data) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`Reçu Séjour`, 10, 10);

  doc.setFontSize(10);
  doc.text(`Chambre: ${data.stay.room}`, 10, 20);
  doc.text(`Montant: ${formatFG(data.stay.amount)}`, 10, 30);
  doc.text(`Début: ${data.stay.start}`, 10, 40);
  doc.text(`Fin: ${data.stay.end}`, 10, 50);

  return Buffer.from(doc.output("arraybuffer"));
}

// === PDF QUOTIDIEN ===
function generateDailyPDF(data, date) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`Relevé journalier: ${date}`, 10, 10);

  doc.setFontSize(10);
  doc.text(`Total Revenus: ${formatFG(data.income)}`, 10, 20);
  doc.text(`Dépenses: ${formatFG(data.expenses)}`, 10, 30);
  doc.text(`Solde: ${formatFG(data.remaining)}`, 10, 40);
  doc.text(`Séjours Totaux: ${formatFG(data.totalStays)}`, 10, 50);
  doc.text(`Nuits: ${formatFG(data.nightStays)}`, 10, 60);

  return Buffer.from(doc.output("arraybuffer"));
}

// === PDF HEBDOMADAIRE ===
function generateWeeklyPDF(weeklyData) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`Relevé Hebdomadaire`, 10, 10);

  doc.setFontSize(10);
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalRemaining = 0;

  weeklyData.forEach((day, i) => {
    doc.text(
      `${day.date} - Revenus: ${formatFG(day.income)} - Dépenses: ${formatFG(
        day.expenses
      )} - Solde: ${formatFG(day.remaining)}`,
      10,
      20 + i * 6
    );
    totalIncome += day.income;
    totalExpenses += day.expenses;
    totalRemaining += day.remaining;
  });

  doc.setFontSize(11);
  doc.text(
    `TOTAL - Revenus: ${formatFG(totalIncome)} - Dépenses: ${formatFG(
      totalExpenses
    )} - Solde: ${formatFG(totalRemaining)}`,
    10,
    30 + weeklyData.length * 6
  );

  return Buffer.from(doc.output("arraybuffer"));
}

// === PDF MENSUEL ===
function generateMonthlyPDF(monthlyData, month, year) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  let y = 10;
  doc.setFontSize(12);
  doc.text(`Relevé Mensuel: ${month}/${year}`, 10, y);
  y += 8;

  doc.setFontSize(10);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalRemaining = 0;

  monthlyData.forEach((day) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 10;
    }

    // Colonne gauche → date
    doc.text(`${day.date}`, 10, y);

    // Revenus
    doc.text(`Revenus: ${formatFG(day.income)}`, 30, y);

    // Dépenses
    doc.text(`Dépenses: ${formatFG(day.expenses)}`, 90, y);

    // Solde à droite
    const soldeText = `Solde: ${formatFG(day.remaining)}`;
    doc.text(soldeText, pageWidth - 10, y, { align: "right" });

    y += 6;

    totalIncome += day.income;
    totalExpenses += day.expenses;
    totalRemaining += day.remaining;
  });

  if (y > pageHeight - 20) {
    doc.addPage();
    y = 10;
  }

  doc.setFontSize(11);
  doc.text(
    `TOTAL - Revenus: ${formatFG(totalIncome)} - Dépenses: ${formatFG(
      totalExpenses
    )} - Solde: ${formatFG(totalRemaining)}`,
    10,
    y + 5
  );

  return Buffer.from(doc.output("arraybuffer"));
}

// === PDF ANNUEL ===
function generateAnnualPDF(annualData, year) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`Relevé Annuel: ${year}`, 10, 10);

  doc.setFontSize(10);
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalRemaining = 0;

  annualData.forEach((month, i) => {
    doc.text(
      `${month.label} - Revenus: ${formatFG(month.income)} - Dépenses: ${formatFG(
        month.expenses
      )} - Solde: ${formatFG(month.remaining)}`,
      10,
      20 + i * 6
    );
    totalIncome += month.income;
    totalExpenses += month.expenses;
    totalRemaining += month.remaining;
  });

  doc.setFontSize(11);
  doc.text(
    `TOTAL - Revenus: ${formatFG(totalIncome)} - Dépenses: ${formatFG(
      totalExpenses
    )} - Solde: ${formatFG(totalRemaining)}`,
    10,
    30 + annualData.length * 6
  );

  return Buffer.from(doc.output("arraybuffer"));
}

module.exports = {
  formatFG,
  generatePDF,
  generateDailyPDF,
  generateWeeklyPDF,
  generateMonthlyPDF,
  generateAnnualPDF,
};
