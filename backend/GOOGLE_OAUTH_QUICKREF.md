# Google OAuth Quick Reference

## Environment Variables

```env
# Development
GOOGLE_CLIENT_ID=271687975596-5a0f41j14riqi23oa109b320e897kap9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
GOOGLE_OAUTH_ADMIN_EMAILS=muchaeljohn739337@gmail.com,advanciapayledger@gmail.com

# Production (update redirect URI)
# GOOGLE_REDIRECT_URI=https://advanciapay.com/api/auth/google/callback
```

## Google Cloud Console Info

- **Project Name:** My First Project
- **Project ID:** ultimate-walker-478720-f2
- **Project Number:** 271687975596
- **OAuth Consent Type:** External
- **Console URL:** https://console.cloud.google.com/

## Store Credentials in Vault

```bash
# Run the Vault storage script
npx ts-node scripts/store-google-oauth-in-vault.ts

# Or manually with Vault CLI
vault kv put secret/google-oauth/GOOGLE_CLIENT_ID value="271687975596-5a0f41j14riqi23oa109b320e897kap9.apps.googleusercontent.com"
vault kv put secret/google-oauth/GOOGLE_CLIENT_SECRET value="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"
vault kv put secret/google-oauth/GOOGLE_REDIRECT_URI value="http://localhost:4000/api/auth/google/callback"
vault kv put secret/google-oauth/GOOGLE_OAUTH_ADMIN_EMAILS value="muchaeljohn739337@gmail.com,advanciapayledger@gmail.com"
```

## Admin JWT Tokens

### Token 1 (muchaeljohn739337@gmail.com)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDcxY2YyYS1hZDNhLTQ3MDQtOTViMS0yOTdiNDRjNDNiODgiLCJlbWFpbCI6Im11Y2hhZWxqb2huNzM5MzM3QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImdvb2dsZUlkIjoiMTAxODM0NzAzODc4NzYyNDg0MDU4IiwidHlwZSI6Imdvb2dsZSIsImlhdCI6MTc2NDczMzczNywiZXhwIjoxNzY1MzM4NTM3fQ.8-tdB1t9KM3KDA08Zcj26LNP0wvgDipVbNvFdbNRUOU
```

### Token 2 (advanciapayledger@gmail.com)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMDQwZWVmMC04ZWUwLTQ3ZDUtOTgyMC0xZjAyMjE1ZTcwNzUiLCJlbWFpbCI6ImFkdmFuY2lhcGF5bGVkZ2VyQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImdvb2dsZUlkIjoiMTExMDA5OTYzNzE3MjM5NTI2NjE1IiwidHlwZSI6Imdvb2dsZSIsImlhdCI6MTc2NDczMzcwNiwiZXhwIjoxNzY1MzM4NTA2fQ.SE-Hbb5HH6XZHQKqrYdXh9nDiYsDRorX1V-bK_6aG-s
```

## Test Admin Access

```powershell
# Using Token 1
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDcxY2YyYS1hZDNhLTQ3MDQtOTViMS0yOTdiNDRjNDNiODgiLCJlbWFpbCI6Im11Y2hhZWxqb2huNzM5MzM3QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImdvb2dsZUlkIjoiMTAxODM0NzAzODc4NzYyNDg0MDU4IiwidHlwZSI6Imdvb2dsZSIsImlhdCI6MTc2NDczMzczNywiZXhwIjoxNzY1MzM4NTM3fQ.8-tdB1t9KM3KDA08Zcj26LNP0wvgDipVbNvFdbNRUOU"
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:4000/api/admin/users" -Headers $headers
```

## OAuth Flow Endpoints

### 1. Initialize OAuth

```bash
POST /api/auth/google/init
Body: { "type": "admin" }
Response: { "authUrl": "https://accounts.google.com/..." }
```

### 2. Callback (redirected by Google)

```bash
GET /api/auth/google/callback?code=...
Response: { "token": "eyJ...", "user": {...} }
```

### 3. Status Check

```bash
GET /api/auth/google/status
Response: { "configured": true, "redirectUri": "..." }
```

## Production Deployment Checklist

- [ ] Update `GOOGLE_REDIRECT_URI` to production domain
- [ ] Add production domain to Google Cloud Console authorized redirect URIs
- [ ] Store credentials in Vault: `npx ts-node scripts/store-google-oauth-in-vault.ts`
- [ ] Set `VAULT_ENABLED=true` in production
- [ ] Remove temporary test endpoint `/api/test/get-token` from production
- [ ] Test OAuth flow with production URL
- [ ] Verify admin JWT bypasses IP whitelist
- [ ] Add test users to OAuth consent screen (if using External type)

## Security Notes

✅ **IP Whitelist Bypass:** Admin users with role=ADMIN bypass IP restrictions ✅ **Secret Protection:** Credentials
stored in Vault and encrypted database ✅ **Rate Limiting:** 10 OAuth attempts per 15 minutes per IP ✅ **Audit
Logging:** All OAuth attempts logged to audit_logs table ✅ **Token Expiration:** JWT tokens expire after 7 days

## Troubleshooting

### Vault Connection Issues

If Vault is not running, credentials fallback to `.env` file automatically.

### OAuth Errors

- Check Google Cloud Console credentials
- Verify redirect URI matches exactly
- Ensure OAuth consent screen is configured
- Check admin emails in `GOOGLE_OAUTH_ADMIN_EMAILS`

### Token Issues

- Tokens expire after 7 days, user must re-authenticate
- Verify JWT_SECRET is set in environment
- Check user has role=ADMIN in database
