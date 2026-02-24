import { NextRequest, NextResponse } from "next/server";
import { LoginRequestBody } from "@/common/interfaces";



export async function POST(request: NextRequest) {
    const { username, password }: LoginRequestBody = await request.json();

    if (username === 'admin' && password === 'password') {
        return NextResponse.json({ message: 'Login successful', authToken: 'auth-token-123456789', username: username }, { status: 201 });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}

export async function GET(request: NextRequest) {
    const params = request.headers.get("Authorization");
    if (!params) {
        return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Good Token' }, { status: 200 });
}