export function formatMonth(month: string | Date): string {
    if (typeof month === "string") {
      // Se já está no formato MM/YYYY, retorna direto
      if (/^\d{2}\/\d{4}$/.test(month)) return month;
      // Se está no formato YYYY-MM ou YYYY-MM-DD, converte
      const match = month.match(/^(\d{4})-(\d{2})/);
      if (match) return `${match[2]}/${match[1]}`;
      return month;
    }
    // Se for Date
    return `${String(month.getMonth() + 1).padStart(2, "0")}/${month.getFullYear()}`;
  }