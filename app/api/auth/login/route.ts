import { NextResponse } from "next/server";
import { findDbUserByEmail } from "@/lib/firebase/serverDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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
