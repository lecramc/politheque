export type Either<S, F> = { type: 'success'; value: S } | { type: 'failure'; reason: F };

export type AppError = {
  message: string;
};

export function isSuccess<S, F>(either: Either<S, F>): either is { type: 'success'; value: S } {
  return either.type === 'success';
}

export function isFailure<S, F>(either: Either<S, F>): either is { type: 'failure'; reason: F } {
  return either.type === 'failure';
}
