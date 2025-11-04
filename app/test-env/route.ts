import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAUTH0_SECRET: !!process.env.AUTH0_SECRET,
    AUTH0_SECRET_length: process.env.AUTH0_SECRET?.length || 0,
    hasAUTH0_BASE_URL: !!process.env.AUTH0_BASE_URL,
    hasAUTH0_ISSUER_BASE_URL: !!process.env.AUTH0_ISSUER_BASE_URL,
    hasAUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
    hasAUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
  });
}

