import siteSettings from '@/content/cms/settings/site-settings.json';
import { getMasterPathWithFallback } from '@/lib/master-cms-content';

type SiteBrandSettings = {
  name: string;
  logoAlt: string;
  logoMarkPath: string;
  logoFullPath: string;
  logoSchemaPath: string;
  ogImagePath: string;
};

type SiteContactSettings = {
  primaryEmail: string;
  consultationEmail: string;
  clientEmail: string;
  whatsappNumber: string;
  whatsappLink: string;
  whatsappProfileImage: string;
  formspreeEndpoint: string;
};

type SiteSeoSettings = {
  googleSiteVerification: string;
};

export type SiteSettings = {
  brand: SiteBrandSettings;
  contact: SiteContactSettings;
  seo: SiteSeoSettings;
};

const typedSettings = getMasterPathWithFallback<SiteSettings>(['settings', 'site'], siteSettings as SiteSettings);

export function getSiteSettings() {
  return typedSettings;
}
