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

  useEffect(() => {
    setIsOpen(isStreaming);
  }, [isStreaming]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost">Toggle Reasoning</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ReasoningTrigger() {
  return <Button variant="ghost">Show Reasoning</Button>;
}

export function ReasoningContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border rounded-md">{children}</div>;
}
