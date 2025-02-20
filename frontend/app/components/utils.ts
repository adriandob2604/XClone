type DateInfo = {
  months: string[];
  days: Record<string, number[]>;
  years: number[];
};

export function RegisterDateInfo(year: number): DateInfo {
  const isLeapYear = (): boolean => {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return true;
    } else {
      return false;
    }
  };
  const threshold = 120;
  const numArray = (num: number): number[] => {
    return Array.from({ length: num }, (_, i) => i + 1);
  };
  const monthsDays: Record<string, number[]> = {
    January: numArray(31),
    February: isLeapYear() ? numArray(28) : numArray(29),
    March: numArray(31),
    April: numArray(30),
    May: numArray(31),
    June: numArray(30),
    July: numArray(31),
    August: numArray(31),
    September: numArray(30),
    October: numArray(31),
    November: numArray(30),
    December: numArray(31),
  };
  const years = Array.from(
    { length: 120 },
    (_, i) => new Date().getFullYear() - threshold + i
  );
  return { months: Object.keys(monthsDays), days: monthsDays, years: years };
}
