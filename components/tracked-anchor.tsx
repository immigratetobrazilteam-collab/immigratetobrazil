'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

import { trackAnalyticsEvent, type AnalyticsEventParams } from '@/lib/analytics-events';

type TrackedAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventParams?: AnalyticsEventParams;
};

export function TrackedAnchor({ eventName, eventParams, onClick, ...props }: TrackedAnchorProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackAnalyticsEvent(eventName, eventParams);
    onClick?.(event);
  }

  return <a {...props} onClick={handleClick} />;
}
