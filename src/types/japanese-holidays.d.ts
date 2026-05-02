declare module 'japanese-holidays' {
  export function isHoliday(date: Date): string | undefined;
  export function getHolidaysOf(year: number): { month: number; date: number; week: number; name: string }[];
}
