import Image from 'next/image';

import { siteConfig } from '@/lib/site-config';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  variant?: 'full' | 'mark';
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant = 'full', className, priority = false }: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <Image
        src={siteConfig.brand.logoMarkPath}
        alt={siteConfig.brand.logoAlt}
        width={512}
        height={512}
        priority={priority}
        className={cn('h-11 w-11 rounded-2xl', className)}
      />
    );
  }

  return (
    <Image
      src={siteConfig.brand.logoFullPath}
      alt={siteConfig.brand.logoAlt}
      width={819}
      height={819}
      priority={priority}
      className={cn('h-12 w-auto', className)}
    />
  );
}
