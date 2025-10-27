export const toDayWithoutHour = (date?: Date | string): string => {
  if (!date)
    return new Date(new Date().setHours(0, 0, 0, 0)).toLocaleDateString(
      "pt-BR",
    );

  const parsed = typeof date === "string" ? date : date.toISOString();
  const [year, month, day] = parsed.split("T")[0].split("-");

  const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));

  return formattedDate.toLocaleDateString("pt-BR");
};
