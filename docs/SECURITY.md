# GistMyMail Security Model & Threat Defense

> Comprehensive overview of security controls, cryptographic storage, prompt injection defenses, and privacy guarantees.

---

## 1. Threat Model & Security Posture

GistMyMail interacts directly with user inboxes containing sensitive academic, personal, and business correspondence. Because emails arrive from arbitrary external senders, **every email is treated as untrusted data**.

| Threat Vector | Potential Impact | GistMyMail Mitigation |
| :--- | :--- | :--- |
| **Indirect Prompt Injection** | Attackers send emails instructing LLM to leak secrets or execute unauthorized commands. | Deterministic pattern scanner quarantines prompt injections; LLM prompt isolates untrusted input. |
| **OAuth Token Exposure** | Stolen database dumps exposing Google OAuth refresh tokens. | Tokens are encrypted at rest using **AES-256-GCM** with unique IVs and authentication tags. |
| **Scope Overprivilege** | Requesting destructive inbox access (delete, modify labels). | Strict principle of least privilege: requests only `gmail.readonly` for intake and `gmail.send` for digest dispatch. |
| **Hallucinated Commitments** | AI invents false deadlines causing users to miss genuine obligations. | **Deterministic Evidence Verifier** purges any deadline not backed by an exact quote in the source text. |
| **Session Hijacking** | Cross-Site Scripting (XSS) stealing user session tokens. | Encrypted, HTTP-only, `SameSite=Lax` cookie sessions with cryptographically random identifiers. |

---

## 2. Cryptographic Token Protection (AES-256-GCM)

All Google OAuth refresh tokens stored in the database are encrypted at rest using Node's native `crypto` module implementing **AES-256-GCM**.

Implementation in [`apps/api/src/security/encryption.ts`](file:///d:/Personal/MY%20LEARNING/MY%20PROJECTS/Gistmymail/apps/api/src/security/encryption.ts):

```typescript
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

export function encryptToken(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Serialized format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

### Key Security Properties:
- **Unique IV Per Record:** A cryptographically random 12-byte initialization vector (IV) is generated for every single encryption operation, preventing ciphertext frequency analysis.
- **Authenticated Encryption:** The 16-byte GCM authentication tag verifies both confidentiality and integrity. Any bit-tampering in the database causes immediate decryption failure.
- **Key Separation:** Encryption keys are stored in `TOKEN_ENCRYPTION_KEY` and never stored alongside the database records.

---

## 3. Prompt Injection Defense & Quarantine Pipeline

External emails can contain hidden instructions crafted to manipulate LLM reasoning.

### Detection Mechanism:
Before and after LLM processing, the email is evaluated against an extensive set of adversarial injection patterns:
- `SYSTEM OVERRIDE` / `SYSTEM PROMPT`
- `IGNORE ALL PREVIOUS INSTRUCTIONS`
- `ASSISTANT DIRECTIVE`
- `REVEAL PASSWORDS` / `EXPORT TOKENS`
- `DROP TABLE` / `DELETE DATABASE`

### Remediation Workflow:
1. **Quarantine Classification:** The email is immediately classified as `needs_clarification`.
2. **Security Warning Tag:** The digest displays a prominent visual indicator: `[Security Warning: Potential Prompt Injection Quarantined]`.
3. **Action Suppression:** Any action item extracted from the injected email is neutralized, preventing automated task creation or malicious URL propagation.

---

## 4. Google OAuth 2.0 Scope Minimization

GistMyMail strictly minimizes permissions requested from Google Cloud:

1. **Intake Scopes:**
   - `openid`, `email`, `profile`: User identity verification.
   - `https://www.googleapis.com/auth/gmail.readonly`: Reading messages and thread snippets.
2. **Delivery Scope (Conditional):**
   - `https://www.googleapis.com/auth/gmail.send`: Only requested when the user explicitly enables email delivery of their daily digest to a destination inbox.
3. **Excluded High-Risk Scopes:**
   - ❌ `https://mail.google.com/` (Full unrestricted mailbox access — NEVER requested)
   - ❌ `gmail.modify` (Modifying, archiving, or deleting messages — NEVER requested)

---

## 5. Security Checklist for Deployments

- [x] Configure a 32-byte cryptographically random `SESSION_SECRET`
- [x] Configure a 32-byte (64 hex characters) `TOKEN_ENCRYPTION_KEY`
- [x] Keep `.env` and `apps/api/.env` in `.gitignore` at all times
- [x] Run with `sslmode=require` when connecting to remote PostgreSQL (Neon/Supabase)
- [x] Verify that CORS allows only the frontend origin (`APP_BASE_URL`)
