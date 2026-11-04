/** Horloge injectable : les dates restent déterministes en test. */
export interface Clock {
  now(): Date;
}
