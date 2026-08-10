import { NextResponse } from "next/server";
import { adminAuth, adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import {
  getDbInvitations,
  createDbInvitation,
  getDbInvitationByToken,
  getDbYatraById,
} from "@/lib/firebase/serverDb";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char] || char);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yatraId = searchParams.get("yatraId");
    const token = searchParams.get("token");

    if (token) {
      const invite = await getDbInvitationByToken(token);
      if (!invite) {
        return NextResponse.json(
          { error: "Invitation not found or has expired." },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: invite });
    }

    if (!yatraId) {
      return NextResponse.json(
        { error: "yatraId or token parameter is required." },
        { status: 400 }
      );
    }

    const invitations = await getDbInvitations(yatraId);
    return NextResponse.json({ success: true, data: invitations });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch invitations.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      yatraId?: string;
      email?: string;
      name?: string;
      phone?: string;
      memberId?: string;
      organizerName?: string;
      yatraName?: string;
    };

    const yatraId = body.yatraId?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!yatraId || !email) {
      return NextResponse.json(
        { error: "yatraId and email are required." },
        { status: 400 }
      );
    }

    let callerUid = "organizer";

    // If Firebase Admin and Auth header present, verify token
    const authHeader = request.headers.get("authorization");
    if (isFirebaseAdminConfigured && adminAuth && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "");
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        callerUid = decoded.uid;
      } catch (authErr) {
        console.warn("Token verification note:", authErr);
      }
    }

    // Get Yatra details
    const yatra = await getDbYatraById(yatraId);
    const yatraName = body.yatraName || yatra?.name || "Kanwar Yatra";
    const organizerName = body.organizerName || yatra?.organizerName || "Yatra Organizer";

    // Create the invitation
    const invitation = await createDbInvitation({
      yatraId,
      yatraName,
      organizerName,
      email,
      name: body.name?.trim(),
      phone: body.phone?.trim(),
      memberId: body.memberId,
      invitedBy: callerUid,
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      new URL(request.url).origin ||
      "http://localhost:3000";
    const inviteUrl = `${origin}/invite/${invitation.token}`;

    // Optional email dispatch via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
    let emailSent = false;
    let emailError: string | undefined = undefined;

    if (resendKey && from) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [email],
            subject: `Invitation to join ${yatraName} as a Sahayak (Co-Organizer)`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #ea580c; margin-top: 0;">YatraSetu Co-Organizer Invitation</h2>
                <p>Hello <strong>${escapeHtml(body.name || email)}</strong>,</p>
                <p><strong>${escapeHtml(organizerName)}</strong> has invited you to help manage <strong>${escapeHtml(yatraName)}</strong> as a Co-Organizer (Sahayak).</p>
                <p>As a Sahayak, you can record payments, track group expenses, and view member balances in real time.</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${inviteUrl}" style="background: #f97316; color: #020617; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Accept Invitation &amp; Open Dashboard
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">Or copy this link: <a href="${inviteUrl}">${inviteUrl}</a></p>
              </div>
            `,
          }),
        });

        const resData = await response.json().catch(() => ({}));
        if (response.ok) {
          emailSent = true;
        } else {
          emailError = resData.message || `Resend error (${response.status})`;
          console.warn("Resend email dispatch note:", emailError);
        }
      } catch (sendErr) {
        emailError = sendErr instanceof Error ? sendErr.message : "Failed to connect to email provider";
        console.warn("Resend email dispatch warning:", sendErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? `Invitation email delivered to ${email}.`
          : "Invitation created. You can share the direct invite link.",
        data: invitation,
        inviteUrl,
        emailSent,
        emailError,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not send invitation.",
      },
      { status: 500 }
    );
  }
}
