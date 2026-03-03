import { describe, expect, it } from 'vitest';

import { getPolicyCmsCopy, getStateCmsCopy } from '@/lib/cms-content';
import { contactStateCopy, getStateOrNull } from '@/lib/phase2-content';

describe('cms content', () => {
  it('loads policy content from cms data for each locale', () => {
    expect(getPolicyCmsCopy('en', 'privacy')?.paragraphs.length).toBeGreaterThan(2);
    expect(getPolicyCmsCopy('es', 'terms')?.title).toContain('Terminos');
    expect(getPolicyCmsCopy('pt', 'cookies')?.title).toContain('Cookies');
  });

  it('provides default state templates when no override exists', () => {
    const saoPaulo = getStateOrNull('sao-paulo');
    expect(saoPaulo).not.toBeNull();
    if (!saoPaulo) return;

    const copy = contactStateCopy('en', saoPaulo);
    expect(copy.title).toContain('Sao Paulo');
    expect(copy.subtitle).toContain('Sao Paulo');
    expect(copy.cards).toHaveLength(3);
  });

  it('returns template structure for faq/services/blog', () => {
    const cmsCopy = getStateCmsCopy('pt', 'rio-de-janeiro');
    expect(cmsCopy.faq.qa).toHaveLength(3);
    expect(cmsCopy.services.modules).toHaveLength(3);
    expect(cmsCopy.blog.sections).toHaveLength(3);
  });
});
