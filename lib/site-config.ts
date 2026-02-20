import { getSiteSettings } from '@/lib/site-settings-content';

const settings = getSiteSettings();

export const siteConfig = {
  brand: {
    name: settings.brand.name || 'Immigrate to Brazil',
    logoAlt: settings.brand.logoAlt || 'Immigrate to Brazil immigration law firm logo',
    logoMarkPath: settings.brand.logoMarkPath || '/brand/logo-mark-transparent-512.png',
    logoFullPath: settings.brand.logoFullPath || '/brand/logo-full-transparent.png',
    logoSchemaPath: settings.brand.logoSchemaPath || '/brand/logo-mark-transparent-1024.png',
    ogImagePath: settings.brand.ogImagePath || '/brand/og-image.png',
  },
  contact: {
    primaryEmail:
      settings.contact.primaryEmail ||
      process.env.NEXT_PUBLIC_CLIENT_EMAIL?.trim() ||
      'immigratetobrazilteam@gmail.com',
    consultationEmail:
      settings.contact.consultationEmail ||
      process.env.NEXT_PUBLIC_CONSULTATION_EMAIL?.trim() ||
      'immigratetobrazilteam@gmail.com',
    clientEmail:
      settings.contact.clientEmail ||
      process.env.NEXT_PUBLIC_CLIENT_EMAIL?.trim() ||
      'immigratetobrazilteam@gmail.com',
    whatsappNumber:
      settings.contact.whatsappNumber ||
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
      '+55 43 99132-4028',
    whatsappLink:
      settings.contact.whatsappLink ||
      process.env.NEXT_PUBLIC_WHATSAPP_LINK?.trim() ||
      'https://wa.me/5543991324028',
    whatsappProfileImage:
      settings.contact.whatsappProfileImage ||
      process.env.NEXT_PUBLIC_WHATSAPP_PROFILE_IMAGE?.trim() ||
      '/brand/whatsapp-profile.webp',
    formspreeEndpoint:
      settings.contact.formspreeEndpoint ||
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() ||
      'https://formspree.io/f/xbdaaoyb',
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-37FRQJWR68',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() || '',
  },
  seo: {
    googleSiteVerification:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
      settings.seo.googleSiteVerification ||
      'V_VZqx1NiakXTqLhWGFq83By48pnyeKglU8se9hGZIo',
  },
};
