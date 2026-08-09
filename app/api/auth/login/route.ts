import { NextResponse } from "next/server";
import { findDbUserByEmail } from "@/lib/firebase/serverDb";
import { DEMO_ORGANIZER, DEMO_SAHAYAK } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Demo user shortcuts
    if (email.includes("adhyaksh") || email === "adhyaksh@kanwaryatra.org") {
      return NextResponse.json({ success: true, user: DEMO_ORGANIZER });
    }
    if (email.includes("sahayak") || email === "sahayak@kanwaryatra.org") {
      return NextResponse.json({ success: true, user: DEMO_SAHAYAK });
    }

    const user = await findDbUserByEmail(email);
    if (!user) {
      // Auto-create user profile for rapid onboarding
      const newUser = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0].toUpperCase(),
        email,
        role: "organizer" as const,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 500 });
  }
}
