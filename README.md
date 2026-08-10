# Trip/Event Management System

A simple and practical **group trip management web application** built to help organizers manage participants, payments, expenses, and financial reports in one place.

The application is designed to work for different types of group trips and events rather than being limited to a specific type of journey.

## Features

### 👥 Trip & Participant Management

* Create and manage trips
* Add participants to a trip
* Update participant information
* Track participant payment status
* Manage participant contributions

### 💳 Payment Management

* Record participant payments
* Support partial payments
* Track remaining balances
* View total amount collected
* Identify pending payments

### 💰 Expense Management

* Record trip expenses
* Add expense categories such as:

  * Food
  * Fuel
  * Transportation
  * Accommodation
  * Entertainment
  * Other expenses
* Track total trip expenses
* Maintain a clear financial record

### 📊 Financial Reports

View an overall financial summary including:

* Total participants
* Total expected amount
* Total amount collected
* Total pending amount
* Total expenses
* Remaining balance

Reports can be used to understand the complete financial status of a trip.

### 🔐 Authentication & Access Control

The application uses Firebase Authentication and supports role-based access.

* **Owner** — Full control over the trip
* **Co-organizer** — Access to permitted trip management operations
* Secure invitation-based access for co-organizers
* Co-organizers use their own accounts instead of sharing the owner's login

### ✉️ Co-organizer Invitations

An owner can select an existing participant and invite them to become a co-organizer.

The invitation flow:

```text
Owner
  ↓
Select Participant
  ↓
Invite as Co-organizer
  ↓
Invitation sent
  ↓
Participant accepts invitation
  ↓
Login / Create Account
  ↓
Co-organizer access granted
```

### 🗂️ Data Management

Trip-related data is organized using Firestore:

```text
trips/{tripId}
    ├── participants/{participantId}
    ├── payments/{paymentId}
    ├── expenses/{expenseId}
    └── team/{uid}
```

## Tech Stack

### Frontend

* React
* Next.js
* TypeScript
* Tailwind CSS

### Backend & Database

* Firebase Authentication
* Firebase Firestore
* Firebase Admin SDK
* Next.js API Routes

### Email

* Resend for invitation emails

### Deployment

* Vercel

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_sender_email
```

**Important:** Never commit `.env.local`, Firebase private keys, Resend API keys, or other secrets to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The application should now be running locally.

## Project Structure

A simplified structure of the application:

```text
app/
├── api/
│   └── invitations/
│       ├── send/
│       └── accept/
├── dashboard/
├── trips/
└── ...

components/
├── dashboard/
├── trips/
├── participants/
├── payments/
├── expenses/
└── ...

lib/
├── firebase/
│   ├── admin.ts
│   └── ...
└── invitations/
```

The exact structure may vary as the project evolves.

## Authentication & Authorization

Firebase Authentication is used for user authentication.

Firestore and Firebase Admin SDK are used for secure server-side operations.

The application distinguishes between:

### Owner

The user who created the trip.

The Owner can:

* Manage the trip
* Add and manage participants
* Manage payments
* Manage expenses
* View reports
* Invite co-organizers
* Manage co-organizer access
* Manage trip settings

### Co-organizer

A participant who has been granted additional access by the Owner.

A co-organizer can perform only the operations permitted by the application's access-control rules.

Co-organizers use their **own Firebase Authentication account** and never share the Owner's credentials.

## Financial Flow

The application supports partial and complete payments.

For example:

```text
Trip Fee: ₹2,000

Participant A → ₹2,000 paid → Fully Paid
Participant B → ₹1,500 paid → ₹500 remaining
Participant C → ₹0 paid → ₹2,000 remaining
```

The system calculates:

```text
Total Expected
      ↓
Total Collected
      ↓
Total Pending
      ↓
Total Expenses
      ↓
Remaining Balance
```

## Deployment

The application can be deployed using Vercel.

Before deploying, configure all required environment variables in the Vercel project settings.

Then build the application:

```bash
npm run build
```

To deploy using Vercel CLI:

```bash
npm install -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```

## Security

* Firebase Authentication is used for user authentication.
* Server-side Firebase Admin SDK is used for privileged operations.
* Sensitive environment variables must remain server-side.
* Role-based access should be enforced through Firestore Security Rules and server-side authorization, not only through frontend UI restrictions.
* Never expose Firebase Admin private keys or Resend API keys in client-side code.

## Future Improvements

Potential improvements include:

* WhatsApp payment reminders
* Automated payment reminders
* Expense receipt uploads
* PDF financial reports
* Advanced analytics
* Participant import/export
* Multiple currencies
* Trip templates
* Expense approval workflow
* Activity/audit logs
* Mobile PWA improvements

## License

This project is currently for personal/educational and development purposes.

Add an appropriate open-source license here if the project is later released publicly.
