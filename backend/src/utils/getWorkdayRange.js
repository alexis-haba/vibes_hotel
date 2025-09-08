// backend/src/utils/getWorkdayRange.js
function getWorkdayRange(refDate = new Date()) {
  const start = new Date(refDate);

  // Début du jour de travail → 8h du matin
  start.setHours(8, 0, 0, 0);

  let end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(7, 59, 59, 999);

  // Si on est avant 8h → alors le "jour de travail" est celui de la veille
  const now = new Date();
  if (now.getHours() < 8) {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  }

  return { start, end };
}

module.exports = getWorkdayRange;
