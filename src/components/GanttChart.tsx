import { useRef, useEffect } from 'react';
import type { Task, ViewMode } from '../types';
import { getViewRange, getColumns, getBarStyle } from '../utils/date';
import { flattenTasks } from '../utils/tasks';

interface Props {
  tasks: Task[];
  mode: ViewMode;
  refDate: Date;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

const ROW_HEIGHT = 52;

const LEVEL_BG: Record<string, string> = {
  large: 'bg-gray-100',
  medium: 'bg-white',
  small: 'bg-white',
};

const LEVEL_INDENT: Record<string, string> = {
  large: 'pl-2',
  medium: 'pl-6',
  small: 'pl-10',
};

export default function GanttChart({ tasks, mode, refDate, onEdit, onDelete, onAddChild }: Props) {
  const [viewStart, viewEnd] = getViewRange(mode, refDate);
  const columns = getColumns(mode, viewStart, viewEnd);
  const flattened = flattenTasks(tasks);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const onLeftScroll = () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      right.scrollTop = left.scrollTop;
      syncingRef.current = false;
    };
    const onRightScroll = () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      left.scrollTop = right.scrollTop;
      syncingRef.current = false;
    };

    left.addEventListener('scroll', onLeftScroll);
    right.addEventListener('scroll', onRightScroll);
    return () => {
      left.removeEventListener('scroll', onLeftScroll);
      right.removeEventListener('scroll', onRightScroll);
    };
  }, []);

  const colWidth = mode === 'year' ? 80 : mode === 'month' ? 36 : 80;
  const totalWidth = columns.length * colWidth;

  return (
    <div className="flex border border-gray-200 rounded overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Left panel */}
      <div className="flex-none w-64 border-r border-gray-200 flex flex-col">
        <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-2 flex-none">
          <span className="text-xs font-semibold text-gray-600">タスク名</span>
        </div>
        <div ref={leftRef} className="overflow-y-auto overflow-x-hidden flex-1">
          {flattened.map(task => (
            <div
              key={task.id}
              style={{ height: ROW_HEIGHT }}
              className={`flex items-center border-b border-gray-100 ${LEVEL_BG[task.level]}`}
            >
              <div className={`flex-1 min-w-0 flex items-center gap-1 ${LEVEL_INDENT[task.level]}`}>
                <span
                  className={`truncate text-sm ${task.level === 'large' ? 'font-bold' : 'font-normal'}`}
                  title={task.name}
                >
                  {task.name}
                </span>
              </div>
              <div className="flex items-center gap-0.5 pr-1 flex-none">
                {task.level !== 'small' && (
                  <button
                    onClick={() => onAddChild(task.id)}
                    className="text-xs text-green-600 hover:text-green-800 px-1"
                    title="子タスクを追加"
                  >
                    +
                  </button>
                )}
                <button
                  onClick={() => onEdit(task)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-1"
                  title="編集"
                >
                  編
                </button>
                <button
                  onClick={() => {
                    if (confirm(`「${task.name}」を削除しますか？`)) onDelete(task.id);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 px-1"
                  title="削除"
                >
                  削
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-8 bg-gray-50 border-b border-gray-200 overflow-x-auto flex-none">
          <div className="flex h-full" style={{ width: totalWidth }}>
            {columns.map((col, i) => (
              <div
                key={i}
                style={{ width: colWidth, minWidth: colWidth }}
                className="flex items-center justify-center text-xs text-gray-600 border-r border-gray-200 last:border-r-0"
              >
                {col.label}
              </div>
            ))}
          </div>
        </div>
        <div ref={rightRef} className="overflow-auto flex-1">
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {flattened.map(task => {
              const plannedStyle = getBarStyle(task.plannedStart, task.plannedEnd, viewStart, viewEnd);
              const actualStyle = task.actualStart
                ? getBarStyle(task.actualStart, task.actualEnd, viewStart, viewEnd)
                : null;

              return (
                <div
                  key={task.id}
                  style={{ height: ROW_HEIGHT, width: totalWidth, position: 'relative' }}
                  className={`border-b border-gray-100 ${LEVEL_BG[task.level]}`}
                >
                  {/* Column grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {columns.map((_, i) => (
                      <div
                        key={i}
                        style={{ width: colWidth, minWidth: colWidth }}
                        className="border-r border-gray-100 last:border-r-0 h-full"
                      />
                    ))}
                  </div>

                  {/* Planned bar */}
                  {plannedStyle && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        height: 14,
                        left: plannedStyle.left,
                        width: plannedStyle.width,
                      }}
                      className="bg-blue-500 rounded-sm"
                      title={`計画: ${task.plannedStart} 〜 ${task.plannedEnd}`}
                    />
                  )}

                  {/* Actual bar */}
                  {actualStyle && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 28,
                        height: 14,
                        left: actualStyle.left,
                        width: actualStyle.width,
                      }}
                      className="bg-green-500 rounded-sm"
                      title={`実績: ${task.actualStart} 〜 ${task.actualEnd}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
