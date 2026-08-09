import { NextResponse } from "next/server";
import { getDbExpenses, createDbExpense } from "@/lib/firebase/serverDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yatraId = searchParams.get("yatraId");
    if (!yatraId) {
      return NextResponse.json({ error: "yatraId is required" }, { status: 400 });
    }
    const expenses = await getDbExpenses(yatraId);
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { yatraId, category, amount, expenseDate, paidBy, description, createdBy } = body;

    const numAmount = Number(amount);
    if (!yatraId || !category || !numAmount || numAmount <= 0 || !paidBy?.trim()) {
      return NextResponse.json({ error: "yatraId, category, positive amount, and paidBy are required." }, { status: 400 });
    }

    const expense = await createDbExpense({
      yatraId,
      category,
      amount: numAmount,
      expenseDate: expenseDate || new Date().toISOString().split("T")[0],
      paidBy: paidBy.trim(),
      description: description?.trim() || "",
      createdBy: createdBy || "org-1",
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to record expense" }, { status: 500 });
  }
}
