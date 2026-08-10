import { NextResponse } from "next/server";
import { getDbYatras, createDbYatra } from "@/lib/firebase/serverDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const yatras = await getDbYatras(userId);
    return NextResponse.json({ success: true, data: yatras });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch yatras" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startPlace, destination, startDate, endDate, fare, organizerId, organizerName, description, sahayakIds } = body;

    if (!name || !startPlace || !destination || !fare) {
      return NextResponse.json({ error: "Name, route, and fare are required." }, { status: 400 });
    }

    const newYatra = await createDbYatra({
      name: name.trim(),
      startPlace: startPlace.trim(),
      destination: destination.trim(),
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date().toISOString().split("T")[0],
      fare: Number(fare),
      organizerId: organizerId || "organizer",
      organizerName: organizerName || "Organizer",
      description: description || "",
      sahayakIds: sahayakIds || [],
    });

    return NextResponse.json({ success: true, data: newYatra }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create yatra" }, { status: 500 });
  }
}
