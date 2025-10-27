export function getDasDueDays(): { daysLeft: number; dueDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let dueDate = new Date(year, month, 20);

  // Se já passou do dia 20, pega o próximo mês
  if (now.getDate() > 20) {
    dueDate = new Date(year, month + 1, 20);
  }

  // Define horário para meio-dia para evitar problemas de fuso/UTC
  dueDate.setHours(12, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / msPerDay);

  return {
    daysLeft,
    dueDate: dueDate.toISOString().slice(0, 10), // yyyy-mm-dd
  };
}
