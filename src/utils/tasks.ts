import type { Task } from '../types';

export function flattenTasks(tasks: Task[]): Task[] {
  const largeTasks = tasks
    .filter(t => t.level === 'large')
    .sort((a, b) => a.order - b.order);

  const result: Task[] = [];
  for (const large of largeTasks) {
    result.push(large);
    const mediums = tasks
      .filter(t => t.level === 'medium' && t.parentId === large.id)
      .sort((a, b) => a.order - b.order);
    for (const medium of mediums) {
      result.push(medium);
      const smalls = tasks
        .filter(t => t.level === 'small' && t.parentId === medium.id)
        .sort((a, b) => a.order - b.order);
      result.push(...smalls);
    }
  }
  return result;
}
