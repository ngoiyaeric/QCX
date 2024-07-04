'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CalendarDays } from 'lucide-react'
import { useTimeToggle, TimeToggleEnum } from './time-toggle-context'

export function TimeToggle() {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <CalendarDays className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          Trips
        </DropdownMenuItem>
        <DropdownMenuItem>
          Appointments
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
