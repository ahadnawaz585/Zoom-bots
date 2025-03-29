// app/api/zoom/route.ts
import { NextResponse } from 'next/server';
import { runMultipleBots } from '@/lib/zoom/zoom';

export async function POST(request: Request) {
  try {
    const { meetingId, password, quantity, duration, botNames } = await request.json();

    if (!botNames || botNames.length !== quantity) {
      return NextResponse.json({ success: false, message: 'Invalid bot names' }, { status: 400 });
    }

    const botStatuses: Record<number, string> = {};

    const results = await runMultipleBots(
      quantity,
      meetingId,
      password,
      duration,
      botNames,
      (botId, status) => {
        botStatuses[botId] = status;
      }
    );

    const success = Object.values(results).every(status => status);
    
    return NextResponse.json({
      success,
      message: success ? 'Bots joined successfully' : 'Some bots failed to join',
      initialStatuses: Object.entries(botStatuses).map(([id, status]) => ({
        id: parseInt(id),
        status,
      })),
    });
  } catch (error) {
    console.error('Failed to start bots:', error);
    return NextResponse.json({ success: false, message: 'Failed to start bots' }, { status: 500 });
  }
}