// Fonction pour formater la date en DD/MM/YYYY
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Ajout de zéros pour le format DD/MM/YYYY
  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = String(month).padStart(2, "0");

  return `${formattedDay}/${formattedMonth}/${year}`;
}

module.exports = formatDate;
