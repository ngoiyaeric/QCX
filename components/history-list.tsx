import React, { cache } from 'react';
import HistoryItem from './history-item';
import { ClearHistory } from './clear-history';
import { getChats } from '@/lib/actions/chat';

// Define the type for the chat data returned by getChats
type ChatData = {
  userId: string;
  id: string;
  title: string;
  createdAt: Date;
  visibility: string | null;
};

// Define the Chat type expected by HistoryItem
type Chat = {
  userId: string;
  id: string;
  title: string;
  createdAt: Date;
  visibility: string | null;
  path: string;
};

type HistoryListProps = {
  userId?: string;
};

const loadChats = cache(async (userId?: string): Promise<ChatData[] | null> => {
  return await getChats(userId);
});

export async function HistoryList({ userId }: HistoryListProps) {
  try {
    const chats = await loadChats(userId);

    if (!chats) {
      return (
        <div className="flex flex-col flex-1 space-y-3 h-full">
          <div className="text-foreground/30 text-sm text-center py-4">
            Failed to load search history
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 space-y-3 h-full">
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {!chats.length ? (
            <div className="text-foreground/30 text-sm text-center py-4">
              No search history
            </div>
          ) : (
            chats.map((chat: ChatData) => (
              <HistoryItem
                key={chat.id}
                chat={{
                  ...chat,
                  path: '', // Provide default or derived value
                }}
              />
            ))
          )}
        </div>
        <div className="mt-auto">
          <ClearHistory empty={!chats.length} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load chats:', error);
    return (
      <div className="flex flex-col flex-1 space-y-3 h-full">
        <div className="text-foreground/30 text-sm text-center py-4">
          Error loading search history
        </div>
      </div>
    );
  }
}
