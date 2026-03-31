import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const token = request.headers.get("Authorization");
    if(!token) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    return NextResponse.json({ message: token }, { status: 200 });
}