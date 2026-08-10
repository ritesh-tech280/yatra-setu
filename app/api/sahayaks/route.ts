import { NextResponse } from "next/server";
import { getDbSahayaks, createDbSahayak } from "@/lib/firebase/serverDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yatraId = searchParams.get("yatraId");
    if (!yatraId) {
      return NextResponse.json({ error: "yatraId is required" }, { status: 400 });
    }
    const sahayaks = await getDbSahayaks(yatraId);
    return NextResponse.json({ success: true, data: sahayaks });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch sahayaks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { yatraId, name, phone, email, addedBy } = body;

    if (!yatraId || !name || !phone) {
      return NextResponse.json({ error: "yatraId, name, and phone are required" }, { status: 400 });
    }

    const sahayak = await createDbSahayak({
      yatraId,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      role: "sahayak",
      addedBy: addedBy || "organizer",
    });

    return NextResponse.json({ success: true, data: sahayak }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to assign sahayak" }, { status: 500 });
  }
}
