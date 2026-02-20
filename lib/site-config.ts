export const siteConfig = {
  contact: {
    primaryEmail:
      process.env.NEXT_PUBLIC_CLIENT_EMAIL?.trim() || 'immigratetobrazilteam@gmail.com',
    consultationEmail:
      process.env.NEXT_PUBLIC_CONSULTATION_EMAIL?.trim() || 'immigratetobrazilteam@gmail.com',
    clientEmail: process.env.NEXT_PUBLIC_CLIENT_EMAIL?.trim() || 'immigratetobrazilteam@gmail.com',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '+55 43 99132-4028',
    whatsappLink:
      process.env.NEXT_PUBLIC_WHATSAPP_LINK?.trim() || 'https://wa.me/5543991324028',
    formspreeEndpoint:
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim() || 'https://formspree.io/f/xbdaaoyb',
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() || '',
  },
};
