import { NextRequest, NextResponse } from "next/server";
import { setTimeout } from "timers/promises";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id?: string }> }
) {
    const param = await params;
    const id = param.id ? `${param.id}` : '';

    await setTimeout(5000,);

    if (!id) {
        return NextResponse.error();
    }

    if (id === '1') {
        return NextResponse.json({ name: "tulio", email: "tulio@example.com" }, { status: 200 });
    }

    return NextResponse.json({ name: "John Doe", email: "john.doe@example.com" }, { status: 200 });
}