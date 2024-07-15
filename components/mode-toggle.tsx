'use client';

import * as React from 'react';
import { Moon, Sun, Earth } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${
            mounted && currentTheme === 'light' ? 'scale-100' : 'scale-0'
          }`} />
          <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            mounted && currentTheme === 'dark' ? 'scale-100' : 'scale-0'
          }`} />
          <Earth className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            mounted && currentTheme === 'earth' ? 'scale-100' : 'scale-0'
          }`} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('earth')}>
          Earth
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
