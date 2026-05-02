import type { ViewMode } from '../types';
import { navigateRef, getViewLabel } from '../utils/date';

interface Props {
  mode: ViewMode;
  refDate: Date;
  onModeChange: (mode: ViewMode) => void;
  onRefChange: (date: Date) => void;
}

export default function ViewControls({ mode, refDate, onModeChange, onRefChange }: Props) {
  const modes: { value: ViewMode; label: string }[] = [
    { value: 'year', label: '1年' },
    { value: 'month', label: '1ヶ月' },
    { value: 'week', label: '1週間' },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1">
        {modes.map(m => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
              mode === m.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onRefChange(navigateRef(mode, refDate, -1))}
          className="px-3 py-1 rounded text-sm border border-gray-300 bg-white hover:bg-gray-50"
        >
          &lt; 前へ
        </button>
        <button
          onClick={() => onRefChange(new Date())}
          className="px-3 py-1 rounded text-sm border border-gray-300 bg-white hover:bg-gray-50"
        >
          今日
        </button>
        <button
          onClick={() => onRefChange(navigateRef(mode, refDate, 1))}
          className="px-3 py-1 rounded text-sm border border-gray-300 bg-white hover:bg-gray-50"
        >
          次へ &gt;
        </button>
      </div>

      <span className="text-sm font-semibold text-gray-700">
        {getViewLabel(mode, refDate)}
      </span>
    </div>
  );
}
