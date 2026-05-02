import { useState } from 'react';
import type { Task, TaskLevel, ViewMode } from './types';
import { useTasks } from './hooks/useTasks';
import ViewControls from './components/ViewControls';
import TaskForm from './components/TaskForm';
import GanttChart from './components/GanttChart';

interface FormState {
  task?: Task;
  defaultLevel?: TaskLevel;
  defaultParentId?: string | null;
}

export default function App() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [mode, setMode] = useState<ViewMode>('month');
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [formState, setFormState] = useState<FormState | null>(null);

  const openAdd = (defaultLevel?: TaskLevel, defaultParentId?: string | null) => {
    setFormState({ defaultLevel, defaultParentId });
  };

  const openEdit = (task: Task) => {
    setFormState({ task });
  };

  const handleSubmit = (data: Omit<Task, 'id' | 'order'>) => {
    if (formState?.task) {
      updateTask(formState.task.id, data);
    } else {
      addTask(data);
    }
  };

  const handleAddChild = (parentId: string) => {
    const parent = tasks.find(t => t.id === parentId);
    if (!parent) return;
    const childLevel: TaskLevel = parent.level === 'large' ? 'medium' : 'small';
    openAdd(childLevel, parentId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h1 className="text-xl font-bold text-gray-800">WBS ガントチャート</h1>
          <button
            onClick={() => openAdd('large', null)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            + タスクを追加
          </button>
        </div>

        <div className="mb-3">
          <ViewControls
            mode={mode}
            refDate={refDate}
            onModeChange={setMode}
            onRefChange={setRefDate}
          />
        </div>

        <GanttChart
          tasks={tasks}
          mode={mode}
          refDate={refDate}
          onEdit={openEdit}
          onDelete={deleteTask}
          onAddChild={handleAddChild}
        />

        {formState !== null && (
          <TaskForm
            tasks={tasks}
            initial={formState.task ?? null}
            defaultLevel={formState.defaultLevel}
            defaultParentId={formState.defaultParentId}
            onSubmit={handleSubmit}
            onClose={() => setFormState(null)}
          />
        )}
      </div>
    </div>
  );
}
