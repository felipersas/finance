export interface UserBalance {
  _sum: { valor: number | null };
}

export interface UserDayActivity {
  date: string;
  total: number;
}
