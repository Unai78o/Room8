import { register, collectDefaultMetrics } from 'prom-client';
import { NextResponse } from 'next/server';

collectDefaultMetrics();

export async function GET() {
    return new NextResponse(await register.metrics(), {
        headers: { 'Content-Type': register.contentType },
    });
}