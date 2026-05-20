import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { setTimeout } from "timers/promises";


export async function GET() {

    const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
    const surnames = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
    const domain = ["example.com", "test.com", "demo.com", "sample.com", "fake.com"];

    await setTimeout(5000);
    
    const users: User[] = Array.from({ length: 10 }, (_, i) => ({
        id: randomUUID(),
        name: `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`,
        email: `${names[Math.floor(Math.random() * names.length)].toLowerCase()}.${surnames[Math.floor(Math.random() * surnames.length)].toLowerCase()}@${domain[Math.floor(Math.random() * domain.length)]}`
    }));

    return NextResponse.json(users, {status: 200});
}