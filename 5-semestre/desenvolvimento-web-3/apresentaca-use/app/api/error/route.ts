import { NextRequest, NextResponse } from "next/server";
import { setTimeout } from "timers/promises";


export async function GET() {
    
    await setTimeout(5000);
    return NextResponse.error();
}