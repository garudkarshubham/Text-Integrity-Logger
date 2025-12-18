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

# Secret Key for Tamper Feature
TAMPER_SECRET_KEY="demo-secret-key"
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

## How It Works
1.  **Hashing**: When an entry is saved, the raw text is hashed using `crypto.createHash('sha256').update(text).digest('hex')`. No normalization is performed.
2.  **Integrity Check**:
    - Fetches the current text from the DB.
    - Recomputes the SHA-256 hash.
    - Compares it to the stored `hash`.
    - Returns **Match** or **Changed**.

### Tamper Demo (Option A)
A "Simulate Tamper" button allows modifying the text *without* updating the hash. This mimics a database intrusion or bit rot.
- **Security**: Protected by `TAMPER_SECRET_KEY`.

## Future Improvements
- **Audit Logs**: Track who checked verification multiple times.
- **Merkle Tree**: For checking integrity of the entire dataset.
- **Canonicalization**: Optional flag for normalized checks (e.g. ignore whitespace).
