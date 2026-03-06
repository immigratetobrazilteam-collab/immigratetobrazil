import enMap from '@/content/cms/navigation-map/en.json';
import ptMap from '@/content/cms/navigation-map/pt.json';
import { getMasterLocaleSection } from '@/lib/master-cms-content';
import type { Locale } from '@/lib/types';

export type NavigationRouteType = 'static' | 'dynamic' | 'hub' | 'external' | 'search' | 'conversion';
export type NavigationTemplateFamily =
  | 'hub'
  | 'long_form_guide'
  | 'service_detail'
  | 'profile_story'
  | 'process_compliance'
  | 'conversion_contact'
  | 'legal_policy';
export type NavigationStatus = 'live' | 'placeholder' | 'needs_content';

export type NavigationRegistryItem = {
  id: string;
  menu_group: string;
  label: string;
  href: string;
  route_type: NavigationRouteType;
  template_family: NavigationTemplateFamily;
  status: NavigationStatus;
};

export type NavigationMap = {
  registry: NavigationRegistryItem[];
  header: {
    top_bar_ids: string[];
    main_menu: {
      home_id: string;
      cta_id: string;
    };
    mega_menus: Array<{
      id: string;
      label: string;
      columns: Array<{
        title: string;
        item_ids: string[];
      }>;
    }>;
  };
  footer: {
    columns: Array<{
      title: string;
      item_ids: string[];
    }>;
    search: {
      placeholder: string;
      action_href: string;
      button_label: string;
    };
  };
};

const mapByLocale: Record<Locale, NavigationMap> = {
  en: getMasterLocaleSection<NavigationMap>('navigationMap', 'en', enMap as NavigationMap),
  pt: getMasterLocaleSection<NavigationMap>('navigationMap', 'pt', ptMap as NavigationMap),
};

function resolveCmsHref(locale: Locale, href: string) {
  // Normalizes CMS path values into locale-aware internal links.
  if (!href) return `/${locale}`;
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }
  if (href === '/') return `/${locale}`;
  if (href === '/sitemap.xml' || href === '/robots.txt') return href;
  if (href.startsWith(`/${locale}`)) return href;
  return `/${locale}${href.startsWith('/') ? href : `/${href}`}`;
}

export function getNavigationMap(locale: Locale) {
  const base = mapByLocale[locale] ?? mapByLocale.en;
  const fallback = mapByLocale.en;

  // Merge locale registry with EN defaults so missing localized labels/hrefs do not break menus.
  const fallbackRegistry = new Map(fallback.registry.map((item) => [item.id, item]));
  const mergedRegistry = base.registry.map((item) => {
    const fallbackItem = fallbackRegistry.get(item.id);
    if (!fallbackItem) return item;
    return {
      ...fallbackItem,
      ...item,
      href: item.href || fallbackItem.href,
      label: item.label || fallbackItem.label,
    };
  });

  const mergedMap: NavigationMap = {
    ...base,
    registry: mergedRegistry,
  };

  const registryById = new Map(mergedMap.registry.map((item) => [item.id, item]));
  return {
    ...mergedMap,
    registryById,
    resolveHref(href: string) {
      return resolveCmsHref(locale, href);
    },
    resolveItem(itemId: string) {
      const item = registryById.get(itemId) || fallbackRegistry.get(itemId);
      if (!item) return null;
      return {
        ...item,
        href: resolveCmsHref(locale, item.href),
      };
    },
  };
}
