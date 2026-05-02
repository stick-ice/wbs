import { useState, useEffect } from 'react';
import type { Task, TaskLevel } from '../types';

interface Props {
  tasks: Task[];
  initial?: Task | null;
  defaultLevel?: TaskLevel;
  defaultParentId?: string | null;
  onSubmit: (data: Omit<Task, 'id' | 'order'>) => void;
  onClose: () => void;
}

const LEVEL_LABELS: Record<TaskLevel, string> = {
  large: '大項目',
  medium: '中項目',
  small: '小項目',
};

export default function TaskForm({ tasks, initial, defaultLevel, defaultParentId, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [level, setLevel] = useState<TaskLevel>(initial?.level ?? defaultLevel ?? 'large');
  const [parentId, setParentId] = useState<string | null>(initial?.parentId ?? defaultParentId ?? null);
  const [plannedStart, setPlannedStart] = useState(initial?.plannedStart ?? '');
  const [plannedEnd, setPlannedEnd] = useState(initial?.plannedEnd ?? '');
  const [actualStart, setActualStart] = useState(initial?.actualStart ?? '');
  const [actualEnd, setActualEnd] = useState(initial?.actualEnd ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (level === 'large') setParentId(null);
  }, [level]);

  const parentOptions = tasks.filter(t => {
    if (level === 'medium') return t.level === 'large';
    if (level === 'small') return t.level === 'medium';
    return false;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('タスク名は必須です'); return; }
    if (!plannedStart) { setError('計画開始日は必須です'); return; }
    if (!plannedEnd) { setError('計画終了日は必須です'); return; }
    if (plannedEnd < plannedStart) { setError('計画終了日は開始日以降にしてください'); return; }
    if ((level === 'medium' || level === 'small') && !parentId) {
      setError('親タスクを選択してください'); return;
    }
    if (actualStart && actualEnd && actualEnd < actualStart) {
      setError('実績終了日は開始日以降にしてください'); return;
    }
    onSubmit({
      name: name.trim(),
      level,
      parentId: level === 'large' ? null : parentId,
      plannedStart,
      plannedEnd,
      actualStart: actualStart || null,
      actualEnd: actualEnd || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {initial ? 'タスクを編集' : 'タスクを追加'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タスク名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value as TaskLevel)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(LEVEL_LABELS) as TaskLevel[]).map(l => (
                <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
              ))}
            </select>
          </div>

          {(level === 'medium' || level === 'small') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">親タスク</label>
              <select
                value={parentId ?? ''}
                onChange={e => setParentId(e.target.value || null)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {parentOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">計画開始日</label>
              <input
                type="date"
                value={plannedStart}
                onChange={e => setPlannedStart(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">計画終了日</label>
              <input
                type="date"
                value={plannedEnd}
                onChange={e => setPlannedEnd(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">実績開始日（任意）</label>
              <input
                type="date"
                value={actualStart}
                onChange={e => setActualStart(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">実績終了日（任意）</label>
              <input
                type="date"
                value={actualEnd}
                onChange={e => setActualEnd(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              {initial ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
