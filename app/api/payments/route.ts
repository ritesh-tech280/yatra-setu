import { NextResponse } from "next/server";
import { getDbPayments, createDbPayment, getDbYatraById } from "@/lib/firebase/serverDb";
import { validatePaymentAmount } from "@/lib/calculations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yatraId = searchParams.get("yatraId");
    if (!yatraId) {
      return NextResponse.json({ error: "yatraId is required" }, { status: 400 });
    }
    const payments = await getDbPayments(yatraId);
    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { yatraId, memberId, amount, paymentMethod, paymentDate, note, createdBy, createdByName } = body;

    const numAmount = Number(amount);
    if (!yatraId || !memberId || !numAmount || numAmount <= 0) {
      return NextResponse.json({ error: "Valid yatraId, memberId, and positive amount are required." }, { status: 400 });
    }

    const yatra = await getDbYatraById(yatraId);
    const currentPayments = await getDbPayments(yatraId);
    const fare = yatra?.fare || 2000;

    // Strict validation
    const validation = validatePaymentAmount(memberId, numAmount, currentPayments, fare);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || "Payment amount exceeds remaining fare." }, { status: 400 });
    }

    const payment = await createDbPayment({
      yatraId,
      memberId,
      amount: numAmount,
      paymentMethod: paymentMethod || "Cash",
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      note: note?.trim() || "",
      createdBy: createdBy || "organizer",
      createdByName: createdByName || "Organizer",
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to record payment" }, { status: 500 });
  }
}
