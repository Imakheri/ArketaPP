import { NextResponse } from "next/server";
import { joinWaitlist, leaveWaitlist } from "@/lib/store";

export async function POST(req: Request) {
  const { classId, userId } = await req.json();
  try {
    const cls = await joinWaitlist(classId, userId);
    return NextResponse.json({ class: cls });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not join waitlist.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(req: Request) {
  const { classId, userId } = await req.json();
  try {
    const cls = await leaveWaitlist(classId, userId);
    return NextResponse.json({ class: cls });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not leave waitlist.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
