import type { Member } from "@/types/yatra";
import { saveMember } from "@/lib/firebase/firestoreService";

/** Calls the Firebase Firestore service to save a new member */
export async function createMember(input: Omit<Member, "id" | "createdAt">): Promise<Member> {
  return saveMember(input);
}
