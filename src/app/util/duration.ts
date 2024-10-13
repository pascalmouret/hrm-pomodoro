export const MILLS_IN_SECOND = 1000;
export const MILLS_IN_MINUTE = MILLS_IN_SECOND * 60;

export function millisAsPretty(millis: number): string {
  const minutes = Math.floor(millis / MILLS_IN_MINUTE);
  const seconds = Math.floor((millis % MILLS_IN_MINUTE) / MILLS_IN_SECOND);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
