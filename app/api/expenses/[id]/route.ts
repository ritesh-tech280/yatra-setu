import { NextResponse } from "next/server";
import { updateDbExpense, deleteDbExpense } from "@/lib/firebase/serverDb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const updated = await updateDbExpense(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDbExpense(id);
    return NextResponse.json({ success: true, message: "Expense removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete expense" }, { status: 500 });
  }
}
