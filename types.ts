export type ClassItem = {
  id: string;
  name: string;
  instructor: string;
  datetime: string;
  capacity: number;
  bookedUserIds: string[];
  waitlistUserIds: string[];
};

export type MockUser = {
  id: string;
  name: string;
};
