import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    success: true, 
    message: 'Test POST endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function DELETE() {
  return NextResponse.json({ 
    success: true, 
    message: 'Test DELETE endpoint working',
    timestamp: new Date().toISOString()
  });
}
