'use client'

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChatPanel } from './chat-panel';
import { ChatMessages } from './chat-messages';
import { Mapbox } from './map/mapbox-map';
import { EarthEngine } from './map/earthengine';
import { useUIState, useAIState } from 'ai/rsc';
import { MapToggleProvider, useMapToggle, MapToggleEnum } from './map-toggle-context';
import { MapToggle } from './map-toggle';

type ChatProps = {
  id?: string;
};

export function Chat({ id }: ChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [messages, setMessages] = useUIState();
  const [aiState] = useAIState();
  const { mapType } = useMapToggle();

  useEffect(() => {
    if (!path.includes('search') && messages.length === 1) {
      window.history.replaceState({}, '', `/search/${id}`);
    }
  }, [id, path, messages]);

  useEffect(() => {
    if (aiState.messages[aiState.messages.length - 1]?.type === 'followup') {
      // Refresh the page to chat history updates
      router.refresh();
    }
  }, [aiState, router]);

  return (
    <MapToggleProvider>
      <div className="flex justify-start items-start">
        <div className="w-1/2 flex flex-col space-y-3 md:space-y-4 px-8 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24">
          <ChatMessages messages={messages} />
          <ChatPanel messages={messages} />
        </div>
        <div className="w-1/2 p-4 fixed h-[calc(100vh-0.5in)] top-0 right-0 mt-[0.5in]">
          {(() => {
            switch (mapType) {
              case MapToggleEnum.RealTimeMode:
                return <Mapbox />;
              case MapToggleEnum.MapBox:
                return <Mapbox />;
              case MapToggleEnum.EarthEngine:
                return <EarthEngine />;
              default:
                return <Mapbox />;
            }
          })()}
        </div>
      </div>
    </MapToggleProvider>
  );
}