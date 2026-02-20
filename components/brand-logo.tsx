import Image from 'next/image';

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
        src="/brand/logo-mark-512.png"
        alt="Immigrate to Brazil immigration law firm logo"
        width={56}
        height={56}
        priority={priority}
        className={cn('h-11 w-11 rounded-2xl', className)}
      />
    );
  }

  return (
    <Image
      src="/brand/logo-full.png"
      alt="Immigrate to Brazil immigration law firm logo"
      width={900}
      height={900}
      priority={priority}
      className={cn('h-12 w-auto', className)}
    />
  );
}
