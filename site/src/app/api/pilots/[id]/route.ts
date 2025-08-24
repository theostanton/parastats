import { NextRequest, NextResponse } from 'next/server';
import { get } from '@database/pilots';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid pilot ID' }, { status: 400 });
    }

    const [pilot, error] = await get(id);
    
    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json(pilot);
  } catch (error) {
    console.error('Error fetching pilot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}