import { NextResponse } from "next/server";
import { joinWaitlist, leaveWaitlist } from "@/lib/store";

export async function POST(req: Request) {
  const { classId, userId } = await req.json();

  const updated = await joinWaitlist(classId, userId);
  if (!updated) {
    return NextResponse.json({ error: "Could not join waitlist" }, { status: 409 });
  }
  return NextResponse.json({ class: updated });
}

export async function DELETE(req: Request) {
  const { classId, userId } = await req.json();

  const updated = await leaveWaitlist(classId, userId);
  if (!updated) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }
  return NextResponse.json({ class: updated });
}