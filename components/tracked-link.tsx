'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

import { trackAnalyticsEvent, type AnalyticsEventParams } from '@/lib/analytics-events';

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: string;
  eventParams?: AnalyticsEventParams;
};

export function TrackedLink({ eventName, eventParams, onClick, ...props }: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackAnalyticsEvent(eventName, eventParams);
    onClick?.(event);
  }

  return <Link {...props} onClick={handleClick} />;
}
