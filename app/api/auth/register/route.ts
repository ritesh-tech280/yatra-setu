import { NextResponse } from "next/server";
import { createDbUser } from "@/lib/firebase/serverDb";
import type { UserProfile, UserRole } from "@/types/yatra";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      role: (role as UserRole) || "organizer",
      createdAt: new Date().toISOString(),
    };

    const savedUser = await createDbUser(newUser);
    return NextResponse.json({ success: true, user: savedUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Registration failed" }, { status: 500 });
  }
}
