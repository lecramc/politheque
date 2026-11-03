import { AppError, Either } from '@/src/helpers/either.type';

type Final<T> = Promise<Either<T, AppError>>;

export async function tryCatch<T>(promise: Promise<T>): Final<T> {
  try {
    const data = await promise;
    return { type: 'success', value: data };
  } catch (error) {
    return {
      type: 'failure',
      reason: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
