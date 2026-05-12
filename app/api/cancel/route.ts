import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const { classId, userId } = body;

  const result = await cancelBooking(classId, userId);
  if (!result) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }
  return NextResponse.json({ class: result.class, promotedUserId: result.promotedUserId });
}
