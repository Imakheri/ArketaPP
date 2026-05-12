import { NextResponse } from "next/server";
import { bookClass } from "@/lib/store";

export async function POST(req: Request) {
  const { classId, userId } = await req.json();
  try {
    const cls = await bookClass(classId, userId);
    return NextResponse.json({ class: cls });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
