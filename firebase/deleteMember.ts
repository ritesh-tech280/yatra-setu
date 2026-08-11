import { deleteMemberFromDb } from "@/lib/firebase/firestoreService";

/** Calls the Firebase Firestore service to delete a member and unlinked payments */
export async function deleteMember(yatraId: string, memberId: string): Promise<void> {
  return deleteMemberFromDb(yatraId, memberId);
}
