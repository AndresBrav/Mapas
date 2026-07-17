import { describe, it, expect, vi } from 'vitest';

vi.mock('@tigo/postgres-connector', () => ({
  executeQuery: vi.fn()
}));

import { executeQuery } from '@tigo/postgres-connector';
import { insertExample, selectExampleById } from '../../../src/repositories/example.repository.js';

describe('example.repository.js', () => {
  it('insertExample should run INSERT and return the created row', async () => {
    const row = { id: 1, name: 'item' };
    executeQuery.mockResolvedValue([row]);

    const result = await insertExample({ name: 'item' });

    const [query, params] = executeQuery.mock.lastCall;
    expect(query).toMatch(/INSERT INTO example/);
    expect(params[0]).toBe('item');
    expect(result).toEqual(row);
  });

  it('selectExampleById should run SELECT and return the row', async () => {
    const row = { id: 1, name: 'item' };
    executeQuery.mockResolvedValue([row]);

    const result = await selectExampleById(1);

    const [query, params] = executeQuery.mock.lastCall;
    expect(query).toContain('SELECT');
    expect(query).toContain('FROM example WHERE id');
    expect(params[0]).toBe(1);
    expect(result).toEqual(row);
  });
});
