import type { ViewMode } from '../types';

export function getViewRange(mode: ViewMode, refDate: Date): [Date, Date] {
  const d = new Date(refDate);
  if (mode === 'year') {
    const start = new Date(d.getFullYear(), 0, 1);
    const end = new Date(d.getFullYear() + 1, 0, 1);
    return [start, end];
  }
  if (mode === 'month') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return [start, end];
  }
  // week: Monday-based
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return [monday, sunday];
}

export interface ColumnInfo {
  label: string;
  start: Date;
  end: Date;
}

export function getColumns(mode: ViewMode, viewStart: Date, viewEnd: Date): ColumnInfo[] {
  const cols: ColumnInfo[] = [];
  if (mode === 'year') {
    for (let m = 0; m < 12; m++) {
      const start = new Date(viewStart.getFullYear(), m, 1);
      const end = new Date(viewStart.getFullYear(), m + 1, 1);
      cols.push({ label: `${m + 1}月`, start, end });
    }
  } else {
    const cur = new Date(viewStart);
    while (cur < viewEnd) {
      const start = new Date(cur);
      const end = new Date(cur);
      end.setDate(end.getDate() + 1);
      cols.push({ label: `${cur.getDate()}`, start, end });
      cur.setDate(cur.getDate() + 1);
    }
  }
  return cols;
}

export function navigateRef(mode: ViewMode, refDate: Date, dir: 1 | -1): Date {
  const d = new Date(refDate);
  if (mode === 'year') {
    d.setFullYear(d.getFullYear() + dir);
  } else if (mode === 'month') {
    d.setMonth(d.getMonth() + dir);
  } else {
    d.setDate(d.getDate() + dir * 7);
  }
  return d;
}

export function getBarStyle(
  start: string,
  end: string | null,
  viewStart: Date,
  viewEnd: Date
): { left: string; width: string } | null {
  if (!end) return null;
  const s = new Date(start);
  const e = new Date(end);
  e.setDate(e.getDate() + 1);
  const total = viewEnd.getTime() - viewStart.getTime();
  if (total <= 0) return null;
  const left = Math.max(0, (s.getTime() - viewStart.getTime()) / total) * 100;
  const right = Math.min(1, (e.getTime() - viewStart.getTime()) / total) * 100;
  const width = right - left;
  if (width <= 0) return null;
  return { left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%` };
}

export function getViewLabel(mode: ViewMode, refDate: Date): string {
  const d = refDate;
  if (mode === 'year') return `${d.getFullYear()}年`;
  if (mode === 'month') return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  const [weekStart] = getViewRange('week', d);
  const weekNum = getWeekOfMonth(weekStart);
  return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月第${weekNum}週`;
}

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstMonday = firstDay.getDay() === 0
    ? new Date(firstDay.getFullYear(), firstDay.getMonth(), 2)
    : new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 + ((8 - firstDay.getDay()) % 7));
  const diff = Math.floor((date.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}
