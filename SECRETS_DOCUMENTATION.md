# 🔐 Encrypted Secrets Configuration

This document explains how to use encrypted secrets for your JWT configuration.

## Overview

Your JWT secret has been encrypted using **AES-256-CBC** encryption for maximum security.

## Generated Values

### Original Secret (128 characters)
```
793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc67613815691ccc2ab55
```

### Encrypted Version
```
Encrypted: 0f8af7ed30305b3350945f5c102bf601c3e7ff1e1ac2046644227ba0aad0ec3f7a2d51c71af1565e009f0e7de6aa8ef24c811b6658a3ab7506ca6357fb9494994ff1f07de66f3481cd2d8080c7d8595f45306f1133190cafe6fecbee91f24ca6fa3efc178e8f725b801834d3f81022c6e7e0de7a9fabaac549410e32efc42fd48a4b6b6e4a26f73c21f265e3afd55f6c

Key: 9b49889c7bd5962fce66340125ae2d103cc1063606ca949d6b68e420d0f5faca

IV: 4883c316b4d12788445feb06dbe2edfa
```

### Base64 Encoded Version
```
NzkzZjEwNmNhNjlkZTEzZWI4MDRlYmNiMTEyZDQwM2NlMjFhMGJiZGJmNmZhNDdhNWRhNmFmYjIwMzlkNDUxMjVjOGZmNTIwMmI2NTFkYTJkZTgxYjI1MWM3YzcwNjk2ZTdhODdmNzQyOThkYzY3NjEzODE1NjkxY2NjMmFiNTU=
```

## Usage Options

### Option 1: Plain Secret (Current - Simplest)
Already configured in your `.env` file. Works immediately with no code changes.

```bash
JWT_SECRET="793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc67613815691ccc2ab55"
```

### Option 2: Base64 Encoded (Simple Obfuscation)
Provides basic encoding. Decode in your application code.

```bash
JWT_SECRET_BASE64="NzkzZjEwNmNhNjlkZTEzZWI4MDRlYmNiMTEyZDQwM2NlMjFhMGJiZGJmNmZhNDdhNWRhNmFmYjIwMzlkNDUxMjVjOGZmNTIwMmI2NTFkYTJkZTgxYjI1MWM3YzcwNjk2ZTdhODdmNzQyOThkYzY3NjEzODE1NjkxY2NjMmFiNTU="
```

**Decoding in code:**
```typescript
const jwtSecret = Buffer.from(process.env.JWT_SECRET_BASE64!, 'base64').toString('utf8');
```

### Option 3: AES-256 Encrypted (Highest Security)
Full encryption using AES-256-CBC. Best for production environments.

```bash
JWT_SECRET_ENCRYPTED="0f8af7ed30305b3350945f5c102bf601c3e7ff1e1ac2046644227ba0aad0ec3f7a2d51c71af1565e009f0e7de6aa8ef24c811b6658a3ab7506ca6357fb9494994ff1f07de66f3481cd2d8080c7d8595f45306f1133190cafe6fecbee91f24ca6fa3efc178e8f725b801834d3f81022c6e7e0de7a9fabaac549410e32efc42fd48a4b6b6e4a26f73c21f265e3afd55f6c"
JWT_ENCRYPTION_KEY="9b49889c7bd5962fce66340125ae2d103cc1063606ca949d6b68e420d0f5faca"
JWT_ENCRYPTION_IV="4883c316b4d12788445feb06dbe2edfa"
```

**Decrypting in code:**
```typescript
import { decryptSecret } from './utils/decrypt';

const jwtSecret = decryptSecret(
  process.env.JWT_SECRET_ENCRYPTED!,
  process.env.JWT_ENCRYPTION_KEY!,
  process.env.JWT_ENCRYPTION_IV!
);
```

## Security Best Practices

### For Development
✅ Use plain JWT_SECRET (Option 1) for convenience
✅ Never commit `.env` files to Git
✅ Use `.env.example` for sharing configuration structure

### For Production
✅ Use encrypted version (Option 3) with key stored in secure vault
✅ Store encryption key separately (AWS Secrets Manager, Azure Key Vault, etc.)
✅ Rotate secrets regularly
✅ Use environment-specific secrets
✅ Enable audit logging

### For GitHub Codespaces / Cloud Environments
✅ Use encrypted version (Option 3)
✅ Store encryption key as a Codespace secret
✅ Add decryption logic to your application startup
✅ Never hardcode secrets in your codebase

## Files

- `tools/encrypt-secret.mjs` - Script to generate new encrypted secrets
- `backend/src/utils/decrypt.ts` - Decryption utility functions
- `backend/.env.encrypted` - Example configuration with all options

## Re-generating Secrets

To generate a new encrypted secret:

```bash
node tools/encrypt-secret.mjs
```

This will create new encryption keys and encrypted values.

## Environment Variable Priority

1. `JWT_SECRET_ENCRYPTED` (if present with KEY and IV)
2. `JWT_SECRET_BASE64` (if present)
3. `JWT_SECRET` (fallback to plain)

---

**⚠️ IMPORTANT:** Never commit this file or your `.env` file to version control!
Store encryption keys securely and separately from encrypted values in production.
