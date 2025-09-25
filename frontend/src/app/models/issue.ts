export interface Issue {
  id: string;
  title: string;
  status: 'Open' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}