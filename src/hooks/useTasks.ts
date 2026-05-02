import { useState, useCallback } from 'react';
import type { Task, TaskLevel } from '../types';
import { loadTasks, saveTasks } from '../utils/storage';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  const addTask = useCallback((task: Omit<Task, 'id' | 'order'>) => {
    setTasks(prev => {
      const siblings = prev.filter(
        t => t.level === task.level && t.parentId === task.parentId
      );
      const maxOrder = siblings.reduce((m, t) => Math.max(m, t.order), -1);
      const next = [
        ...prev,
        {
          ...task,
          id: crypto.randomUUID(),
          order: maxOrder + 1,
        },
      ];
      saveTasks(next);
      return next;
    });
  }, []);

  const updateTask = useCallback((id: string, changes: Partial<Task>) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...changes } : t));
      saveTasks(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const toDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const t of prev) {
          if (t.parentId && toDelete.has(t.parentId) && !toDelete.has(t.id)) {
            toDelete.add(t.id);
            changed = true;
          }
        }
      }
      const next = prev.filter(t => !toDelete.has(t.id));
      saveTasks(next);
      return next;
    });
  }, []);

  const reorderTask = useCallback((id: string, dir: 1 | -1) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      const siblings = prev
        .filter(t => t.level === task.level && t.parentId === task.parentId)
        .sort((a, b) => a.order - b.order);
      const idx = siblings.findIndex(t => t.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= siblings.length) return prev;
      const swapTask = siblings[swapIdx];
      const next = prev.map(t => {
        if (t.id === id) return { ...t, order: swapTask.order };
        if (t.id === swapTask.id) return { ...t, order: task.order };
        return t;
      });
      saveTasks(next);
      return next;
    });
  }, []);

  const getChildLevel = (level: TaskLevel): TaskLevel | null => {
    if (level === 'large') return 'medium';
    if (level === 'medium') return 'small';
    return null;
  };

  return { tasks, addTask, updateTask, deleteTask, reorderTask, getChildLevel };
}
