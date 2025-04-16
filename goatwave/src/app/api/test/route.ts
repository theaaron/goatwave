import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API route is working!' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST request received', 
      receivedData: body 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
  }
} 