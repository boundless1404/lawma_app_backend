export function getCurrentMonth(): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[new Date().getMonth()];
}

export function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}
