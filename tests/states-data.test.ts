import { describe, expect, it } from 'vitest';

import { brazilianStates, stateBySlug } from '../content/curated/states';

describe('states dataset', () => {
  it('contains the 27 federal units', () => {
    expect(brazilianStates).toHaveLength(27);
  });

  it('has unique slugs and codes', () => {
    const slugSet = new Set(brazilianStates.map((s) => s.slug));
    const codeSet = new Set(brazilianStates.map((s) => s.code));

    expect(slugSet.size).toBe(27);
    expect(codeSet.size).toBe(27);
  });

  it('builds direct map lookups', () => {
    expect(stateBySlug.get('sao-paulo')?.code).toBe('SP');
    expect(stateBySlug.get('distrito-federal')?.capital).toBe('Brasilia');
    expect(stateBySlug.get('not-a-state')).toBeUndefined();
  });
});
