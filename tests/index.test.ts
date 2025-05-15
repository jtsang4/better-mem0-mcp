import { expect, test } from 'vitest';
import { createMem0Server } from '../src/index';

test('createMem0Server', () => {
  const server = createMem0Server({});
  expect(server).toBeDefined();
});
