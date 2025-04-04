# Updated Mobile Layout Changes for QCX

## Overview
This document outlines the updated changes made to implement the mobile layout for the QCX application with the following requirements:
- Chat section occupies the top half of the screen
- Icons bar menu occupies the middle section with horizontal scrolling capability
- Map occupies the bottom half of the screen

## Issues Fixed Based on User Feedback

1. **Removed Icons from Top Right**
   - Hidden header icons on mobile devices
   - Ensured only mobile-specific UI elements are shown

2. **Fixed Chat Input Width**
   - Made chat input span the full width of the screen on mobile
   - Adjusted padding for better spacing

3. **Improved Layout Proportions**
   - Reduced chat section height from 50vh to 40vh for better visibility of recommended chats
   - Moved the icons bar up to the 40vh mark
   - Positioned the chat input outside the chat section for better visibility
   - Increased the map section height to 60vh (minus the icons bar height)

## Implementation Details

### 1. Updated Mobile-Specific CSS
Modified mobile-specific CSS in `globals.css`:

```css
@media (max-width: 768px) {
  .mobile-layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
  }

  .mobile-chat-section {
    height: 40vh;
    width: 100%;
    overflow-y: auto;
    padding: 12px;
    padding-top: 50px; /* Account for header */
    position: relative;
  }

  .mobile-icons-bar {
    position: fixed;
    top: 40vh;
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
    top: calc(40vh + 60px); /* Position below icons bar */
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(60vh - 60px);
    width: 100%;
    z-index: 10;
  }
}
```

### 2. Modified Header Component
Updated the header component to hide icons on mobile:

```tsx
// header.tsx
<div className="w-1/2 gap-20 hidden md:flex justify-between px-10 items-center z-10">
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
  <HistoryContainer location="header" />
</div>
```

### 3. Updated Chat Panel Component
Modified the chat panel to span full width on mobile:

```tsx
// chat-panel.tsx
<div className="fixed top-10 left-2 bottom-8 md:w-1/2 w-full flex flex-col items-start justify-center">
  <form onSubmit={handleSubmit} className="max-w-full w-full px-4 md:px-6">
    <div className="relative flex items-start w-full">
      <Textarea
        ref={inputRef}
        name="input"
        rows={1}
        maxRows={5}
        tabIndex={0}
        placeholder="Ask a question..."
        spellCheck={false}
        value={input}
        className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-20 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'"
```

### 4. Updated Chat Component Structure
Repositioned the ChatPanel component outside the mobile-chat-section div:

```tsx
// chat.tsx
if (isMobile) {
  return (
    <div className="mobile-layout-container">
      <div className="mobile-chat-section">
        <ChatMessages messages={messages} />
      </div>
      <ChatPanel messages={messages} />
      <div className="mobile-icons-bar">
        <MobileIconsBar />
      </div>
      <div className="mobile-map-section">
        <Mapbox />
      </div>
    </div>
  )
}
```

## Testing Instructions

To test the updated mobile layout:
1. Open the application in a browser
2. Use browser developer tools to toggle device mode (mobile view)
3. Verify that:
   - No icons appear in the top right corner
   - The chat input spans the full width of the screen
   - All recommended chats are visible
   - The icons bar is positioned in the middle with horizontal scrolling
   - The map occupies the bottom portion of the screen

## Notes
- The implementation uses a breakpoint of 768px to determine mobile devices
- The chat section height is now 40vh (was 50vh) to make more room for recommended chats
- The map section height is now 60vh minus the icons bar height
- The icons bar is set to 60px height
