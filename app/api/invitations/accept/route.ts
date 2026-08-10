import { NextResponse } from "next/server";
import { adminAuth, adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getDbInvitationByToken, createDbSahayak } from "@/lib/firebase/serverDb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      invitationToken?: string;
      token?: string;
      uid?: string;
      name?: string;
      email?: string;
      phone?: string;
    };

    const inviteToken = body.invitationToken || body.token;
    if (!inviteToken) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    let userUid = body.uid;
    let userEmail = body.email;
    let userName = body.name;

    // Verify token from header if available
    const authHeader = request.headers.get("authorization");
    if (isFirebaseAdminConfigured && adminAuth && authHeader) {
      const idToken = authHeader.replace(/^Bearer\s+/i, "");
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        userUid = decoded.uid;
        userEmail = decoded.email || userEmail;
      } catch (authErr) {
        console.warn("Id token verification fallback:", authErr);
      }
    }

    if (!userUid) {
      return NextResponse.json(
        { error: "User UID is required to accept this invitation." },
        { status: 401 }
      );
    }

    const invitation = await getDbInvitationByToken(inviteToken);
    if (!invitation) {
      return NextResponse.json(
        { error: "This invitation link is invalid or has expired." },
        { status: 404 }
      );
    }

    if (invitation.status === "accepted" && invitation.acceptedByUid === userUid) {
      return NextResponse.json({
        success: true,
        message: "Invitation was already accepted.",
        yatraId: invitation.yatraId,
      });
    }

    // Add user as Sahayak staff to the Yatra
    const sahayak = await createDbSahayak({
      yatraId: invitation.yatraId,
      uid: userUid,
      name: userName || invitation.name,
      email: userEmail || invitation.email,
      phone: body.phone || invitation.phone,
      memberId: invitation.memberId,
      role: "sahayak",
      status: "active",
      addedBy: invitation.invitedBy || "organizer",
    });

    invitation.status = "accepted";
    invitation.acceptedAt = new Date().toISOString();
    invitation.acceptedByUid = userUid;

    // If Admin DB is configured, write batch updates
    if (isFirebaseAdminConfigured && adminDb) {
      try {
        const batch = adminDb.batch();
        batch.set(
          adminDb.doc(`yatras/${invitation.yatraId}/staff/${userUid}`),
          {
            uid: userUid,
            role: "sahayak",
            memberId: invitation.memberId || null,
            status: "active",
            name: userName || invitation.name || "",
            email: userEmail || invitation.email || "",
            createdAt: new Date(),
            joinedAt: new Date(),
          }
        );
        batch.update(adminDb.doc(`yatras/${invitation.yatraId}/invitations/${invitation.id}`), {
          status: "accepted",
          acceptedAt: new Date(),
          acceptedBy: userUid,
        });
        await batch.commit();
      } catch (adminErr) {
        console.warn("Admin Firestore batch note:", adminErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted! You are now a Sahayak for this Yatra.",
      yatraId: invitation.yatraId,
      sahayak,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not accept invitation.",
      },
      { status: 500 }
    );
  }
}
