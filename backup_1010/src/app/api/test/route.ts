import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ 
    success: true,
    message: "Test API working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function POST() {
  return NextResponse.json({ 
    success: true,
    message: "Test POST API working",
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
