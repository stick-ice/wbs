export type ViewMode = 'year' | 'month' | 'week';
export type TaskLevel = 'large' | 'medium' | 'small';

export interface Task {
  id: string;
  parentId: string | null;
  level: TaskLevel;
  name: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  order: number;
}
