import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AdminJwtPayload } from '@/app/admin/AdminAuthContext';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret-key-change-in-production';

export function getTokenFromRequest(request: NextRequest): string | null {
  return (
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

export function verifyRequestAuth(request: NextRequest, allowedRoles: string[] = ['admin']) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  let user: AdminJwtPayload;
  try {
    user = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
  } catch {
    throw new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  
  return user;
} 