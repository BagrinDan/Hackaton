import {
  computeCurrentDay,
  computeElapsedGameSeconds,
} from './simulation-clock';

describe('simulation clock', () => {
  const startTime = '2026-06-14T09:00:00Z';
  const startMs = Date.parse(startTime);

  it('computes zero elapsed game seconds at the start time', () => {
    expect(computeElapsedGameSeconds(startMs, startTime, 300)).toBe(0);
  });

  it('returns day 0 at the start time', () => {
    expect(computeCurrentDay(startMs, startTime, 300)).toBe(0);
  });

  it('returns day 0 when less than one in-game day has elapsed', () => {
    const halfGameDayAtSpeed300Ms = startMs + 144 * 1000;

    expect(computeCurrentDay(halfGameDayAtSpeed300Ms, startTime, 300)).toBe(0);
  });

  it('returns day 1 when exactly one in-game day has elapsed', () => {
    const oneGameDayAtSpeed300Ms = startMs + 288 * 1000;

    expect(computeCurrentDay(oneGameDayAtSpeed300Ms, startTime, 300)).toBe(1);
  });

  it('returns the correct day when multiple in-game days have elapsed', () => {
    const threeGameDaysAtSpeed300Ms = startMs + 864 * 1000;

    expect(computeCurrentDay(threeGameDaysAtSpeed300Ms, startTime, 300)).toBe(
      3,
    );
  });
});
