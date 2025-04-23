import { notFound } from 'next/navigation';
import { Chat } from '@/components/chat';
import { getSharedChat } from '@/lib/actions/chat';
import { AI } from '@/app/actions';

export interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params; // Unwrap the Promise to get the id
  const chat = await getSharedChat(id);

  if (!chat || !chat.sharePath) {
    return {
      title: 'Not Found', // Fallback title for metadata
    };
  }

  return {
    title: chat.title.toString().slice(0, 50) || 'Search',
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params; // Unwrap the Promise to get the id
  const chat = await getSharedChat(id);

  if (!chat || !chat.sharePath) {
    notFound();
  }

  return (
    <AI
      initialAIState={{
        chatId: chat.id,
        messages: chat.messages,
        isSharePage: true,
      }}
    >
      <Chat id={id} />
    </AI>
  );
}