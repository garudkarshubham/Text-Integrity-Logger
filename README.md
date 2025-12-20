# Text Integrity Logger

A Generic Hash Checker built with Next.js 15, TypeScript, Tailwind CSS, and Prisma (MongoDB).

## Features
- **Integrity Logging**: Stores raw text and its SHA-256 hash.
- **Verification**: Recomputes the hash of stored text to detect tampering.
- **Tamper Simulation**: Admin-only feature to simulate data corruption (modifies text without updating hash).
- **Immutability**: Entries cannot be edited, only deleted.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB (via Prisma ORM)
- **Hashing**: Node.js `crypto` (SHA-256)
- **Validation**: Zod (Server-side)

## Getting Started

### 1. Clone & Install
```bash
git clone <repo>
cd text-integrity-logger
npm install
```

### 2. Environment Variables
Create a `.env` file in the root:
```env
# MongoDB Connection String
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

# Session Secret (for cookie signing)
SESSION_SECRET="complex-random-string-at-least-32-chars"
```

### 3. Run Locally
```bash
npx prisma generate
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Data Model
**Entry**:
- `id`: MongoDB ObjectID
- `text`: Raw text (max 10,000 chars)
- `hash`: SHA-256 fingerprint
- `textLength`: Byte length of text
- `createdAt`: Timestamp

## How Hashing Works
1.  Digital Fingerprint: Hashing turns any data (text, files, passwords) into a unique, fixed-length string of characters.

2. One-Way: It is a mathematical process that cannot be reversed to reveal the  original input.

3. Tamper Proof: Changing even a single character in the input results in a completely different hash, making it perfect for verifying data integrity.

4.  **Integrity Check**:
    - Fetches the current text from the DB.
    - Recomputes the SHA-256 hash.
    - Compares it to the stored `hash`.
    - Returns **Checked** or **Changed**.

### Tamper Demo
A "Simulate Tamper" button allows modifying the text *without* updating the hash. This mimics a database intrusion or bit rot.

- **Security**: Protected by Admin Role. The `tamperEntry` server action strictly enforces `user.role === 'ADMIN'` verification on the server side before allowing any changes, and the "Tamper" button is conditionally rendered only for authenticated admins in the UI.

## User & Admin Setup
Since there is no public registration for Admins, follow these steps:

1.  **Create a User**: Open the app and sign up via the Login page.
2.  **Make Admin**: Run the promotion script in your terminal:
    ```bash
    npx tsx scripts/promote-user.ts <email>
    ```

## Future Improvements
- **Audit Logs**: Track who checked verification multiple times.
- **Merkle Tree**: For checking integrity of the entire dataset.

