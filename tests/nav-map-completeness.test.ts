import { describe, expect, it } from 'vitest';

import enMap from '../content/cms/navigation-map/en.json';
import esMap from '../content/cms/navigation-map/es.json';
import frMap from '../content/cms/navigation-map/fr.json';
import ptMap from '../content/cms/navigation-map/pt.json';

const maps = { en: enMap, es: esMap, pt: ptMap, fr: frMap } as const;

function collectReferencedIds(map: any) {
  const ids: string[] = [];
  ids.push(...map.header.top_bar_ids);
  ids.push(map.header.main_menu.home_id, map.header.main_menu.cta_id);
  for (const menu of map.header.mega_menus) {
    for (const column of menu.columns) {
      ids.push(...column.item_ids);
    }
  }
  for (const column of map.footer.columns) {
    ids.push(...column.item_ids);
  }
  return ids;
}

describe('navigation map completeness', () => {
  it('has unique registry ids for every locale map', () => {
    for (const [locale, map] of Object.entries(maps)) {
      const ids = map.registry.map((item) => item.id);
      expect(new Set(ids).size, `${locale} has duplicate ids`).toBe(ids.length);
    }
  });

  it('references only existing ids in header/footer structures', () => {
    for (const [locale, map] of Object.entries(maps)) {
      const registryIds = new Set(map.registry.map((item) => item.id));
      const referenced = collectReferencedIds(map);
      const missing = referenced.filter((id) => !registryIds.has(id));
      expect(missing, `${locale} has missing registry ids`).toEqual([]);
    }
  });

  it('contains every top-level menu expected by design', () => {
    const expected = ['Brazil', 'About Us', 'Process', 'Services', 'Insights'];
    const top = enMap.header.mega_menus.map((item) => item.label);
    expect(top).toEqual(expected);
  });

  it('contains required footer columns expected by design', () => {
    const expected = ['Immigration', 'Brazil', 'Resources', 'Firm', 'Legal'];
    const cols = enMap.footer.columns.map((item) => item.title);
    expect(cols).toEqual(expected);
  });
});
