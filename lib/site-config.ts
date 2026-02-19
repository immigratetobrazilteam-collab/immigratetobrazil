export const siteConfig = {
  contact: {
    consultationEmail:
      process.env.NEXT_PUBLIC_CONSULTATION_EMAIL?.trim() || 'consult@immigratetobrazil.com',
    clientEmail: process.env.NEXT_PUBLIC_CLIENT_EMAIL?.trim() || 'clientdesk@immigratetobrazil.com',
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '+55 61 98100-1000',
    whatsappLink:
      process.env.NEXT_PUBLIC_WHATSAPP_LINK?.trim() || 'https://wa.me/5561981001000',
  },
  analytics: {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '',
    gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() || '',
  },
};
