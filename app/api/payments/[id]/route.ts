import { NextResponse } from "next/server";
import { deleteDbPayment } from "@/lib/firebase/serverDb";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDbPayment(id);
    return NextResponse.json({ success: true, message: "Payment removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete payment" }, { status: 500 });
  }
}
