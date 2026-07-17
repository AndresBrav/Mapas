import { describe, it, expect } from 'vitest';
import { setError, errorCodes } from '../../../src/utils/errorCodes.js';

describe('errorCodes.js', () => {
  it('setError should create an Error with the specified message and errorCode', () => {
    const error = setError('Test error message', errorCodes.NOT_FOUND);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error message');
    expect(error.errorCode).toBe(errorCodes.NOT_FOUND);
  });
});
