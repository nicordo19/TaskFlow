export type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  dueDate: string | null;
  createdAt?: string;
  updatedAt?: string;
};
