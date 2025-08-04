import { NextRequest, NextResponse } from 'next/server';
import { Sites } from '@database/Sites';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    
    const [site, error] = await Sites.getForSlug(slug);
    
    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}