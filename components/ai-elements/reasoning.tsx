'use client'
import { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface ReasoningProps {
  className?: string;
  isStreaming: boolean;
  children: React.ReactNode;
}

export function Reasoning({ className, isStreaming, children }: ReasoningProps) {
  const [isOpen, setIsOpen] = useState(isStreaming);

 +useEffect(() => {
+  if (isStreaming) setIsOpen(true);
+}, [isStreaming]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost">Toggle Reasoning</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
      <div role="status" aria-live={isStreaming ? 'polite' : 'off'}>
+          {children}
+        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
export function ReasoningTrigger(props: ComponentProps<typeof Button>) {
  return <Button variant="ghost" {...props}>Show Reasoning</Button>;
}


export function ReasoningContent({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['p-4 border rounded-md', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
 }
