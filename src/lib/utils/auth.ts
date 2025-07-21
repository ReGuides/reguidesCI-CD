import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function getTokenFromRequest(request: NextRequest): string | null {
  return (
    request.cookies.get('adminToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

export function verifyRequestAuth(request: NextRequest, allowedRoles: string[] = ['admin']) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  let user: any;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  return user;
} 