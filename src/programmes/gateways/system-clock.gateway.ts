import type { Clock } from '@/src/programmes/gateways/clock.gateway';

export const systemClock: Clock = { now: () => new Date() };
