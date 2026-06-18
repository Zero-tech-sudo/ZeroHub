# Security Specification for Firestore Security Rules

This document outlines the security invariants, vulnerable mock payloads, and test conditions for the Voidware Firestore rules.

## 1. Data Invariants
- **Authentication**: All writes must contain a valid Google authentication token.
- **Ownership**: Custom scripts and user configs can only be modified, created, or deleted by their verified owner (`request.auth.uid`).
- **Input Boundaries**:
  - `walkSpeed` must be between 16 and 250.
  - `jumpPower` must be between 50 and 300.
  - Character limit constraints are enforced for custom script URLs and descriptions.

## 2. The Dirty Dozen Payloads (Vulnerability Scenarios)
1. **Identity Spoofing**: Attempt to write another user's configuration data by modifying `userId`.
2. **Infinite WalkSpeed**: Update `walkSpeed` to `99999` to cause game clients to crash.
3. **Infinite JumpPower**: Update `jumpPower` to `99999` to avoid physics checks.
4. **Anonymous Configuration Manipulation**: Modify configurations without being authenticated.
5. **Third-Party Script Poisoning**: Attempt to delete another user's custom script.
6. **SQL/Lua Injection via ID**: Injected characters (e.g., `../root/hack`) into the configuration or custom script ID.
7. **Bypass Email Verification**: Action performed with unverified email (tested if requested).
8. **Malicious Giant Payload**: Script feature array exceeding size 100.
9. **Creation Splicing**: Set a client-side timestamp `createdAt` into the future.
10. **State Corruption**: Send a configuration with string values instead of numerical values for walkSpeed/jumpPower.
11. **Orphaned Writes**: Write configurations for a game that doesn't exist.
12. **Unauthorized Field Injection**: Inject a ghost field like `isAdmin: true` into a userConfig document.

## 3. Test Runner Definition (Verification Checklist)
All tests verify that these malicious attempts return `PERMISSION_DENIED` and ensure absolute safety.
