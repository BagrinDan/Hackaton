const SECONDS_PER_DAY = 86400;

export function computeElapsedGameSeconds(
  nowMs: number,
  startTime: string,
  gameSpeed: number,
): number {
  const elapsedRealSeconds = (nowMs - Date.parse(startTime)) / 1000;
  return elapsedRealSeconds * gameSpeed;
}

export function computeCurrentDay(
  nowMs: number,
  startTime: string,
  gameSpeed: number,
): number {
  return Math.floor(
    computeElapsedGameSeconds(nowMs, startTime, gameSpeed) / SECONDS_PER_DAY,
  );
}
