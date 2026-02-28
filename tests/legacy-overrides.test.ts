import { describe, expect, it } from 'vitest';

import { getLegacyCmsCopy, getLegacyPageOverride } from '@/lib/legacy-cms-content';
import { getLegacyDocument } from '@/lib/legacy-loader';

describe('legacy overrides', () => {
  it('loads per-locale legacy ui labels', () => {
    expect(getLegacyCmsCopy('en').ui.keyPointsTitle).toContain('Key');
    expect(getLegacyCmsCopy('es').ui.relatedPagesTitle).toContain('Related');
    expect(getLegacyCmsCopy('pt').ui.exploreLinks.length).toBeGreaterThan(0);
  });

  it('resolves slug override entries', () => {
    const override = getLegacyPageOverride('en', '/en/admin-editable-demo/');
    expect(override).not.toBeNull();
    expect(override?.title).toContain('Admin Editable');
  });

  it('applies cms override even when no legacy html exists', async () => {
    const document = await getLegacyDocument('en', ['admin-editable-demo']);
    expect(document).not.toBeNull();
    expect(document?.title).toBe('Admin Editable Legacy Demo');
    expect(document?.sections.length).toBeGreaterThan(1);
    expect(document?.bullets.length).toBeGreaterThan(1);
  });
});
