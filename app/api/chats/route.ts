import { NextResponse, NextRequest } from 'next/server';
import { getChatsPage } from '@/lib/actions/chat-db';
import { getCurrentUserId } from '@/lib/auth/get-current-user';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getChatsPage(userId, limit, offset);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching chats' }, { status: 500 });
  }
}
