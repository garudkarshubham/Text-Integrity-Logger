# Text Integrity Logger: End-to-End User Guide

This guide details the complete workflow of the Text Integrity Logger, demonstrating the system's ability to detect data tampering through cryptographic hashing.

## 1. User Registration & Setup

### Registration
1.  Navigate to the **Register** page (`/register`).
2.  Enter your Email (e.g., `user@example.com`) and Password.
3.  Click **Sign Up**.
4.  *System Action*: Your account is created with a `USER` role.

### Login
1.  Navigate to the **Login** page (`/login`).
2.  Enter your credentials and click **Sign In**.
3.  You will be redirected to the main dashboard.

## 2. Standard User Workflow (Data Integrity)

### Step 1: Create a Secure Entry
1.  On the dashboard, locate the **"New Entry"** form.
2.  Type or paste your sensitive text (e.g., "Contract v1.0: Payment terms net 30").
3.  Click **Create Entry**.
4.  **Verification**:
    *   The entry appears in the list below.
    *   A unique **SHA-256 Hash** (e.g., `a1b2c3...`) is generated and displayed.
    *   Status is initially `Not Checked`.

### Step 2: Verify Integrity (Success Case)
1.  Click on the entry to view details.
2.  Click the **Integrity Check** button.
3.  **Outcome**:
    *   The system re-computes the hash of the stored text.
    *   It compares it against the stored hash.
    *   **Result**: A Green **"Checked"** badge appears. This confirms the data has not been modified since creation.

## 3. Admin Workflow (Tamper Simulation)

To demonstrate the security features, we need to simulate a database breach or "Tampering" event. This capability is restricted to Admins.

### Step 1: Promote User to Admin
*Note: This is done via terminal as there is no public admin signup.*

Run the following command in your terminal project root:
```bash
npx tsx scripts/promote-user.ts user@example.com
```
*Reload the page in your browser. You are now an Admin.*

### Step 2: Simulate Tampering
1.  As a logged-in Admin, return to the entry detail page.
2.  You will now see an orange **Tamper** button (visible only to Admins).
3.  Click **Tamper**.
4.  In the modal, change the text *slightly* (e.g., change "Payment terms net 30" to "Payment terms net 90").
5.  Click **Save & Tamper**.
6.  **Critical Detail**: The system updates the *Text* in the database but intentionally *skips* updating the *Hash*. This creates a mismatch.

## 4. Final Verification (Detection)

Now, we verify if the system can detect the unauthorized change.

1.  Click the **Integrity Check** button again.
2.  **Outcome**:
    *   The system re-hashes the new text ("...net 90").
    *   It compares this new hash against the original hash (from "...net 30").
    *   **Result**: A Red **"Changed"** badge appears.
3.  **Conclusion**: The integrity violation is successfully detected. The hash mismatch proves the document is no longer authentic.
