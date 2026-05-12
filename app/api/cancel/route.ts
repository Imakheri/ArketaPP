import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/store";

export async function POST(req: Request) {
  const { classId, userId } = await req.json();
  try {
    const result = await cancelBooking(classId, userId);
    return NextResponse.json({ class: result.class, promotedUserId: result.promotedUserId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cancel failed.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}