function formatMoney(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatMoneyView(text: string = ""): string {
  const numberValue = parseFloat(text) || 0;

  return formatMoney(numberValue, "BRL", "pt-BR");
}
