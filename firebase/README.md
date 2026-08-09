# Firebase REST integration

The browser UI must call `/api/*` endpoints only. Those endpoints authenticate the user and call Firebase Admin / Firestore, keeping credentials and business rules off the client.

Add Firebase project values to `.env.local` (never commit them):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Create one operation per file in this directory (for example `createMember.ts`, `createPayment.ts`, and `createExpense.ts`).
