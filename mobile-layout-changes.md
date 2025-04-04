# Mobile Layout Changes for QCX

## Overview
This document outlines the changes made to implement a new mobile layout for the QCX application with the following requirements:
- Chat section occupies the top half of the screen
- Icons bar menu occupies the middle section with horizontal scrolling capability
- Map occupies the bottom half of the screen

## Implementation Details

### 1. Mobile-Specific CSS
Added mobile-specific CSS to `globals.css` to handle the new layout structure:

```css
/* Mobile layout specific styles */
@media (max-width: 768px) {
  .mobile-layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
  }

  .mobile-chat-section {
    height: 50vh;
    width: 100%;
    overflow-y: auto;
    padding: 12px;
    padding-top: 60px; /* Account for header */
  }

  .mobile-icons-bar {
    position: fixed;
    top: 50vh;
    left: 0;
    right: 0;
    height: 60px;
    background-color: hsl(var(--background));
    border-top: 1px solid hsl(var(--border));
    border-bottom: 1px solid hsl(var(--border));
    display: flex;
    align-items: center;
    padding: 0 10px;
    z-index: 20;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }

  .mobile-icons-bar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }

  .mobile-icons-bar-content {
    display: flex;
    gap: 20px;
    padding: 0 10px;
    min-width: max-content;
  }

  .mobile-map-section {
    position: fixed;
    top: calc(50vh + 60px); /* Position below icons bar */
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(50vh - 60px);
    width: 100%;
    z-index: 10;
  }
}
```

### 2. Mobile Icons Bar Component
Created a dedicated component for the icons bar that will be displayed in the middle section:

```tsx
// mobile-icons-bar.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Search,
  CircleUserRound,
  Map,
  CalendarDays,
  TentTree
} from 'lucide-react'
import { MapToggle } from './map-toggle'
import { ModeToggle } from './mode-toggle'

export const MobileIconsBar: React.FC = () => {
  return (
    <div className="mobile-icons-bar-content">
      <Button variant="ghost" size="icon">
        <CircleUserRound className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <MapToggle />
      <Button variant="ghost" size="icon">
        <CalendarDays className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
      </Button>
      <Button variant="ghost" size="icon">
        <Search className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
      </Button>
      <Button variant="ghost" size="icon">
        <TentTree className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100" />
      </Button>
      <ModeToggle />
    </div>
  )
}

export default MobileIconsBar
```

### 3. Modified Chat Component
Updated the Chat component to detect mobile devices and render the appropriate layout:

```tsx
// chat.tsx (modified)
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChatPanel } from './chat-panel'
import { ChatMessages } from './chat-messages'
import { Mapbox } from './map/mapbox-map'
import { useUIState, useAIState } from 'ai/rsc'
import MobileIconsBar from './mobile-icons-bar'

type ChatProps = {
  id?: string
}

export function Chat({ id }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!path.includes('search') && messages.length === 1) {
      window.history.replaceState({}, '', `/search/${id}`)
    }
  }, [id, path, messages])

  useEffect(() => {
    if (aiState.messages[aiState.messages.length - 1]?.type === 'followup') {
      // Refresh the page to chat history updates
      router.refresh()
    }
  }, [aiState, router])

  // Mobile layout
  if (isMobile) {
    return (
      <div className="mobile-layout-container">
        <div className="mobile-chat-section">
          <ChatMessages messages={messages} />
          <ChatPanel messages={messages} />
        </div>
        <div className="mobile-icons-bar">
          <MobileIconsBar />
        </div>
        <div className="mobile-map-section">
          <Mapbox />
        </div>
      </div>
    )
  }
  
  // Desktop layout
  return (
    <div className="flex justify-start items-start">
      <div className="w-1/2 flex flex-col space-y-3 md:space-y-4 px-8 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24">
        <ChatMessages messages={messages} />
        <ChatPanel messages={messages} />
      </div>
      <div className="w-1/2 p-4 fixed h-[calc(100vh-0.5in)] top-0 right-0 mt-[0.5in]">
        <Mapbox />
      </div>
    </div>
  )
}
```

## Key Features

1. **Responsive Layout Detection**
   - Uses JavaScript to detect mobile devices based on screen width
   - Automatically switches between desktop and mobile layouts

2. **Horizontal Scrolling for Icons**
   - Icons bar has horizontal scrolling enabled when icons don't fit on screen
   - Touch-friendly scrolling with `-webkit-overflow-scrolling: touch`
   - Hidden scrollbars for cleaner UI with `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`

3. **Proper Positioning**
   - Chat section takes exactly the top half of the screen
   - Icons bar is positioned in the middle
   - Map takes the bottom half of the screen minus the height of the icons bar

## Testing Instructions

To test the mobile layout:
1. Open the application in a browser
2. Use browser developer tools to toggle device mode (mobile view)
3. Verify that the layout changes to show chat on top, icons in middle, and map on bottom
4. Test horizontal scrolling of the icons bar by adding more icons or reducing screen width
5. Test on actual mobile devices to ensure proper functionality

## Notes
- The implementation uses a breakpoint of 768px to determine mobile devices
- The icons bar is set to 60px height, which can be adjusted if needed
- The map section height is calculated as `calc(50vh - 60px)` to account for the icons bar height
