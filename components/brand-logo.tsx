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
        src="/brand/logo-mark-transparent-512.png"
        alt="Immigrate to Brazil immigration law firm logo"
        width={512}
        height={512}
        priority={priority}
        className={cn('h-11 w-11 rounded-2xl', className)}
      />
    );
  }

  return (
    <Image
      src="/brand/logo-full-transparent.png"
      alt="Immigrate to Brazil immigration law firm logo"
      width={819}
      height={819}
      priority={priority}
      className={cn('h-12 w-auto', className)}
    />
  );
}
