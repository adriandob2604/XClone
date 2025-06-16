
export type DateInfo = {
  months: string[];
  days: Record<string, number[]>;
  years: number[];
};
export type Follower = {
  userId:  string, 
	username: string
}
export type UserData = {
  id: string;
  name: string;
  surname: string;
  username: string;
  profileImageUrl: string;
  backgroundImageUrl: string;
  description: string;
  createdOn: Date;
  followers: Follower[]
  following: Follower[]
};

export type UserComponentProps = {
  user: UserData
  children?: React.ReactNode;
};
export type CommentData = {
  id: string;
  userId: string
  comment: string;
  likes: number;
  createdAt: Date
};

export type PostData = {
  id: string
  userId: string;
  text: string;
  fileUrl: string;
  comments: CommentData[];
  tags: string[];
  likes: number;
  createdOn: Date;
  updatedAt: Date
};
export type DraftData = {
  unsentPosts: PostData[];
  scheduledPosts: PostData[];
};
export type TrendingData = {
  tag: string
  posts: PostData[]
}
export type SearchItem = {
  id: string;
  input: string;
};
export type History = {
  id: string
  searches: SearchItem[]
}
export type Message = {
  id: string
  message: string
  userId: string,
  createdOn: Date
}
export type Chat = {
  id: string
  user: UserData
}
export type Notification = {
  id: string
  notification: string
  createdOn: Date
}
export type PostComponentProps = {
  postData: PostData[]
}
export type FollowUserProps = {
  users: UserData[]
}
export type TodaysNews = {
  title:string
  postCount: number
}
export const url = "https://localhost/api"
export const letters = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);
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
