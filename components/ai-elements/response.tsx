'use client';

import { cn } from '@/lib/utils/index';
import { Streamdown } from 'streamdown';
import { type ComponentProps, type ElementRef, forwardRef, memo } from 'react';


export type ResponseProps = ComponentProps<typeof Streamdown>;
type ResponseRef = ElementRef<typeof Streamdown>;



const ResponseBase = forwardRef<ResponseRef, ResponseProps>(function Response(
  { className, ...props },
  ref
) {
  return (
    <Streamdown
      ref={ref}
      className={cn(
        'w-full h-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
      {...props}
    />
  );
});

export const Response = memo(ResponseBase);

Response.displayName = 'Response';
