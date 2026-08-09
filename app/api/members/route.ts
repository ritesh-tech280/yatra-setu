import { NextResponse } from "next/server";
import { getDbMembers, createDbMember } from "@/lib/firebase/serverDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yatraId = searchParams.get("yatraId");
    if (!yatraId) {
      return NextResponse.json({ error: "yatraId is required" }, { status: 400 });
    }
    const members = await getDbMembers(yatraId);
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { yatraId, name, phone, address, notes } = body;

    if (!yatraId || !name || !phone) {
      return NextResponse.json({ error: "yatraId, name, and phone are required" }, { status: 400 });
    }

    const member = await createDbMember({
      yatraId,
      name: name.trim(),
      phone: phone.trim(),
      address: address?.trim() || "",
      notes: notes?.trim() || "",
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create member" }, { status: 500 });
  }
}
