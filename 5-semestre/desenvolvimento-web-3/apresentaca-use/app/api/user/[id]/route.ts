import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ id?: string }> }
) {
    const id = await params;

    if (id?.id) {
         if(id.id === '2'){
            return NextResponse.error();
        }
        return NextResponse.json({name: "tulio", email: "tulio@example.com"}, {status: 200});
    }
    return NextResponse.json({name: "John Doe", email: "john.doe@example.com"}, {status: 200});
}