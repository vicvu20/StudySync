export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function windowsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const startA = timeToMinutes(aStart);
  const endA = timeToMinutes(aEnd);
  const startB = timeToMinutes(bStart);
  const endB = timeToMinutes(bEnd);
  return Math.max(startA, startB) < Math.min(endA, endB);
}
