import type { Clock } from '@/src/programmes/gateways/clock.gateway';

export class FakeClock implements Clock {
  constructor(public current = new Date('2026-11-04T10:00:00.000Z')) {}

  now() {
    return this.current;
  }
}
