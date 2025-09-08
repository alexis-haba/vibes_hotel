exports.exportExcel = async (req, res) => {
  try {
    const { date } = req.query;
    const data = [
      { date: date || '2025-09-04', income: 2000, expenses: 500 },
      { date: date || '2025-09-03', income: 1500, expenses: 300 },
    ];

    const buffer = await generateExcel(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=releve-${date || 'report'}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur export Excel');
  }
};
