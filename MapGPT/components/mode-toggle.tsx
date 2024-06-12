'use client'

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

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${
            currentTheme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
          }`} />
          <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            currentTheme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
          }`} />
          <Earth className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            currentTheme === 'earth' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
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
