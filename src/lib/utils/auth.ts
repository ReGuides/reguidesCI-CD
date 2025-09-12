import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { AdminJwtPayload } from '@/app/admin/AdminAuthContext';
import { addServerLog } from '@/lib/serverLog';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret-key-change-in-production';

export function getTokenFromRequest(request: NextRequest): string | null {
  const accessToken = request.cookies.get('accessToken')?.value;
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  
  addServerLog('debug', 'Auth token check', 'auth-utils', {
    hasAccessToken: !!accessToken,
    hasAuthHeader: !!authHeader,
    allCookies: request.cookies.getAll().map(c => c.name),
    url: request.url
  });
  
  return accessToken || authHeader || null;
}

export function verifyRequestAuth(request: NextRequest, allowedRoles: string[] = ['admin']) {
  const token = getTokenFromRequest(request);
  if (!token) {
    addServerLog('warn', 'No token provided for auth verification', 'auth-utils', {
      url: request.url,
      allowedRoles
    });
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  let user: AdminJwtPayload;
  try {
    user = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    addServerLog('debug', 'Token verified successfully', 'auth-utils', {
      userId: user.id,
      role: user.role,
      allowedRoles,
      url: request.url
    });
  } catch (error) {
    addServerLog('error', 'Token verification failed', 'auth-utils', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url
    });
    throw new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }
  
  if (!allowedRoles.includes(user.role)) {
    addServerLog('warn', 'User role not allowed', 'auth-utils', {
      userId: user.id,
      userRole: user.role,
      allowedRoles,
      url: request.url
    });
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  
  return user;
} 