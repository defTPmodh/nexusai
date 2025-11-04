import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

const handler = handleAuth();

export async function GET(request: NextRequest, context: any) {
  return handler(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return handler(request, context);
}
