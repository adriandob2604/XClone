export type DateInfo = {
  months: string[];
  days: Record<string, number[]>;
  years: number[];
};
export type UserData = {
  name: string;
  surname: string;
  username: string;
  createdOn: Date;
};
export type CommentData = {
  user: UserData;
  comment: string;
  likes: number;
};
export type PostData = {
  user: UserData;
  text: string;
  file: File;
  comments: CommentData[];
  tags: string[];
  createdOn: Date;
  updatedAt: Date
};
export type DraftData = {
  unsentPosts: PostData[];
  scheduledPosts: PostData[];
};
export type TrendingData = {
  title: string
  postCount: number
}
export type SearchItem = {
  id: string;
  input: string;
};
export type History = {
  id: string
  searches: SearchItem[]
}
export function RegisterDateInfo(year: number): DateInfo {
  const isLeapYear = (): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
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
