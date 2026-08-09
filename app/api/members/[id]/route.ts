import { NextResponse } from "next/server";
import { updateDbMember, deleteDbMember } from "@/lib/firebase/serverDb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const updated = await updateDbMember(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDbMember(id);
    return NextResponse.json({ success: true, message: "Member deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete member" }, { status: 500 });
  }
}
