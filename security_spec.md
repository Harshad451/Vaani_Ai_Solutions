# Security Specification

## 1. Data Invariants
- An agent profile can only be written if the logged-in user's UID matches the profile document ID.
- Global settings must stay within secure parameters (e.g., SLA timers must be positive, company details must be valid strings).
- Tickets can only be created or modified by authenticated, verified support agents.
- Message content is strictly limited in size to prevent memory or billing fatigue.

## 2. The "Dirty Dozen" Security Violations
The following malicious requests must always return `PERMISSION_DENIED`:
1. Creating a ticket without authentication.
2. An anonymous user reading user profile PII fields.
3. Reading another agent's private profile block.
4. Setting administrative/role states on self registration.
5. Updating a ticket status to an invalid value.
6. Triggering a 1MB string into a ticket ID field.
7. Deleting settings files without a verified email status.
8. Writing an invalid SLA duration (e.g. negative or > 24 hours).
9. Modifying the `createdAt` timestamp during an update.
10. Setting a message's sender to `SYSTEM` from an unverified client.
11. Reading the global business configuration with no account.
12. Attempting a SQL-injection style characters key update in document IDs.

## 3. Testing Verification
Our `firestore.rules` blocks all these invalid state transitions by demanding `isValidTicket`, `isValidMessage` and `isValidSettings` schemas on all write types.
