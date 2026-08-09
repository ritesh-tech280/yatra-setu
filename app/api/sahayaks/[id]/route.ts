import { NextResponse } from "next/server";
import { deleteDbSahayak } from "@/lib/firebase/serverDb";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDbSahayak(id);
    return NextResponse.json({ success: true, message: "Sahayak removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete sahayak" }, { status: 500 });
  }
}
