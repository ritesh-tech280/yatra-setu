import { NextResponse } from "next/server";
import { getDbYatraById, updateDbYatra, deleteDbYatra } from "@/lib/firebase/serverDb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const yatra = await getDbYatraById(id);
    if (!yatra) {
      return NextResponse.json({ error: "Yatra not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: yatra });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch yatra" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const updated = await updateDbYatra(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Yatra not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update yatra" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDbYatra(id);
    return NextResponse.json({ success: true, message: "Yatra deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete yatra" }, { status: 500 });
  }
}
